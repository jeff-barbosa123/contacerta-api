import { db, nextId, paginate } from './dbMemory.js';
import { obterPorId as obterProduto } from './produtoService.js';

/**
 * Calcula total e atualiza estoque
 */
function calcularTotaisEAtualizarEstoque(itens) {
  let total = 0;
  const avisos = [];
  for (const item of itens) {
    const prod = db.produtos.find(p => p.id === item.produto_id);
    if (!prod) throw new Error(`Produto ${item.produto_id} nÃ£o encontrado.`);
    const qtd = Number(item.quantidade);
    if (prod.estoque < qtd)
      throw new Error(`Estoque insuficiente para o produto "${prod.nome}".`);
    total += prod.preco * qtd;
  }

  // SÃ³ debita estoque apÃ³s validaÃ§Ã£o total
  for (const item of itens) {
    const prod = db.produtos.find(p => p.id === item.produto_id);
    prod.estoque -= Number(item.quantidade);
    // Novo: quando estoque ficar <= 5, gera aviso e registra no console
    if (Number(prod.estoque) <= 5) {
      const msg = `AVISO: Produto ${prod.nome} estÃ¡ com estoque baixo (${prod.estoque} unidades)`;
      console.warn(msg);
      avisos.push(`Estoque baixo para ${prod.nome}`);
    }
  }

  // Novo: retorna total e lista de avisos de estoque baixo
  return { total, avisos };
}

/**
 * Lista pedidos com filtros opcionais
 */
export async function listar({ cliente, dataInicio, dataFim, status, page, limit }) {
  let items = [...db.pedidos];
  if (!Number.isNaN(cliente) && cliente) items = items.filter(p => p.cliente_id === Number(cliente));
  if (status) items = items.filter(p => (p.statusPedido || '').toLowerCase() === String(status).toLowerCase());
  if (dataInicio) items = items.filter(p => p.criadoEm >= new Date(dataInicio).toISOString());
  if (dataFim) items = items.filter(p => p.criadoEm <= new Date(dataFim).toISOString());
  return paginate(items, page, limit);
}

/**
 * Cria novo pedido com validaÃ§Ã£o e tratamento de erro
 */
export async function criar(data) {
  // 🆕 v2.1.0 – validações obrigatórias + retorno com avisosEstoque
  const { cliente_id, itens, formaPagamento = "Pix" } = data || {};
  if (!cliente_id) {
    const err = new Error('cliente_id é obrigatório.');
    err.status = 400; err.codigo = 'ERR_VALIDACAO_CAMPOS'; err.detalhes = [{ campo: 'cliente_id', erro: 'Obrigatório' }];
    throw err;
  }
  const cliente = db.clientes.find(c => c.id === Number(cliente_id));
  if (!cliente) {
    const err = new Error('Cliente não encontrado.');
    err.status = 404; err.codigo = 'ERR_CLIENTE_INEXISTENTE';
    throw err;
  }
  if (!Array.isArray(itens) || itens.length === 0) {
    const err = new Error('Itens são obrigatórios.');
    err.status = 400; err.codigo = 'ERR_VALIDACAO_CAMPOS'; err.detalhes = [{ campo: 'itens', erro: 'Lista vazia ou ausente' }];
    throw err;
  }
  // valida itens e estoque suficiente (sem debitar ainda)
  const insuficientes = [];
  for (const it of itens) {
    if (!it || it.produto_id === undefined || it.quantidade === undefined) {
      const err = new Error('Itens devem conter produto_id e quantidade.');
      err.status = 400; err.codigo = 'ERR_VALIDACAO_CAMPOS';
      err.detalhes = [{ campo: 'itens[]', erro: 'produto_id e quantidade são obrigatórios' }];
      throw err;
    }
    const qtd = Number(it.quantidade);
    if (!Number.isInteger(qtd) || qtd <= 0) {
      const err = new Error('Quantidade deve ser inteiro > 0.');
      err.status = 400; err.codigo = 'ERR_PARAMETROS_INVALIDOS';
      err.detalhes = [{ campo: 'quantidade', erro: 'Valor inválido' }];
      throw err;
    }
    const prod = await obterProduto(Number(it.produto_id));
    if (!prod) {
      const err = new Error(`Produto ${it.produto_id} não encontrado.`);
      err.status = 404; err.codigo = 'ERR_PRODUTO_INEXISTENTE';
      throw err;
    }
    if (prod.estoque < qtd) {
      insuficientes.push({ produto_id: prod.id, erro: `Solicitado ${qtd}, disponível ${prod.estoque}` });
    }
  }
  if (insuficientes.length) {
    const err = new Error('Estoque insuficiente para um ou mais itens.');
    err.status = 422; err.codigo = 'ERR_ESTOQUE_INSUFICIENTE'; err.detalhes = insuficientes;
    throw err;
  }

  const { total, avisos } = calcularTotaisEAtualizarEstoque(itens);
  const pedido = {
    id: nextId('pedidos'),
    cliente_id: Number(cliente_id),
    itens: itens.map(i => ({ produto_id: Number(i.produto_id), quantidade: Number(i.quantidade) })),
    total: Number(total.toFixed(2)),
    formaPagamento,
    statusPedido: 'Concluído',
    criadoEm: new Date().toISOString()
  };
  db.pedidos.push(pedido);

  // retorna dados e avisosEstoque (hoisted por successResponse)
  return { avisosEstoque: avisos, data: { pedidoId: pedido.id, total: pedido.total } };
}

/**
 * Busca pedido por ID
 */
export async function obterPorId(id) {
  // 🆕 v2.1.0 – retorna pedido ou null (controller trata 404)
  const pedido = db.pedidos.find(p => p.id === id) || null;
  return pedido;
}

