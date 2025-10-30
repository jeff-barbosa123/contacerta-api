import { db, nextId, paginate } from './dbMemory.js';

export async function listar({ nome, aniversario, page, limit }) {
  let items = [...db.clientes];
  if (nome) items = items.filter(c => c.nome?.toLowerCase().includes(String(nome).toLowerCase()));
  if (aniversario) items = items.filter(c => (c.aniversario || '').slice(5) === aniversario);
  return paginate(items, page, limit);
}

export async function criar(data) {
  if (!data || !data.nome || !data.telefone || !data.aniversario) {
    throw Object.assign(new Error('Campos obrigatórios: nome, telefone, aniversario'), { status: 400 });
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

