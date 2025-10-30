import { db, nextId, paginate } from './dbMemory.js';

export async function listar({ nome, unidade, estoqueMin, page, limit }) {
  let items = [...db.ingredientes];
  if (nome) items = items.filter(i => (i.nome || '').toLowerCase().includes(String(nome).toLowerCase()));
  if (unidade) items = items.filter(i => (i.unidade || '').toLowerCase() === String(unidade).toLowerCase());
  if (!Number.isNaN(Number(estoqueMin)) && estoqueMin !== undefined && estoqueMin !== '') {
    items = items.filter(i => Number(i.estoque) >= Number(estoqueMin));
  }
  return paginate(items, page, limit);
}

export async function criar(data) {
  const missing = [];
  if (!data || !data.nome) missing.push({ campo: 'nome', erro: 'Obrigatorio' });
  if (!data || data.unidade === undefined) missing.push({ campo: 'unidade', erro: 'Obrigatorio' });
  if (!data || data.estoque === undefined) missing.push({ campo: 'estoque', erro: 'Obrigatorio' });
  if (!data || data.custoUnitario === undefined) missing.push({ campo: 'custoUnitario', erro: 'Obrigatorio' });
  if (missing.length) { const e = new Error('Campos invalidos ou ausentes'); e.status = 400; e.codigo = 'ERR_VALIDACAO_CAMPOS'; e.detalhes = missing; throw e; }

  const estoque = Number(data.estoque);
  const custo = Number(data.custoUnitario);
  if ([estoque, custo].some(v => Number.isNaN(v) || v < 0)) {
    const e = new Error('Parametros invalidos'); e.status = 400; e.codigo = 'ERR_PARAMETROS_INVALIDOS'; e.detalhes = [{ campo: 'estoque/custoUnitario', erro: 'Deve ser numerico >= 0' }]; throw e;
  }
  const id = nextId('ingredientes');
  const novo = { id, nome: data.nome, unidade: data.unidade, estoque, custoUnitario: custo };
  db.ingredientes.push(novo);
  return novo;
}

export async function obterPorId(id) {
  return db.ingredientes.find(i => i.id === id) || null;
}

export async function atualizar(id, data) {
  const i = db.ingredientes.findIndex(x => x.id === id);
  if (i < 0) { const e = new Error('Ingrediente nao encontrado'); e.status = 404; e.codigo = 'ERR_NAO_ENCONTRADO'; throw e; }
  const patch = { ...data };
  if (patch.estoque !== undefined) { const v = Number(patch.estoque); if (Number.isNaN(v) || v < 0) { const e = new Error('estoque invalido'); e.status = 400; e.codigo = 'ERR_PARAMETROS_INVALIDOS'; throw e; } patch.estoque = v; }
  if (patch.custoUnitario !== undefined) { const v = Number(patch.custoUnitario); if (Number.isNaN(v) || v < 0) { const e = new Error('custoUnitario invalido'); e.status = 400; e.codigo = 'ERR_PARAMETROS_INVALIDOS'; throw e; } patch.custoUnitario = v; }
  db.ingredientes[i] = { ...db.ingredientes[i], ...patch };
  return db.ingredientes[i];
}

export async function remover(id) {
  const i = db.ingredientes.findIndex(x => x.id === id);
  if (i < 0) return false;
  db.ingredientes.splice(i, 1);
  return true;
}

