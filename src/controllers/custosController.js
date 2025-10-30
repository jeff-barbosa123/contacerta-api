import * as custos from '../services/custosService.js';
import { successResponse, errorResponse } from '../utils/responses.js';

export async function listar(req, res, next) {
  try {
    const { periodo, tipo, page = 1, limit = 20 } = req.query;
    const data = await custos.listar({ periodo, tipo, page: Number(page), limit: Number(limit) });
    return res.status(200).json(successResponse(data, 'OK', 200));
  } catch (e) { next(e); }
}

export async function criar(req, res, next) {
  try {
    const data = await custos.criar(req.body);
    return res.status(201).json(successResponse(data, 'Custo criado com sucesso', 201));
  } catch (e) { next(e); }
}

export async function atualizar(req, res, next) {
  try {
    const item = await custos.atualizar(Number(req.params.id), req.body);
    return res.status(200).json(successResponse(item, 'Custo atualizado com sucesso', 200));
  } catch (e) { next(e); }
}

export async function remover(req, res, next) {
  try {
    await custos.remover(Number(req.params.id));
    return res.status(200).json(successResponse(true, 'Custo removido com sucesso', 200));
  } catch (e) { next(e); }
}

