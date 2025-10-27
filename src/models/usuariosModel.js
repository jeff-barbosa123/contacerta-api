import { db } from './database.js';

export const Usuarios = {
  findByEmail(email) {
    return db.usuarios.find(u => u.email === email) || null;
  }
};
