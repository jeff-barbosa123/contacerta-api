import * as rel from '../services/relatoriosService.js';
import { successResponse } from '../utils/responses.js';

export async function cmv(req, res, next) {
  try {
    const { periodo } = req.query; // YYYY-MM (opcional)
    const data = await rel.cmv(periodo);
    return res.status(200).json(successResponse(data, 'Cálculo do CMV', 200));
  } catch (e) { next(e); }
}

export async function rendimento(req, res, next) {
  try {
    const data = await rel.rendimento();
    return res.status(200).json(successResponse(data, 'Relatório de rendimento', 200));
  } catch (e) { next(e); }
}

export async function estoqueBaixo(req, res, next) {
  try {
    const { limite = 5 } = req.query;
    const data = await rel.estoqueBaixo(Number(limite));
    return res.status(200).json(successResponse(data, 'OK', 200));
  } catch (e) { next(e); }
}

export async function clientesFieis(req, res, next) {
  try {
    const data = await rel.clientesFieis();
    return res.status(200).json(successResponse(data, 'OK', 200));
  } catch (e) { next(e); }
}

