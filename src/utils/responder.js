export const ok=(res,dados,status=200,mensagem='Sucesso')=>res.status(status).json({status,mensagem,dados});
export const erro=(res,status,mensagem,detalhes=null)=>res.status(status).json({status,mensagem,detalhes});
