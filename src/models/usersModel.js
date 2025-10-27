import bcrypt from 'bcrypt';
const adminPass = await bcrypt.hash('admin123', 10);
export const users = [
  { id: 1, nome: 'Admin', email: 'admin@contacerta.com', senha: adminPass, role: 'admin' },
  { id: 2, nome: 'Empreendedor', email: 'emp@contacerta.com', senha: adminPass, role: 'empreendedor' },
  { id: 3, nome: 'Colaborador', email: 'colab@contacerta.com', senha: adminPass, role: 'colaborador' }
];