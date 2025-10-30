import { db as baseDb } from '../models/database.js';

// Usa a mesma fonte de dados central definida em models/database.js
export const db = baseDb;

// Garante sequência incremental por tabela dentro de db
if (!db._seq) {
  db._seq = { clientes: 1, produtos: 1, pedidos: 1 };
}

export function nextId(tabela) {
  db._seq[tabela] = (db._seq[tabela] || 0) + 1;
  return db._seq[tabela];
}

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

