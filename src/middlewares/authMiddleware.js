import jwt from 'jsonwebtoken';

// Middleware de autenticação JWT
export function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      status: 401,
      mensagem: 'Acesso negado. Token JWT ausente. Faça login novamente.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-contacerta');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 401,
      mensagem: 'Token inválido ou expirado. Faça login novamente.'
    });
  }
}

