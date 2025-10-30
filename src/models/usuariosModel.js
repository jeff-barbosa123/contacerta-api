import { db } from './database.js';

export const Usuarios = {
  findByEmail(email) {
    return db.usuarios.find(u => u.email === email) || null;
  },
  findById(id) {
    return db.usuarios.find(u => u.id === id) || null;
  },
  create({ email, senha, perfil = 'user', nome = null }) {
    const id = db.usuarios.length ? Math.max(...db.usuarios.map(u => u.id)) + 1 : 1;
    const novo = { id, email, senha, perfil, nome };
    db.usuarios.push(novo);
    return { id: novo.id, email: novo.email, perfil: novo.perfil, nome: novo.nome };
  },
  updatePasswordById(id, senhaHash) {
    const idx = db.usuarios.findIndex(u => u.id === id);
    if (idx === -1) return false;
    db.usuarios[idx].senha = senhaHash;
    return true;
  }
};

export const PasswordResets = {
  save(userId, tokenHash, expiresAt) {
    db.passwordResets.push({ userId, tokenHash, expiresAt, used: false });
    return true;
  },
  findValidByHash(tokenHash) {
    const now = new Date().toISOString();
    return db.passwordResets.find(r => r.tokenHash === tokenHash && r.used === false && r.expiresAt > now) || null;
  },
  consume(tokenHash) {
    const idx = db.passwordResets.findIndex(r => r.tokenHash === tokenHash && r.used === false);
    if (idx === -1) return false;
    db.passwordResets[idx].used = true;
    return true;
  }
};
