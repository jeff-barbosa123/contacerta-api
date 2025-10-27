import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Usuarios } from '../models/usuariosModel.js';

/**
 * Serviço responsável por autenticar o usuário e gerar o token JWT
 */
export async function login(email, senha) {
  // Busca o usuário pelo e-mail no "banco" em memória
  const usuario = Usuarios.findByEmail(email);

  if (!usuario) {
    throw { status: 401, mensagem: 'Usuário não encontrado' };
  }

  // Compara a senha enviada com o hash armazenado
  const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
  if (!senhaCorreta) {
    throw { status: 401, mensagem: 'Usuário ou senha incorretos' };
  }

  // Gera o token JWT
  const token = jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      perfil: usuario.perfil
    },
    process.env.JWT_SECRET || 'super-secret-contacerta',
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

  // Retorna os dados do usuário autenticado
  return {
    id: usuario.id,
    email: usuario.email,
    perfil: usuario.perfil,
    token
  };
}