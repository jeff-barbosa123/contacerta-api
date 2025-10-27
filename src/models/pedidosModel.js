import { db } from './database.js';

export const Pedidos = {
  list() { return db.pedidos; },
  create(data) {
    const id = db.pedidos.length ? Math.max(...db.pedidos.map(p => p.id)) + 1 : 1;
    const novo = { id, ...data, criadoEm: new Date().toISOString() };
    db.pedidos.push(novo);
    return novo;
  }
};
