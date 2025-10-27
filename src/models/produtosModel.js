import { db } from './database.js';

export const Produtos = {
  list() { return db.produtos; },
  create(data) {
    const id = db.produtos.length ? Math.max(...db.produtos.map(p => p.id)) + 1 : 1;
    const novo = { id, ...data };
    db.produtos.push(novo);
    return novo;
  },
  update(id, data) {
    const idx = db.produtos.findIndex(p => p.id === id);
    if (idx === -1) return null;
    db.produtos[idx] = { ...db.produtos[idx], ...data };
    return db.produtos[idx];
  },
  remove(id) {
    const idx = db.produtos.findIndex(p => p.id === id);
    if (idx === -1) return false;
    db.produtos.splice(idx, 1);
    return true;
  }
};
