import { db, nextId, paginate } from './dbMemory.js';
import { obterPorId as obterProduto } from './produtoService.js';

// calcula total e atualiza estoque; registra "CMV movimento" implicitamente via dados do pedido
function calcularTotaisEAtualizarEstoque(itens) {
  let total = 0;
  for (const item of itens) {
    const prod = db.produtos.find(p => p.id === item.produto_id);
    if (!prod) throw Object.assign(new Error(`Produto ${item.produto_id} não encontrado`), { status: 400 });
    const qtd = Number(item.quantidade);
    if (prod.estoque < qtd) throw Object.assign(new Error(`Estoque insuficiente do produto ${prod.nome}`), { status: 422 });
    total += prod.preco * qtd;
  }
  // somente após validar tudo, debita estoque
  for (const item of itens) {
    const prod = db.produtos.find(p => p.id === item.produto_id);
    prod.estoque -= Number(item.quantidade);
  }
  return total;
}

export async function listar({ cliente, dataInicio, dataFim, status, page, limit }) {
  let items = [...db.pedidos];
  if (!Number.isNaN(cliente) && cliente) items = items.filter(p => p.cliente_id === Number(cliente));
  if (status) items = items.filter(p => (p.statusPedido || '').toLowerCase() === String(status).toLowerCase());
  if (dataInicio) items = items.filter(p => p.criadoEm >= new Date(dataInicio).toISOString());
  if (dataFim) items = items.filter(p => p.criadoEm <= new Date(dataFim).toISOString());
  return paginate(items, page, limit);
}

export async function criar(data) {
  const { cliente_id, itens, formaPagamento = 'Pix' } = data || {};
  if (!cliente_id || !Array.isArray(itens) || itens.length === 0) {
    throw Object.assign(new Error('cliente_id e itens são obrigatórios'), { status: 400 });
  }
  // valida produtos
  for (const it of itens) {
    if (!it.produto_id || !it.quantidade) throw Object.assign(new Error('Itens devem conter produto_id e quantidade'), { status: 400 });
    const prod = await obterProduto(Number(it.produto_id));
    if (!prod) throw Object.assign(new Error(`Produto ${it.produto_id} não encontrado`), { status: 400 });
  }

  const total = calcularTotaisEAtualizarEstoque(itens);
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
  return pedido;
}

export async function obterPorId(id) {
  return db.pedidos.find(p => p.id === id) || null;
}