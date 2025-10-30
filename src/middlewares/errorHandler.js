import { errorResponse } from '../utils/responses.js';

/**
 * Middleware global de tratamento de erros
 * Captura exceções de toda a aplicação e retorna resposta JSON padronizada
 */
export default function errorHandler(err, req, res, next) { // eslint-disable-line
  // 🔎 Loga o erro no console
  console.error('[ERRO]', err?.status || 500, err?.message || err);

  // 🔢 Define status e mensagem padrão
  const status = Number.isInteger(err?.status) ? err.status : 500;
  const mensagem = err?.message || 'Erro interno do servidor';
  const codigo = err?.codigo; // 🆕 v2.1.0 – suporte a codigo e detalhes
  const detalhes = err?.detalhes;

  // 📤 Retorna resposta estruturada
  return res.status(status).json(errorResponse(status, mensagem, codigo, detalhes));
}

// Também exporta nomeado, se precisar importar por { errorHandler }
export { errorHandler };
