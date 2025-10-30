export function successResponse(data, mensagem = 'Operação realizada com sucesso', statusCode = 200) {
  return {
    sucesso: true,
    status: statusCode,
    mensagem,
    data,
    timestamp: new Date().toISOString(),
  };
}

export function errorResponse(status = 500, mensagem = 'Erro interno do servidor') {
  return {
    sucesso: false,
    status,
    mensagem,
    timestamp: new Date().toISOString(),
  };
}

