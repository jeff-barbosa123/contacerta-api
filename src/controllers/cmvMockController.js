// Mock de API externa: retorna CMV variável (0.27..0.35)
export function getCMVMock(req, res) {
  const cmv = Number((0.27 + Math.random() * 0.08).toFixed(4));
  return res.json({ cmv });
}