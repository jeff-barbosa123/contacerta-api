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
  if (!data || !data.nome || data.custo === undefined || data.preco === undefined || data.estoque === undefined) {
    throw Object.assign(new Error('Campos obrigatÃ³rios: nome, custo, preco, estoque'), { status: 400 });
  }
  const custo = Number(data.custo);
  const preco = Number(data.preco);
  const estoque = Number(data.estoque);
  if ([custo, preco, estoque].some(v => Number.isNaN(v))) {
    throw Object.assign(new Error('custo, preco e estoque devem ser numÃ©ricos'), { status: 400 });
  }
  if (custo < 0 || preco < 0 || estoque < 0) {
    throw Object.assign(new Error('custo, preco e estoque nÃ£o podem ser negativos'), { status: 400 });
  }
  const id = nextId('produtos');
  const novo = {
    id,
    nome: data.nome,
    custo,
    preco,
    estoque,
    categoria: data.categoria || null
  };
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
    sugestao = 'O custo aumentou. Considere revisar o preco de venda.';
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


