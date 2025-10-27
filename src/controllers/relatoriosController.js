import * as rel from '../services/relatoriosService.js';

export async function cmv(req, res, next) {
  try {
    const { periodo } = req.query; // YYYY-MM (opcional)
    const data = await rel.cmv(periodo);
    res.json({ status: 200, mensagem: 'Cálculo do CMV', data });
  } catch (e) { next(e); }
}
export async function rendimento(req, res, next) {
  try {
    const data = await rel.rendimento();
    res.json({ status: 200, mensagem: 'Relatório de rendimento', data });
  } catch (e) { next(e); }
}
export async function estoqueBaixo(req, res, next) {
  try {
    const { limite = 5 } = req.query;
    const data = await rel.estoqueBaixo(Number(limite));
    res.json({ status: 200, mensagem: 'OK', data });
  } catch (e) { next(e); }
}
export async function clientesFieis(req, res, next) {
  try {
    const data = await rel.clientesFieis();
    res.json({ status: 200, mensagem: 'OK', data });
  } catch (e) { next(e); }
}