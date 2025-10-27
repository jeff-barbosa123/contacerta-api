/**
 * 🧠 Banco de Dados em Memória (mock)
 * 
 * Estrutura central de armazenamento usada pelos services:
 * - clientes
 * - produtos
 * - pedidos
 * 
 * Cada entidade é armazenada em arrays locais e identificada por ID incremental.
 */

export const db = {
  _seq: { clientes: 1, produtos: 1, pedidos: 1 },

  clientes: [],

  produtos: [],

  pedidos: [
    // Exemplo de estrutura:
    // {
    //   id: 1,
    //   cliente_id: 1,
    //   itens: [{ produto_id: 1, qtd: 2 }],
    //   total: 59.90,
    //   formaPagamento: 'PIX',
    //   statusPedido: 'concluído',
    //   criadoEm: '2025-10-26T14:00:00Z'
    // }
  ]
};

/**
 * Retorna o próximo ID para uma tabela específica
 * @param {string} tabela - Nome da tabela (clientes, produtos, pedidos)
 * @returns {number} Próximo ID incremental
 */
export function nextId(tabela) {
  db._seq[tabela] = (db._seq[tabela] || 0) + 1;
  return db._seq[tabela];
}

/**
 * Pagina uma lista de itens genérica
 * @param {Array} items - Lista de registros
 * @param {number} page - Página atual (default 1)
 * @param {number} limit - Tamanho da página (default 20)
 * @returns {Object} Objeto com `items` e `pagination`
 */
export function paginate(items, page = 1, limit = 20) {
  const p = Math.max(1, Number(page) || 1);
  const l = Math.max(1, Number(limit) || 20);
  const start = (p - 1) * l;

  const paginated = items.slice(start, start + l);
  return {
    items: paginated,
    pagination: {
      page: p,
      limit: l,
      total: items.length,
      totalPages: Math.ceil(items.length / l)
    }
  };
}