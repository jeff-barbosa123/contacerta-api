// ✅ Resposta de sucesso (200 OK por padrão)
export function successResponse(data, mensagem = 'Operação realizada com sucesso') {
  return {
    sucesso: true,
    status: 200,
    mensagem,
    data,
    timestamp: new Date().toISOString(),
  };
}

// ❌ Resposta de erro (500 por padrão)
export function errorResponse(status = 500, mensagem = 'Erro interno do servidor') {
  return {
    sucesso: false,
    status,
    mensagem,
    timestamp: new Date().toISOString(),
  };
}