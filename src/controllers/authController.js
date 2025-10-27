import dotenv from 'dotenv';
dotenv.config();

import jwt from 'jsonwebtoken';
import { login as authLogin } from '../services/authService.js';
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
