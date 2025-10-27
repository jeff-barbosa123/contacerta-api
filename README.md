# ContaCerta API

API RESTful profissional para gestão financeira e controle de vendas, com:
- Autenticação JWT
- CRUD de clientes, produtos e pedidos (em memória)
- Relatórios de CMV e rendimento
- Atualização automática do CMV (cron) com fallback e histórico
- Documentação Swagger em `/api/docs`

## Requisitos
- Node.js 18+

## Instalação
```bash
npm install
cp .env.example .env
npm run dev
```
Acesse: http://localhost:3000/api/docs

Credenciais de teste (demo):
- **email**: `admin@contacerta.com`
- **senha**: `admin123`

## Scripts
- `npm run dev` — dev com nodemon
- `npm start` — produção

## Estrutura
Veja as pastas em `src/`.
