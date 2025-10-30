import * as perdas from '../services/perdasService.js';
import { successResponse } from '../utils/responses.js';

export async function listar(req, res, next) {
  try {
    const { periodo, tipo, page = 1, limit = 20 } = req.query;
    const data = await perdas.listar({ periodo, tipo, page: Number(page), limit: Number(limit) });
    return res.status(200).json(successResponse(data, 'OK', 200));
  } catch (e) { next(e); }
}

export async function criar(req, res, next) {
  try {
    const data = await perdas.criar(req.body);
    return res.status(201).json(successResponse(data, 'Perda registrada com sucesso', 201));
  } catch (e) { next(e); }
}

export async function atualizar(req, res, next) {
  try {
    const item = await perdas.atualizar(Number(req.params.id), req.body);
    return res.status(200).json(successResponse(item, 'Perda atualizada com sucesso', 200));
  } catch (e) { next(e); }
}

export async function remover(req, res, next) {
  try {
    await perdas.remover(Number(req.params.id));
    return res.status(200).json(successResponse(true, 'Perda removida com sucesso', 200));
  } catch (e) { next(e); }
}

