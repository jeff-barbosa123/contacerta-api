import bcrypt from 'bcrypt';

export const usuarios = [
  {
    id: 1,
    nome: 'Admin',
    email: 'admin@contacerta.com',
    senha_hash: bcrypt.hashSync('admin123', 10),
    perfil: 'admin',
  },
];
