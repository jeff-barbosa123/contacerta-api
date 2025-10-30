import dotenv from 'dotenv';
dotenv.config();

import jwt from 'jsonwebtoken';
import { login as authLogin, register as authRegister, changePassword as authChangePassword, forgotPassword as authForgotPassword, resetPassword as authResetPassword } from '../services/authService.js';
import { successResponse, errorResponse } from '../utils/responses.js';

/**
 * Controller de Login
 * Verifica credenciais via authService e retorna token JWT
 */
export const login = async (req, res) => {
  const { email, senha } = req.body;

  // 🧩 Validação básica
  if (!email || !senha) {
    return res
      .status(400)
      .json(errorResponse(400, 'E-mail e senha são obrigatórios.'));
  }

  try {
    // 🔐 Validação via service (ex.: banco de dados ou mock)
    const auth = await authLogin(email, senha);

    const usuario = {
      id: auth.id,
      nome:
        auth.perfil === 'admin'
          ? 'Administrador'
          : auth.email?.split('@')[0] || 'Usuário',
      email: auth.email,
    };

    // ✅ Resposta de sucesso padronizada
    return res
      .status(200)
      .json(successResponse({ usuario, token: auth.token }, 'Login realizado com sucesso!'));

  } catch (e) {
    // 🧠 Fallback compatível com mock local
    if (email === 'admin@contacerta.com' && senha === 'admin123') {
      const usuario = { id: 1, nome: 'Administrador', email };
      const token = jwt.sign(
        { id: usuario.id, email: usuario.email },
        process.env.JWT_SECRET || 'super-secret-contacerta',
        { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
      );

      return res
        .status(200)
        .json(successResponse({ usuario, token }, 'Login realizado com sucesso!'));
    }

    // ❌ Resposta de erro padronizada
    const status = e?.status || 401;
    const mensagem = e?.mensagem || 'Credenciais inválidas.';
    return res.status(status).json(errorResponse(status, mensagem));
  }
};

/**
 * Controller de Registro
 * Cria um novo usuário e retorna token JWT
 */
export const register = async (req, res) => {
  const { email, senha, perfil, nome } = req.body || {};

  if (!email || !senha) {
    return res.status(400).json(errorResponse(400, 'E-mail e senha são obrigatórios.'));
  }
  try {
    const novo = await authRegister(email, senha, perfil, nome);
    const usuario = {
      id: novo.id,
      nome: novo.nome || (novo.perfil === 'admin' ? 'Administrador' : (novo.email?.split('@')[0] || 'Usuário')),
      email: novo.email
    };
    return res.status(201).json(successResponse({ usuario, token: novo.token }, 'Usuário criado com sucesso!', 201));
  } catch (e) {
    const status = e?.status || 500;
    const mensagem = e?.mensagem || 'Erro ao registrar usuário.';
    return res.status(status).json(errorResponse(status, mensagem));
  }
};

/**
 * Controller de Alteração de Senha
 * Protegido por JWT. Requer { senhaAtual, novaSenha }.
 */
export const changePassword = async (req, res) => {
  const { senhaAtual, novaSenha } = req.body || {};
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json(errorResponse(401, 'Não autenticado'));
  }
  if (!senhaAtual || !novaSenha) {
    return res.status(400).json(errorResponse(400, 'Campos obrigatórios: senhaAtual e novaSenha'));
  }
  try {
    await authChangePassword(userId, senhaAtual, novaSenha);
    return res.status(200).json(successResponse(true, 'Senha alterada com sucesso', 200));
  } catch (e) {
    const status = e?.status || 500;
    const mensagem = e?.mensagem || 'Erro ao alterar senha';
    return res.status(status).json(errorResponse(status, mensagem));
  }
};

/**
 * Esqueci minha senha: sempre responde 200
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body || {};
  try {
    const result = await authForgotPassword(email);
    // Em dev, retornamos o token para facilitar testes
    return res.status(200).json(successResponse({ enviado: true, token: result.token }, 'Se existir, enviaremos instruções para reset de senha', 200));
  } catch (e) {
    return res.status(200).json(successResponse({ enviado: true }, 'Se existir, enviaremos instruções para reset de senha', 200));
  }
};

/**
 * Reset de senha por token
 */
export const resetPassword = async (req, res) => {
  const { token, novaSenha } = req.body || {};
  if (!token || !novaSenha) {
    return res.status(400).json(errorResponse(400, 'Campos obrigatórios: token e novaSenha'));
  }
  try {
    await authResetPassword(token, novaSenha);
    return res.status(200).json(successResponse(true, 'Senha redefinida com sucesso', 200));
  } catch (e) {
    const status = e?.status || 500;
    const mensagem = e?.mensagem || 'Erro ao redefinir senha';
    return res.status(status).json(errorResponse(status, mensagem));
  }
};
