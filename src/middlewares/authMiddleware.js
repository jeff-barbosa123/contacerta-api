import jwt from 'jsonwebtoken';

/**
 * Middleware de autenticação JWT
 * Valida o token enviado no cabeçalho Authorization: Bearer <token>
 */
export function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

  // 🔎 Se não houver token, retorna erro 401
  if (!token) {
    return res.status(401).json({
      status: 401,
      mensagem: 'Acesso negado. Token JWT ausente. Faça login novamente.'
    });
  }

  try {
    // 🔐 Valida o token com a chave secreta definida no .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded; // Anexa os dados do usuário ao request
    next(); // Continua a execução
  } catch (error) {
    // ❌ Token inválido ou expirado
    return res.status(401).json({
      status: 401,
      mensagem: 'Token inválido ou expirado. Faça login novamente.'
    });
  }
}