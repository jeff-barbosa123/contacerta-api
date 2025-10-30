// 🆕 v2.1.0 – Padronização de responses
const statusToDefaultCode = (status) => {
  switch (Number(status)) {
    case 400: return 'ERR_VALIDACAO_CAMPOS';
    case 401: return 'ERR_NAO_AUTENTICADO';
    case 403: return 'ERR_NAO_AUTORIZADO';
    case 404: return 'ERR_NAO_ENCONTRADO';
    case 409: return 'ERR_CONFLITO';
    case 422: return 'ERR_NEGOCIO';
    default: return 'ERR_INTERNO';
  }
};

export function successResponse(data, mensagem = 'Operação realizada com sucesso', _statusCode = 200) {
  const metas = {};
  if (data && typeof data === 'object') {
    if (Object.prototype.hasOwnProperty.call(data, 'avisosEstoque')) metas.avisosEstoque = data.avisosEstoque;
    if (Object.prototype.hasOwnProperty.call(data, 'sugestao')) metas.sugestao = data.sugestao;
  }
  return {
    success: true,
    mensagem,
    ...metas,
    data,
    timestamp: new Date().toISOString(),
  };
}

export function errorResponse(status = 500, mensagem = 'Erro interno do servidor', codigo, detalhes) {
  return {
    success: false,
    codigo: codigo || statusToDefaultCode(status),
    mensagem,
    ...(Array.isArray(detalhes) && detalhes.length ? { detalhes } : {}),
    timestamp: new Date().toISOString(),
  };
}