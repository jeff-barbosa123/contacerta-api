import * as ingredientes from '../services/ingredientesService.js';
import { successResponse, errorResponse } from '../utils/responses.js';

export async function listar(req, res, next) {
  try {
    const { nome, unidade, estoqueMin, page = 1, limit = 20 } = req.query;
    const data = await ingredientes.listar({ nome, unidade, estoqueMin: Number(estoqueMin), page: Number(page), limit: Number(limit) });
    return res.status(200).json(successResponse(data, 'OK', 200));
  } catch (e) { next(e); }
}

export async function criar(req, res, next) {
  try {
    const data = await ingredientes.criar(req.body);
    return res.status(201).json(successResponse(data, 'Ingrediente criado com sucesso', 201));
  } catch (e) { next(e); }
}

export async function obterPorId(req, res, next) {
  try {
    const item = await ingredientes.obterPorId(Number(req.params.id));
    if (!item) return res.status(404).json(errorResponse(404, 'Ingrediente nao encontrado', 'ERR_NAO_ENCONTRADO'));
    return res.status(200).json(successResponse(item, 'OK', 200));
  } catch (e) { next(e); }
}

export async function atualizar(req, res, next) {
  try {
    const item = await ingredientes.atualizar(Number(req.params.id), req.body);
    return res.status(200).json(successResponse(item, 'Ingrediente atualizado com sucesso', 200));
  } catch (e) { next(e); }
}

export async function remover(req, res, next) {
  try {
    const ok = await ingredientes.remover(Number(req.params.id));
    if (!ok) return res.status(404).json(errorResponse(404, 'Ingrediente nao encontrado', 'ERR_NAO_ENCONTRADO'));
    return res.status(200).json(successResponse(true, 'Ingrediente removido com sucesso', 200));
  } catch (e) { next(e); }
}

