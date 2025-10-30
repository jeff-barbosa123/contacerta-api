import { db, nextId, paginate } from './dbMemory.js';

export async function listar({ nome, aniversario, page, limit }) {
  let items = [...db.clientes];
  if (nome) items = items.filter(c => c.nome?.toLowerCase().includes(String(nome).toLowerCase()));
  if (aniversario) items = items.filter(c => (c.aniversario || '').slice(5) === aniversario);
  return paginate(items, page, limit);
}

export async function criar(data) {
  // 🆕 v2.1.0 – validações com códigos e detalhes
  const missing = [];
  if (!data || !data.nome) missing.push({ campo: 'nome', erro: 'Obrigatório' });
  if (!data || !data.telefone) missing.push({ campo: 'telefone', erro: 'Obrigatório' });
  if (!data || !data.aniversario) missing.push({ campo: 'aniversario', erro: 'Obrigatório' });
  if (missing.length) { const e = new Error('Um ou mais campos estão inválidos ou ausentes.'); e.status = 400; e.codigo = 'ERR_VALIDACAO_CAMPOS'; e.detalhes = missing; throw e; }

  // cpf_cnpj (se presente) deve ter formato válido (CPF 11 dígitos ou CNPJ 14 dígitos)
  if (data.cpf_cnpj) {
    const digits = String(data.cpf_cnpj).replace(/\D/g, '');
    const ok = digits.length === 11 || digits.length === 14;
    if (!ok) { const e = new Error('cpf_cnpj inválido'); e.status = 400; e.codigo = 'ERR_VALIDACAO_CAMPOS'; e.detalhes = [{ campo: 'cpf_cnpj', erro: 'Formato inválido' }]; throw e; }
  }

  const id = nextId('clientes');
  const novo = {
    id,
    nome: data.nome,
    telefone: data.telefone,
    aniversario: data.aniversario,
    cpf_cnpj: data.cpf_cnpj || null,
    endereco: data.endereco || null,
    dataCadastro: new Date().toISOString().slice(0, 10)
  };
  db.clientes.push(novo);
  return novo;
}

export async function obterPorId(id) {
  return db.clientes.find(c => c.id === id) || null;
}

export async function atualizarCompleto(id, data) {
  const i = db.clientes.findIndex(c => c.id === id);
  if (i < 0) return false;
  db.clientes[i] = { ...db.clientes[i], ...data };
  return true;
}

export async function atualizarParcial(id, data) {
  return atualizarCompleto(id, data);
}

export async function remover(id) {
  const i = db.clientes.findIndex(c => c.id === id);
  if (i < 0) return false;
  db.clientes.splice(i, 1);
  return true;
}


