import { db, nextId, paginate } from './dbMemory.js';

const PERIODO_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

function validarEntrada(data) {
  const detalhes = [];
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
  const perda = {
    tipo: data.tipo ? String(data.tipo) : 'perda',
    referencia: data.referencia ? String(data.referencia) : null,
    ref_id: data.ref_id !== undefined ? Number(data.ref_id) : null,
    quantidade: data.quantidade !== undefined ? Number(data.quantidade) : null,
    valor,
    periodo: String(data.periodo)
  };
  if (perda.quantidade !== null && (Number.isNaN(perda.quantidade) || perda.quantidade < 0)) {
    const e = new Error('Parametros invalidos.'); e.status = 400; e.codigo = 'ERR_PARAMETROS_INVALIDOS'; e.detalhes = [{ campo: 'quantidade', erro: 'Deve ser numero >= 0' }]; throw e;
  }
  return perda;
}

export async function listar({ periodo, tipo, page, limit }) {
  let items = [...(db.perdas || [])];
  if (periodo) items = items.filter(p => String(p.periodo) === String(periodo));
  if (tipo) items = items.filter(p => String(p.tipo).toLowerCase().includes(String(tipo).toLowerCase()));
  return paginate(items, page, limit);
}

export async function criar(data) {
  const novo = validarEntrada(data);
  const id = nextId('perdas');
  const registro = { id, ...novo };
  if (!db.perdas) db.perdas = [];
  db.perdas.push(registro);
  return registro;
}

export async function atualizar(id, data) {
  const i = (db.perdas || []).findIndex(p => p.id === id);
  if (i < 0) { const e = new Error('Perda nao encontrada'); e.status = 404; e.codigo = 'ERR_NAO_ENCONTRADO'; throw e; }
  const atual = { ...db.perdas[i] };
  const patch = { ...data };
  if (patch.valor !== undefined) {
    const v = Number(patch.valor);
    if (Number.isNaN(v) || v < 0) { const e = new Error('Parametros invalidos.'); e.status = 400; e.codigo = 'ERR_PARAMETROS_INVALIDOS'; e.detalhes = [{ campo: 'valor', erro: 'Deve ser numero >= 0' }]; throw e; }
    patch.valor = v;
  }
  if (patch.quantidade !== undefined) {
    const v = Number(patch.quantidade);
    if (Number.isNaN(v) || v < 0) { const e = new Error('Parametros invalidos.'); e.status = 400; e.codigo = 'ERR_PARAMETROS_INVALIDOS'; e.detalhes = [{ campo: 'quantidade', erro: 'Deve ser numero >= 0' }]; throw e; }
    patch.quantidade = v;
  }
  if (patch.periodo !== undefined) {
    if (!PERIODO_RE.test(String(patch.periodo))) { const e = new Error('Parametro periodo invalido. Use YYYY-MM.'); e.status = 400; e.codigo = 'ERR_PERIODO_INVALIDO'; throw e; }
    patch.periodo = String(patch.periodo);
  }
  if (patch.tipo !== undefined) patch.tipo = String(patch.tipo);
  if (patch.referencia !== undefined) patch.referencia = String(patch.referencia);
  if (patch.ref_id !== undefined) patch.ref_id = Number(patch.ref_id);
  db.perdas[i] = { ...atual, ...patch };
  return db.perdas[i];
}

export async function remover(id) {
  const i = (db.perdas || []).findIndex(p => p.id === id);
  if (i < 0) { const e = new Error('Perda nao encontrada'); e.status = 404; e.codigo = 'ERR_NAO_ENCONTRADO'; throw e; }
  db.perdas.splice(i, 1);
  return true;
}

