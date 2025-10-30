import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Usuarios, PasswordResets } from '../models/usuariosModel.js';

// Autentica e retorna { id, email, perfil, token }
export async function login(email, senha) {
  if (!email || !senha) {
    throw { status: 400, codigo: 'ERR_VALIDACAO_CAMPOS', mensagem: 'E-mail e senha são obrigatórios' };
  }
  const usuario = Usuarios.findByEmail(email);
  if (!usuario) {
    throw { status: 401, codigo: 'ERR_CREDENCIAIS_INVALIDAS', mensagem: 'Credenciais inválidas. Verifique e tente novamente.' };
  }
  const ok = await bcrypt.compare(senha, usuario.senha);
  if (!ok) {
    throw { status: 401, codigo: 'ERR_CREDENCIAIS_INVALIDAS', mensagem: 'Credenciais inválidas. Verifique e tente novamente.' };
  }
  const token = jwt.sign(
    { id: usuario.id, email: usuario.email, perfil: usuario.perfil },
    process.env.JWT_SECRET || 'super-secret-contacerta',
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
  return { id: usuario.id, email: usuario.email, perfil: usuario.perfil, token };
}

// Registra novo usuÃ¡rio e retorna { id, email, perfil, token }
export async function register(email, senha, perfil = 'user', nome = null) {
  if (!email || !senha) {
    throw { status: 400, codigo: 'ERR_VALIDACAO_CAMPOS', mensagem: 'E-mail e senha são obrigatórios' };
  }
  // E-mail: algo@dominio.tld (tld com pelo menos 2 chars) e sem espaÃ§os
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    throw { status: 400, codigo: 'ERR_VALIDACAO_CAMPOS', mensagem: 'E-mail inválido' };
  }
  // Senha forte: 8+ caracteres, contendo min. 1 minÃºscula, 1 maiÃºscula, 1 dÃ­gito e 1 caractere especial
  const hasLower = /[a-z]/.test(senha);
  const hasUpper = /[A-Z]/.test(senha);
  const hasDigit = /\d/.test(senha);
  const hasSpecial = /[^A-Za-z0-9]/.test(senha);
  if (senha.length < 8 || !hasLower || !hasUpper || !hasDigit || !hasSpecial) {
    throw { status: 400, codigo: 'ERR_SENHA_FRACA', mensagem: 'Senha fraca: mín. 8 caracteres, com maiúscula, minúscula, número e caractere especial' };
  }
  const existente = Usuarios.findByEmail(email);
  if (existente) {
    throw { status: 409, codigo: 'ERR_CONFLITO', mensagem: 'E-mail já cadastrado' };
  }
  const hash = await bcrypt.hash(senha, 10);
  const criado = Usuarios.create({ email, senha: hash, perfil, nome });
  const token = jwt.sign(
    { id: criado.id, email: criado.email, perfil: criado.perfil },
    process.env.JWT_SECRET || 'super-secret-contacerta',
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
  return { ...criado, token };
}

// helper interno para validar forÃ§a da senha
function validarSenhaForte(senha) {
  const hasLower = /[a-z]/.test(senha);
  const hasUpper = /[A-Z]/.test(senha);
  const hasDigit = /\d/.test(senha);
  const hasSpecial = /[^A-Za-z0-9]/.test(senha);
  if (senha.length < 8 || !hasLower || !hasUpper || !hasDigit || !hasSpecial) {
    throw { status: 400, codigo: 'ERR_SENHA_FRACA', mensagem: 'Senha fraca: mín. 8 caracteres, com maiúscula, minúscula, número e caractere especial' };
  }
}

// Altera a senha do usuÃ¡rio autenticado
export async function changePassword(userId, senhaAtual, novaSenha) {
  if (!senhaAtual || !novaSenha) {
    throw { status: 400, codigo: 'ERR_VALIDACAO_CAMPOS', mensagem: 'Campos obrigatórios: senhaAtual e novaSenha' };
  }
  validarSenhaForte(novaSenha);

  const usuario = Usuarios.findById(Number(userId));
  if (!usuario) {
    throw { status: 401, codigo: 'ERR_NAO_AUTENTICADO', mensagem: 'Não autenticado' };
  }
  const ok = await bcrypt.compare(senhaAtual, usuario.senha);
  if (!ok) {
    throw { status: 401, codigo: 'ERR_CREDENCIAIS_INVALIDAS', mensagem: 'Senha atual incorreta' };
  }
  const novoHash = await bcrypt.hash(novaSenha, 10);
  const updated = Usuarios.updatePasswordById(usuario.id, novoHash);
  if (!updated) {
    throw { status: 500, codigo: 'ERR_INTERNO', mensagem: 'Não foi possível atualizar a senha' };
  }
  return true;
}

// Solicita reset de senha (sempre responde 200)
export async function forgotPassword(email) {
  // valida formato de e-mail, porÃ©m responde 200 mesmo se invÃ¡lido para nÃ£o revelar existÃªncia
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const existsFormat = email && emailRegex.test(email);
  const usuario = existsFormat ? Usuarios.findByEmail(email) : null;
  if (usuario) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 min
    PasswordResets.save(usuario.id, tokenHash, expiresAt);
    // Em dev/test, retornamos o token para facilitar testes; em produÃ§Ã£o, apenas logar/enviar e-mail
    const includeToken = (process.env.NODE_ENV || 'development') !== 'production';
    return { ok: true, token: includeToken ? rawToken : undefined };
  }
  return { ok: true };
}

// Reseta senha usando token
export async function resetPassword(token, novaSenha) {
  if (!token || !novaSenha) {
    throw { status: 400, codigo: 'ERR_VALIDACAO_CAMPOS', mensagem: 'Campos obrigatórios: senhaAtual e novaSenha' };
  }
  validarSenhaForte(novaSenha);
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const record = PasswordResets.findValidByHash(tokenHash);
  if (!record) {
    throw { status: 401, codigo: 'ERR_TOKEN_INVALIDO', mensagem: 'Token inválido ou expirado' };
  }
  const novoHash = await bcrypt.hash(novaSenha, 10);
  const updated = Usuarios.updatePasswordById(record.userId, novoHash);
  if (!updated) {
    throw { status: 500, codigo: 'ERR_INTERNO', mensagem: 'Não foi possível atualizar a senha' };
  }
  PasswordResets.consume(tokenHash);
  return true;
}

