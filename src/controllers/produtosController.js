import * as produtos from '../services/produtoService.js';
import { successResponse, errorResponse } from '../utils/responses.js';

/**
 * Lista produtos com filtros opcionais
 */
export async function listarComFiltros(req, res, next) {
  try {
    const { nome, categoria, estoqueMin, page = 1, limit = 20 } = req.query;
    const data = await produtos.listar({
      nome,
      categoria,
      estoqueMin: Number(estoqueMin),
      page: Number(page),
      limit: Number(limit)
    });

    return res.status(200).json(successResponse(data, 'Produtos listados com sucesso'));
  } catch (e) {
    next(e);
  }
}

/**
 * Cria um novo produto
 */
export async function criar(req, res, next) {
  try {
    const novo = await produtos.criar(req.body);
    return res.status(201).json(successResponse(novo, 'Produto criado com sucesso'));
  } catch (e) {
    next(e);
  }
}

/**
 * Obtém um produto pelo ID
 */
export async function obterPorId(req, res, next) {
  try {
    const item = await produtos.obterPorId(Number(req.params.id));
    if (!item) {
      return res.status(404).json(errorResponse(404, 'Produto não encontrado'));
    }
    return res.status(200).json(successResponse(item, 'Produto encontrado'));
  } catch (e) {
    next(e);
  }
}

/**
 * Atualiza completamente um produto
 */
export async function atualizarCompleto(req, res, next) {
  try {
    const ok = await produtos.atualizarCompleto(Number(req.params.id), req.body);
    if (!ok) {
      return res.status(404).json(errorResponse(404, 'Produto não encontrado'));
    }
    return res.status(200).json(successResponse(ok, 'Produto atualizado com sucesso'));
  } catch (e) {
    next(e);
  }
}

/**
 * Atualiza parcialmente um produto
 */
export async function atualizarParcial(req, res, next) {
  try {
    const ok = await produtos.atualizarParcial(Number(req.params.id), req.body);
    if (!ok) {
      return res.status(404).json(errorResponse(404, 'Produto não encontrado'));
    }
    return res.status(200).json(successResponse(ok, 'Produto atualizado (parcialmente)'));
  } catch (e) {
    next(e);
  }
}

/**
 * Remove um produto pelo ID
 */
export async function remover(req, res, next) {
  try {
    const ok = await produtos.remover(Number(req.params.id));
    if (!ok) {
      return res.status(404).json(errorResponse(404, 'Produto não encontrado'));
    }
    return res.status(200).json(successResponse(true, 'Produto removido com sucesso'));
  } catch (e) {
    next(e);
  }
}