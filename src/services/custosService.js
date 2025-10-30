import { db, nextId, paginate } from './dbMemory.js';

const PERIODO_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

function validarEntrada(data) {
  const detalhes = [];
  if (!data || data.tipo === undefined) detalhes.push({ campo: 'tipo', erro: 'Obrigatorio' });
  if (!data || data.valor === undefined) detalhes.push({ campo: 'valor', erro: 'Obrigatorio' });
  if (!data || data.periodo === undefined) detalhes.push({ campo: 'periodo', erro: 'Obrigatorio (YYYY-MM)' });
  if (detalhes.length) {
    const e = new Error('Um ou mais campos estao invalidos ou ausentes.');
    e.status = 400; e.codigo = 'ERR_VALIDACAO_CAMPOS'; e.detalhes = detalhes; throw e;
  }
  const valor = Number(data.valor);
  if (Number.isNaN(valor) || valor < 0) {
    const e = new Error('Parametros invalidos.'); e.status = 400; e.codigo = 'ERR_PARAMETROS_INVALIDOS'; e.detalhes = [{ campo: 'valor', erro: 'Deve ser numero >= 0' }]; throw e;
  }
  if (!PERIODO_RE.test(String(data.periodo))) {
    const e = new Error('Parametro periodo invalido. Use YYYY-MM.'); e.status = 400; e.codigo = 'ERR_PERIODO_INVALIDO'; throw e;
  }
  return { tipo: String(data.tipo), valor, periodo: String(data.periodo) };
}

export async function listar({ periodo, tipo, page, limit }) {
  let items = [...(db.custos || [])];
  if (periodo) items = items.filter(c => String(c.periodo) === String(periodo));
  if (tipo) items = items.filter(c => String(c.tipo).toLowerCase().includes(String(tipo).toLowerCase()));
  return paginate(items, page, limit);
}

export async function criar(data) {
  const novo = validarEntrada(data);
  const id = nextId('custos');
  const registro = { id, ...novo };
  if (!db.custos) db.custos = [];
  db.custos.push(registro);
  return registro;
}

export async function atualizar(id, data) {
  const i = (db.custos || []).findIndex(c => c.id === id);
  if (i < 0) { const e = new Error('Custo nao encontrado'); e.status = 404; e.codigo = 'ERR_NAO_ENCONTRADO'; throw e; }
  const atual = { ...db.custos[i] };
  const patch = { ...data };
  if (patch.valor !== undefined) {
    const v = Number(patch.valor);
    if (Number.isNaN(v) || v < 0) { const e = new Error('Parametros invalidos.'); e.status = 400; e.codigo = 'ERR_PARAMETROS_INVALIDOS'; e.detalhes = [{ campo: 'valor', erro: 'Deve ser numero >= 0' }]; throw e; }
    patch.valor = v;
  }
  if (patch.periodo !== undefined) {
    if (!PERIODO_RE.test(String(patch.periodo))) { const e = new Error('Parametro periodo invalido. Use YYYY-MM.'); e.status = 400; e.codigo = 'ERR_PERIODO_INVALIDO'; throw e; }
    patch.periodo = String(patch.periodo);
  }
  if (patch.tipo !== undefined) patch.tipo = String(patch.tipo);
  db.custos[i] = { ...atual, ...patch };
  return db.custos[i];
}

export async function remover(id) {
  const i = (db.custos || []).findIndex(c => c.id === id);
  if (i < 0) { const e = new Error('Custo nao encontrado'); e.status = 404; e.codigo = 'ERR_NAO_ENCONTRADO'; throw e; }
  db.custos.splice(i, 1);
  return true;
}

