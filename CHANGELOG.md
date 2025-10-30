# Changelog

## 2.1.0 - 2025-10-30

Melhorias menores mantendo compatibilidade com a v2.0.0, estrutura e rotas inalteradas.

- Alerta de estoque baixo automático (Pedidos)
  - Ao criar pedido, se algum produto ficar com estoque ≤ 5: loga no console e inclui aviso em `data.mensagens`.
  - Não bloqueia a venda; apenas informa.
- Sugestão de reajuste de preço (Produtos)
  - Em `PUT/PATCH /api/produtos/{id}`, se o custo novo > custo anterior: retorna `sugestao: "O custo aumentou. Considere revisar o preco de venda."`.
  - Mantém resposta compatível (`updated: true`).
- CMV mais descritivo (Relatórios)
  - `GET /api/relatorios/cmv` agora inclui `lucro_bruto_total` e `lucro_percentual`, além de `cmv_total`, `cmv_base` e `periodo`.
  - Comportamento seguro sem pedidos: retorna 0 para os campos numéricos.

Documentação e ferramentas
- Swagger atualizado: novos campos do CMV e schema de retorno de atualização de produto.
- Postman atualizado: testes para `data.mensagens`, `sugestao` e novos campos do CMV.

