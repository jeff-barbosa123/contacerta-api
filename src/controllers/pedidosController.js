import * as pedidos from '../services/pedidosService.js';
import { successResponse, errorResponse } from '../utils/responses.js';

export async function listarComFiltros(req, res, next) {
  try {
    const { cliente, dataInicio, dataFim, status, page = 1, limit = 20 } = req.query;
    const data = await pedidos.listar({ cliente: Number(cliente), dataInicio, dataFim, status, page: Number(page), limit: Number(limit) });
    return res.status(200).json(successResponse(data, 'OK', 200));
  } catch (e) { next(e); }
}

export async function criar(req, res, next) {
  try {
    const pedido = await pedidos.criar(req.body);
    return res.status(201).json(successResponse(pedido, 'Pedido criado', 201));
  } catch (e) { next(e); }
}

export async function obterPorId(req, res, next) {
  try {
    const item = await pedidos.obterPorId(Number(req.params.id));
    if (!item) return res.status(404).json(errorResponse(404, 'Pedido não encontrado', 'ERR_PEDIDO_INEXISTENTE'));
    return res.status(200).json(successResponse(item, 'OK', 200));
  } catch (e) { next(e); }
}


