import { db } from './dbMemory.js';

// CMV = soma(custo_unitario * qtd) dos pedidos no período (se período for informado YYYY-MM)
export async function cmv(periodo) {
  const filtrarPorPeriodo = (iso) => {
    if (!periodo) return true;
    return iso.startsWith(periodo); // YYYY-MM
  };
  let cmv_total = 0;
  for (const ped of db.pedidos) {
    if (!filtrarPorPeriodo(ped.criadoEm)) continue;
    for (const it of ped.itens) {
      const prod = db.produtos.find(p => p.id === it.produto_id);
      if (!prod) continue;
      cmv_total += Number(prod.custo) * Number(it.quantidade);
    }
  }
  return { cmv_total: Number(cmv_total.toFixed(2)), cmv_base: db.produtos.length ? Number((db.produtos.reduce((a, p) => a + p.custo, 0) / db.produtos.length).toFixed(2)) : 0, periodo: periodo || null };
}

// Rendimento por produto: custo, preço, lucro unitário, margem %, rendimento total (lucro * qtd vendida)
export async function rendimento() {
  const mapaVendas = new Map(); // idProduto -> qtdVendida
  for (const ped of db.pedidos) {
    for (const it of ped.itens) {
      mapaVendas.set(it.produto_id, (mapaVendas.get(it.produto_id) || 0) + Number(it.quantidade));
    }
  }
  const out = [];
  for (const prod of db.produtos) {
    const quantidade = mapaVendas.get(prod.id) || 0;
    const lucro_unitario = Number((prod.preco - prod.custo).toFixed(2));
    const margem_percentual = prod.custo > 0 ? `${((lucro_unitario / prod.custo) * 100).toFixed(2)}%` : '0.00%';
    const rendimento_total = Number((lucro_unitario * quantidade).toFixed(2));
    out.push({
      produto: prod.nome,
      custo_unitario: prod.custo,
      preco_venda: prod.preco,
      quantidade,
      lucro_unitario,
      margem_percentual,
      rendimento_total
    });
  }
  return out;
}

// Produtos com estoque abaixo do limite
export async function estoqueBaixo(limite = 5) {
  return db.produtos.filter(p => Number(p.estoque) <= Number(limite))
    .map(p => ({ id: p.id, nome: p.nome, estoque: p.estoque, categoria: p.categoria || null }));
}

// Clientes com mais compras (contagem de pedidos por cliente)
export async function clientesFieis() {
  const mapa = new Map(); // cliente_id -> total_pedidos
  for (const ped of db.pedidos) {
    mapa.set(ped.cliente_id, (mapa.get(ped.cliente_id) || 0) + 1);
  }
  const arr = [];
  for (const [cliente_id, total_pedidos] of mapa.entries()) {
    const cli = db.clientes.find(c => c.id === cliente_id);
    arr.push({ cliente: cli?.nome || `Cliente #${cliente_id}`, total_pedidos });
  }
  return arr.sort((a, b) => b.total_pedidos - a.total_pedidos);
}
