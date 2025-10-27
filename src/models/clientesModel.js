import { db } from './database.js';

export const Clientes = {
  list() { return db.clientes; },
  create(data) {
    const id = db.clientes.length ? Math.max(...db.clientes.map(c => c.id)) + 1 : 1;
    const novo = { id, ...data };
    db.clientes.push(novo);
    return novo;
  },
  update(id, data) {
    const idx = db.clientes.findIndex(c => c.id === id);
    if (idx === -1) return null;
    db.clientes[idx] = { ...db.clientes[idx], ...data };
    return db.clientes[idx];
  },
  remove(id) {
    const idx = db.clientes.findIndex(c => c.id === id);
    if (idx === -1) return false;
    db.clientes.splice(idx, 1);
    return true;
  }
};
