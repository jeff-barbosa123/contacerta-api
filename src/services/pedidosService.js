import { db, nextId, paginate } from './dbMemory.js';
import { obterPorId as obterProduto } from './produtoService.js';

// 🆕 v2.1.0 – Calcula total e atualiza estoque, emitindo alerta quando estoque <= 5
function calcularTotaisEAtualizarEstoque(itens) {
  let total = 0;
  const avisos = [];
  for (const item of itens) {
    const prod = db.produtos.find(p => p.id === item.produto_id);
    if (!prod) throw new Error(`Produto ${item.produto_id} nao encontrado.`);
    const qtd = Number(item.quantidade);
    if (prod.estoque < qtd) throw new Error(`Estoque insuficiente para o produto "${prod.nome}".`);
    total += prod.preco * qtd;
  }
  for (const item of itens) {
    const prod = db.produtos.find(p => p.id === item.produto_id);
    prod.estoque -= Number(item.quantidade);
    if (Number(prod.estoque) <= 5) {
      // 🆕 v2.1.0 – Alerta de estoque baixo (console + resposta)
      const aviso = `Produto ${prod.nome} esta com estoque baixo (${prod.estoque} unidades).`;
      console.warn(aviso);
      avisos.push(aviso);
    }
  }
  return { total, avisos };
}

// Lista pedidos com filtros opcionais
export async function listar({ cliente, dataInicio, dataFim, status, page, limit }) {
  let items = [...db.pedidos];
  if (!Number.isNaN(cliente) && cliente) items = items.filter(p => p.cliente_id === Number(cliente));
  if (status) items = items.filter(p => (p.statusPedido || '').toLowerCase() === String(status).toLowerCase());
  if (dataInicio) items = items.filter(p => p.criadoEm >= new Date(dataInicio).toISOString());
  if (dataFim) items = items.filter(p => p.criadoEm <= new Date(dataFim).toISOString());
  return paginate(items, page, limit);
}

// 🆕 v2.1.0 – Cria pedido com validacoes e retorna avisosEstoque (nao bloqueia)
export async function criar(data) {
  const { cliente_id, itens, formaPagamento = 'Pix' } = data || {};
  if (!cliente_id) { const err = new Error('cliente_id e obrigatorio.'); err.status = 400; err.codigo = 'ERR_VALIDACAO_CAMPOS'; err.detalhes = [{ campo: 'cliente_id', erro: 'Obrigatorio' }]; throw err; }
  const cliente = db.clientes.find(c => c.id === Number(cliente_id));
  if (!cliente) { const err = new Error('Cliente nao encontrado.'); err.status = 404; err.codigo = 'ERR_CLIENTE_INEXISTENTE'; throw err; }
  if (!Array.isArray(itens) || itens.length === 0) { const err = new Error('Itens sao obrigatorios.'); err.status = 400; err.codigo = 'ERR_VALIDACAO_CAMPOS'; err.detalhes = [{ campo: 'itens', erro: 'Lista vazia ou ausente' }]; throw err; }

  const insuficientes = [];
  const necessidadeIngredientes = new Map();
  for (const it of itens) {
    if (!it || it.produto_id === undefined || it.quantidade === undefined) {
      const err = new Error('Itens devem conter produto_id e quantidade.'); err.status = 400; err.codigo = 'ERR_VALIDACAO_CAMPOS'; err.detalhes = [{ campo: 'itens[]', erro: 'produto_id e quantidade sao obrigatorios' }]; throw err;
    }
    const qtd = Number(it.quantidade);
    if (!Number.isInteger(qtd) || qtd <= 0) { const err = new Error('Quantidade deve ser inteiro > 0.'); err.status = 400; err.codigo = 'ERR_PARAMETROS_INVALIDOS'; err.detalhes = [{ campo: 'quantidade', erro: 'Valor invalido' }]; throw err; }
    const prod = await obterProduto(Number(it.produto_id));
    if (!prod) { const err = new Error(`Produto ${it.produto_id} nao encontrado.`); err.status = 404; err.codigo = 'ERR_PRODUTO_INEXISTENTE'; throw err; }
    if (prod.estoque < qtd) { insuficientes.push({ produto_id: prod.id, erro: `Solicitado ${qtd}, disponivel ${prod.estoque}` }); }
    // acumula necessidade de ingredientes conforme receita
    const rec = db.receitas.find(r => r.produto_id === Number(it.produto_id));
    if (rec && Array.isArray(rec.itens)) {
      for (const ritem of rec.itens) {
        const totalNec = Number(ritem.quantidade) * qtd;
        necessidadeIngredientes.set(ritem.ingrediente_id, (necessidadeIngredientes.get(ritem.ingrediente_id) || 0) + totalNec);
      }
    }
  }
  if (insuficientes.length) { const err = new Error('Estoque insuficiente para um ou mais itens.'); err.status = 422; err.codigo = 'ERR_ESTOQUE_INSUFICIENTE'; err.detalhes = insuficientes; throw err; }

  // 🆕 v2.1.0 – Valida estoque de ingredientes somado (quando houver receita/BOM)
  const insufIng = [];
  for (const [ingId, qtdNec] of necessidadeIngredientes.entries()) {
    const ing = db.ingredientes.find(i => i.id === Number(ingId));
    if (!ing) { insufIng.push({ ingrediente_id: ingId, erro: 'Ingrediente nao cadastrado' }); continue; }
    if (Number(ing.estoque) < Number(qtdNec)) {
      insufIng.push({ ingrediente_id: ingId, erro: `Necessario ${qtdNec}, disponivel ${ing.estoque}` });
    }
  }
  if (insufIng.length) { const err = new Error('Estoque insuficiente de ingredientes.'); err.status = 422; err.codigo = 'ERR_ESTOQUE_INSUFICIENTE'; err.detalhes = insufIng; throw err; }

  const { total, avisos } = calcularTotaisEAtualizarEstoque(itens);
  // 🆕 v2.1.0 – Debita ingredientes conforme necessidade acumulada
  for (const [ingId, qtdNec] of necessidadeIngredientes.entries()) {
    const ing = db.ingredientes.find(i => i.id === Number(ingId));
    if (ing) ing.estoque = Number(ing.estoque) - Number(qtdNec);
  }
  const pedido = {
    id: nextId('pedidos'),
    cliente_id: Number(cliente_id),
    itens: itens.map(i => ({ produto_id: Number(i.produto_id), quantidade: Number(i.quantidade) })),
    total: Number(total.toFixed(2)),
    formaPagamento,
    statusPedido: 'Concluido',
    criadoEm: new Date().toISOString()
  };
  db.pedidos.push(pedido);

  // 🆕 v2.1.0 – Retorna avisosEstoque somente quando houver alertas
  const meta = avisos && avisos.length ? { avisosEstoque: avisos } : {};
  return { ...meta, pedidoId: pedido.id, total: pedido.total };
}

// Busca pedido por ID (retorna objeto ou null)
export async function obterPorId(id) {
  return db.pedidos.find(p => p.id === id) || null;
}
