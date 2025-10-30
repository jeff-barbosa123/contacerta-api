import { db } from './dbMemory.js';

export async function obterPorProduto(produto_id) {
  return db.receitas.find(r => r.produto_id === Number(produto_id)) || { produto_id: Number(produto_id), itens: [] };
}

export async function salvar(produto_id, receita) {
  if (!receita || !Array.isArray(receita.itens)) {
    const e = new Error('Receita invalida'); e.status = 400; e.codigo = 'ERR_VALIDACAO_CAMPOS'; e.detalhes = [{ campo: 'itens', erro: 'Obrigatorio (array)' }]; throw e;
  }
  const itens = receita.itens.map(it => ({ ingrediente_id: Number(it.ingrediente_id), quantidade: Number(it.quantidade) }));
  if (itens.some(it => !it.ingrediente_id || Number.isNaN(it.quantidade) || it.quantidade <= 0)) {
    const e = new Error('Itens invalidos'); e.status = 400; e.codigo = 'ERR_VALIDACAO_CAMPOS'; e.detalhes = [{ campo: 'itens', erro: 'ingrediente_id e quantidade > 0' }]; throw e;
  }
  const idx = db.receitas.findIndex(r => r.produto_id === Number(produto_id));
  const rec = { produto_id: Number(produto_id), itens };
  if (idx >= 0) db.receitas[idx] = rec; else db.receitas.push(rec);
  return rec;
}

export async function remover(produto_id) {
  const i = db.receitas.findIndex(r => r.produto_id === Number(produto_id));
  if (i < 0) return false;
  db.receitas.splice(i, 1);
  return true;
}

