import { db, nextId, paginate } from './dbMemory.js';
import { obterPorId as obterProduto } from './produtoService.js';

/**
 * Calcula total e atualiza estoque
 */
function calcularTotaisEAtualizarEstoque(itens) {
  let total = 0;
  for (const item of itens) {
    const prod = db.produtos.find(p => p.id === item.produto_id);
    if (!prod) throw new Error(`Produto ${item.produto_id} não encontrado.`);
    const qtd = Number(item.quantidade);
    if (prod.estoque < qtd)
      throw new Error(`Estoque insuficiente para o produto "${prod.nome}".`);
    total += prod.preco * qtd;
  }

  // Só debita estoque após validação total
  for (const item of itens) {
    const prod = db.produtos.find(p => p.id === item.produto_id);
    prod.estoque -= Number(item.quantidade);
  }

  return total;
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
 * Cria novo pedido com validação e tratamento de erro
 */
export async function criar(data) {
  try {
    const { cliente_id, itens, formaPagamento = 'Pix' } = data || {};
    if (!cliente_id || !Array.isArray(itens) || itens.length === 0) {
      throw new Error('cliente_id e itens são obrigatórios.');
    }

    for (const it of itens) {
      if (!it.produto_id || !it.quantidade)
        throw new Error('Itens devem conter produto_id e quantidade.');
      const prod = await obterProduto(Number(it.produto_id));
      if (!prod) throw new Error(`Produto ${it.produto_id} não encontrado.`);
    }

    const total = calcularTotaisEAtualizarEstoque(itens);
    const pedido = {
      id: nextId('pedidos'),
      cliente_id: Number(cliente_id),
      itens: itens.map(i => ({
        produto_id: Number(i.produto_id),
        quantidade: Number(i.quantidade)
      })),
      total: Number(total.toFixed(2)),
      formaPagamento,
      statusPedido: 'Concluído',
      criadoEm: new Date().toISOString()
    };

    db.pedidos.push(pedido);
    return { success: true, message: 'Pedido criado com sucesso.', data: pedido };
  } catch (error) {
    console.error('[PedidosService] Erro ao criar pedido:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Busca pedido por ID
 */
export async function obterPorId(id) {
  const pedido = db.pedidos.find(p => p.id === id) || null;
  if (!pedido) return { success: false, message: 'Pedido não encontrado.' };
  return { success: true, data: pedido };
}
