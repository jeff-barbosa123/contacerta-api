import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const USERS = [
  {
    id: 1,
    email: 'admin@contacerta.com',
    senha: 'admin123',
    nome: 'Administrador'
  }
];

/**
 * Controller de Login
 * Verifica credenciais e retorna token JWT
 */
export const login = (req, res) => {
  const { email, senha } = req.body;

  // Validação básica
  if (!email || !senha) {
    return res.status(400).json({ mensagem: 'E-mail e senha são obrigatórios.' });
  }

  // Busca o usuário "mock"
  const user = USERS.find(u => u.email === email && u.senha === senha);

  if (!user) {
    return res.status(401).json({ mensagem: 'Credenciais inválidas.' });
  }

  // Gera token JWT
  const token = jwt.sign(
    { id: user.id, email: user.email, nome: user.nome },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

  // Retorna o token
  return res.status(200).json({
    status: 200,
    mensagem: 'Login realizado com sucesso!',
    data: {
      usuario: { id: user.id, nome: user.nome, email: user.email },
      token
    }
  });
};

