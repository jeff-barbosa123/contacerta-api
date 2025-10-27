import * as clientes from '../services/clienteService.js';
import { successResponse, errorResponse } from '../utils/responses.js';

/**
 * Lista clientes com filtros opcionais
 */
export async function listarComFiltros(req, res, next) {
  try {
    const { nome, aniversario, page = 1, limit = 20 } = req.query;
    const data = await clientes.listar({
      nome,
      aniversario,
      page: Number(page),
      limit: Number(limit)
    });

    return res.status(200).json(successResponse(data, 'Clientes listados com sucesso'));
  } catch (e) {
    next(e);
  }
}

/**
 * Cria um novo cliente
 */
export async function criar(req, res, next) {
  try {
    const novo = await clientes.criar(req.body);
    return res.status(201).json(successResponse(novo, 'Cliente criado com sucesso'));
  } catch (e) {
    next(e);
  }
}

/**
 * Obtém um cliente específico pelo ID
 */
export async function obterPorId(req, res, next) {
  try {
    const item = await clientes.obterPorId(Number(req.params.id));
    if (!item) {
      return res.status(404).json(errorResponse(404, 'Cliente não encontrado'));
    }
    return res.status(200).json(successResponse(item, 'Cliente encontrado'));
  } catch (e) {
    next(e);
  }
}

/**
 * Atualiza completamente os dados de um cliente
 */
export async function atualizarCompleto(req, res, next) {
  try {
    const ok = await clientes.atualizarCompleto(Number(req.params.id), req.body);
    if (!ok) {
      return res.status(404).json(errorResponse(404, 'Cliente não encontrado'));
    }
    return res.status(200).json(successResponse(ok, 'Cliente atualizado com sucesso'));
  } catch (e) {
    next(e);
  }
}

/**
 * Atualiza parcialmente os dados de um cliente
 */
export async function atualizarParcial(req, res, next) {
  try {
    const ok = await clientes.atualizarParcial(Number(req.params.id), req.body);
    if (!ok) {
      return res.status(404).json(errorResponse(404, 'Cliente não encontrado'));
    }
    return res.status(200).json(successResponse(ok, 'Cliente atualizado (parcialmente)'));
  } catch (e) {
    next(e);
  }
}

/**
 * Remove um cliente pelo ID
 */
export async function remover(req, res, next) {
  try {
    const ok = await clientes.remover(Number(req.params.id));
    if (!ok) {
      return res.status(404).json(errorResponse(404, 'Cliente não encontrado'));
    }
    return res.status(200).json(successResponse(true, 'Cliente removido com sucesso'));
  } catch (e) {
    next(e);
  }
}