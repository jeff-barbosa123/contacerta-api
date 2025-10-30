import * as receitas from '../services/receitasService.js';
import { successResponse, errorResponse } from '../utils/responses.js';

export async function obterPorProduto(req, res, next) {
  try {
    const produtoId = Number(req.params.produto_id);
    const data = await receitas.obterPorProduto(produtoId);
    return res.status(200).json(successResponse(data, 'OK', 200));
  } catch (e) { next(e); }
}

export async function salvar(req, res, next) {
  try {
    const produtoId = Number(req.params.produto_id);
    const data = await receitas.salvar(produtoId, req.body);
    return res.status(200).json(successResponse(data, 'Receita atualizada com sucesso', 200));
  } catch (e) { next(e); }
}

export async function remover(req, res, next) {
  try {
    const produtoId = Number(req.params.produto_id);
    const ok = await receitas.remover(produtoId);
    if (!ok) return res.status(404).json(errorResponse(404, 'Receita nao encontrada', 'ERR_NAO_ENCONTRADO'));
    return res.status(200).json(successResponse(true, 'Receita removida com sucesso', 200));
  } catch (e) { next(e); }
}

