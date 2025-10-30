export const db = {
  usuarios: [
    // senha 'admin123' será verificada com bcryptjs no login
    {
      id: 1,
      email: 'admin@contacerta.com',
      senha: '$2a$10$2d1Jx0mC3m3I3o7m2a6M2uX2g7hPjHqGkcYg2LJjKq5WwG0r3jHKO',
      perfil: 'admin'
    }
  ],
  passwordResets: [
    // { userId: 1, tokenHash: 'sha256hex', expiresAt: '2025-10-30T10:00:00Z', used: false }
  ],
  clientes: [
    { id: 1, nome: 'Maria Souza', telefone: '(81) 98888-7777', aniversario: '1990-03-25' }
  ],
  produtos: [
    { id: 1, nome: 'Bolo de Rolo', custo: 12.5, preco: 25.0, estoque: 30 }
  ],
  pedidos: [
    {
      id: 1,
      cliente_id: 1,
      itens: [{ produto_id: 1, quantidade: 2 }],
      total: 50.0,
      criadoEm: new Date().toISOString()
    }
  ],
  // v2.2.0 – ingredientes e receitas (BOM)
  ingredientes: [
    // { id: 1, nome: 'Arroz', unidade: 'kg', estoque: 20, custoUnitario: 6.5 }
  ],
  receitas: [
    // { produto_id: 1, itens: [ { ingrediente_id: 1, quantidade: 0.15 } ] }
  ],
  // v2.3.0 – custos gerais do periodo e perdas
  custos: [
    // { id: 1, tipo: 'energia', valor: 350.00, periodo: '2025-10' }
  ],
  perdas: [
    // { id: 1, referencia: 'ingrediente', ref_id: 1, tipo: 'descarte', quantidade: 1.2, valor: 7.8, periodo: '2025-10' }
  ]
};
