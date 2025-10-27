import * as pedidos from '../services/pedidosService.js';

export async function listarComFiltros(req, res, next) {
  try {
    const { cliente, dataInicio, dataFim, status, page = 1, limit = 20 } = req.query;
    const data = await pedidos.listar({ cliente: Number(cliente), dataInicio, dataFim, status, page: Number(page), limit: Number(limit) });
    res.json({ status: 200, mensagem: 'OK', data });
  } catch (e) { next(e); }
}
export async function criar(req, res, next) {
  try {
    const pedido = await pedidos.criar(req.body); // calcula CMV automaticamente
    res.status(201).json({ status: 201, mensagem: 'Pedido criado', data: pedido });
  } catch (e) { next(e); }
}
export async function obterPorId(req, res, next) {
  try {
    const item = await pedidos.obterPorId(Number(req.params.id));
    if (!item) return res.status(404).json({ status: 404, mensagem: 'Pedido não encontrado' });
    res.json({ status: 200, mensagem: 'OK', data: item });
  } catch (e) { next(e); }
}