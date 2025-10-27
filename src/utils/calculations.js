// Funções utilitárias de cálculo
export function lucroUnitario(preco, custo) {
  return Number((preco - custo).toFixed(2));
}

export function margemPercentual(preco, custo) {
  if (custo <= 0) return '0.00%';
  const perc = ((preco - custo) / custo) * 100;
  return `${perc.toFixed(2)}%`;
}
