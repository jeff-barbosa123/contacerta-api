import { db, nextId, paginate } from './dbMemory.js';

export async function listar({ nome, categoria, estoqueMin, page, limit }) {
  let items = [...db.produtos];
  if (nome) items = items.filter(p => p.nome?.toLowerCase().includes(String(nome).toLowerCase()));
  if (categoria) items = items.filter(p => (p.categoria || '').toLowerCase().includes(String(categoria).toLowerCase()));
  if (!Number.isNaN(Number(estoqueMin)) && estoqueMin !== undefined && estoqueMin !== '') {
    items = items.filter(p => Number(p.estoque) >= Number(estoqueMin));
  }
  return paginate(items, page, limit);
}

export async function criar(data) {
  // 🆕 v2.1.0 – validações com códigos e detalhes
  const missing = [];
  if (!data || !data.nome) missing.push({ campo: 'nome', erro: 'Obrigatório' });
  if (!data || data.custo === undefined) missing.push({ campo: 'custo', erro: 'Obrigatório' });
  if (!data || data.preco === undefined) missing.push({ campo: 'preco', erro: 'Obrigatório' });
  if (!data || data.estoque === undefined) missing.push({ campo: 'estoque', erro: 'Obrigatório' });
  if (missing.length) { const e = new Error('Um ou mais campos estão inválidos ou ausentes.'); e.status = 400; e.codigo = 'ERR_VALIDACAO_CAMPOS'; e.detalhes = missing; throw e; }

  const custo = Number(data.custo);
  const preco = Number(data.preco);
  const estoque = Number(data.estoque);
  const naoNumericos = [];
  if (Number.isNaN(custo)) naoNumericos.push({ campo: 'custo', erro: 'Deve ser numérico' });
  if (Number.isNaN(preco)) naoNumericos.push({ campo: 'preco', erro: 'Deve ser numérico' });
  if (Number.isNaN(estoque)) naoNumericos.push({ campo: 'estoque', erro: 'Deve ser numérico' });
  if (naoNumericos.length) { const e = new Error('Parâmetros inválidos.'); e.status = 400; e.codigo = 'ERR_PARAMETROS_INVALIDOS'; e.detalhes = naoNumericos; throw e; }

  const negativos = [];
  if (custo < 0) negativos.push({ campo: 'custo', erro: 'Não pode ser negativo' });
  if (preco < 0) negativos.push({ campo: 'preco', erro: 'Não pode ser negativo' });
  if (estoque < 0) negativos.push({ campo: 'estoque', erro: 'Não pode ser negativo' });
  if (negativos.length) { const e = new Error('Parâmetros inválidos.'); e.status = 400; e.codigo = 'ERR_PARAMETROS_INVALIDOS'; e.detalhes = negativos; throw e; }

  const id = nextId('produtos');
  const novo = { id, nome: data.nome, custo, preco, estoque, categoria: data.categoria || null };
  db.produtos.push(novo);
  return novo;
}

export async function obterPorId(id) {
  return db.produtos.find(p => p.id === id) || null;
}

export async function atualizarCompleto(id, data) {
  const i = db.produtos.findIndex(p => p.id === id);
  if (i < 0) {
    // 🆕 v2.1.0 – erro padronizado para ID inexistente
    const err = new Error('Produto não encontrado');
    err.status = 404; err.codigo = 'ERR_PRODUTO_INEXISTENTE';
    throw err;
  }
  const antigo = { ...db.produtos[i] };
  const patch = { ...data };
  if (patch.custo !== undefined) {
    const v = Number(patch.custo);
    if (Number.isNaN(v) || v < 0) { const e = new Error('custo inválido'); e.status = 400; e.codigo = 'ERR_PARAMETROS_INVALIDOS'; throw e; }
    patch.custo = v;
  }
  if (patch.preco !== undefined) {
    const v = Number(patch.preco);
    if (Number.isNaN(v) || v < 0) { const e = new Error('preco inválido'); e.status = 400; e.codigo = 'ERR_PARAMETROS_INVALIDOS'; throw e; }
    patch.preco = v;
  }
  if (patch.estoque !== undefined) {
    const v = Number(patch.estoque);
    if (Number.isNaN(v) || v < 0) { const e = new Error('estoque inválido'); e.status = 400; e.codigo = 'ERR_PARAMETROS_INVALIDOS'; throw e; }
    patch.estoque = v;
  }
  db.produtos[i] = { ...db.produtos[i], ...patch };
  // 🆕 v2.1.0 – sugestão de reajuste quando custo aumenta
  let sugestao;
  if (patch.custo !== undefined && Number(patch.custo) > Number(antigo.custo)) {
    // 🆕 v2.1.0 – Mensagem sugerindo revisao de preco de venda quando custo aumenta
    sugestao = '💰 O custo do produto aumentou. Considere revisar o preco de venda.';
  }
  // v2.1.0 - normaliza sugestao com texto claro (override)
  if (sugestao) {
    sugestao = 'O custo do produto aumentou. Considere revisar o preco de venda.';
  }
  return sugestao ? { updated: true, sugestao } : { updated: true };
}

export async function atualizarParcial(id, data) {
  return atualizarCompleto(id, data);
}

export async function remover(id) {
  const i = db.produtos.findIndex(p => p.id === id);
  if (i < 0) { const err = new Error('Produto não encontrado'); err.status = 404; err.codigo = 'ERR_PRODUTO_INEXISTENTE'; throw err; }
  db.produtos.splice(i, 1);
  return true;
}



