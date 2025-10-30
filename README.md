# 💼 API ContaCerta

> 📘 Projeto desenvolvido para portfólio da **Mentoria de Testes de Software (Júlio de Lima)**.  
> 💡 O sistema encontra-se em **fase de testes e validação**, servindo como base para práticas de QA, documentação e automação.

---

## 🧩 Visão Geral

A **ContaCerta** é uma API RESTful profissional para **gestão financeira e controle de vendas**, voltada a pequenos empreendedores.  
Permite gerenciar produtos, clientes e pedidos, calculando **custos, CMV (Custo da Mercadoria Vendida)**, **preço de venda** e **rendimento**.  

Foi desenvolvida com **Node.js + Express**, com autenticação **JWT**, documentação **Swagger** e arquitetura baseada em **camadas (routes, controllers, services, models)**.

> 🔧 Projeto construído com foco em **planejamento, qualidade e estrutura de testes**, seguindo boas práticas estudadas na mentoria.

---

## Funcionalidades Principais

- 🔐 **Autenticação JWT** (login e controle de acesso por token)
- 👥 **CRUD de clientes, produtos e pedidos**
- 📊 **Relatórios automáticos de CMV e rendimento**
- ⏱️ **Atualização periódica do CMV (cron job)** com histórico e fallback
- 🧾 **Documentação Swagger** acessível em `/api/docs`
- 📂 **Banco de dados em memória** (simulação leve e rápida para testes)
- ⚙️ Estrutura escalável, separada em camadas para fácil manutenção

---

## Notas de Versão

### 2.1.0
- Alerta de estoque baixo automático (pedidos): ao criar um pedido, se algum produto ficar com estoque ≤ 5, é registrado um aviso no console e retornado em `data.mensagens` no JSON. A venda não é bloqueada.
- Sugestão de reajuste de preço (produtos): em `PUT/PATCH /api/produtos/{id}`, se o custo novo for maior que o anterior, a resposta inclui `sugestao: "O custo aumentou. Considere revisar o preco de venda."` mantendo compatibilidade com a resposta anterior (`updated: true`).
- CMV mais descritivo (relatórios): `GET /api/relatorios/cmv` agora retorna também `lucro_bruto_total` e `lucro_percentual`, além de `cmv_total`, `cmv_base` e `periodo`. Em ausência de pedidos, os valores retornam 0.

Documentação e coleções:
- Swagger atualizado para refletir os novos campos de CMV e o formato de retorno de atualização de produto.
- Postman atualizado com testes que verificam `data.mensagens` em criação de pedido, `sugestao` em atualização de produto e os novos campos do CMV.


## 🧱 Arquitetura da Aplicação

contacerta-api/
├── src/
│ ├── routes/ # Rotas da aplicação
│ ├── controllers/ # Lógica de controle e retorno das requisições
│ ├── services/ # Regras de negócio e cálculos
│ ├── models/ # Estrutura dos dados (in-memory)
│ ├── utils/ # Funções auxiliares (JWT, validações, logs)
│ └── recursos/ # Arquivos de documentação (Swagger)
├── tests/ # Casos e scripts de teste (em desenvolvimento)
├── .env.example # Exemplo de variáveis de ambiente
├── swagger.yaml # Definição completa dos endpoints
└── README.md # Este arquivo

yaml
Copiar código

---

## ⚙️ Tecnologias Utilizadas

| Tecnologia | Finalidade |
|-------------|-------------|
| **Node.js** | Ambiente de execução |
| **Express** | Framework web |
| **Swagger UI** | Documentação interativa |
| **JWT (jsonwebtoken)** | Autenticação e segurança |
| **Nodemon** | Atualização automática em desenvolvimento |
| **Dotenv** | Configuração de variáveis de ambiente |

---

## 📦 Requisitos

- Node.js v18+
- npm (ou yarn)
- Postman / Swagger UI para testes

---

## 💻 Instalação e Execução

```bash
# 1. Instale as dependências
npm install

# 2. Configure o ambiente
cp .env.example .env

# 3. Inicie o servidor
npm run dev
Acesse no navegador:
👉 http://localhost:3000/api/docs

🔑 Credenciais de Teste (Demo)
json
Copiar código
{
  "email": "admin@contacerta.com",
  "senha": "admin123"
}
🧠 Exemplos de Endpoints
Método	Rota	Descrição
POST	/api/auth/login	Gera token JWT para autenticação
GET	/api/clientes	Lista todos os clientes
POST	/api/clientes	Cadastra novo cliente
GET	/api/produtos	Retorna produtos cadastrados
POST	/api/pedidos	Registra novo pedido
GET	/api/relatorios/cmv	Exibe relatório de CMV e rendimento

🧾 Relatórios Automáticos (CMV e Rendimento)
A API calcula automaticamente o CMV (Custo da Mercadoria Vendida) e o rendimento individual de cada produto, considerando:

Custo unitário

Margem de lucro

Volume de vendas

Além disso, há um serviço automático (cron) que recalcula os valores periodicamente e armazena o histórico em memória para análise.

🧪 Testes e QA
📍 Este projeto está em fase de testes manuais e automatizados.
Atualmente estão sendo elaborados casos de teste baseados em cenários funcionais e negativos, com foco em:

Caminho feliz e alternativo

Validação de payloads e status codes

Testes de autenticação JWT

Documentação de defeitos e evidências

Em breve será integrada automação com Cypress e Postman.

🧭 Documentação Swagger
Acesse a documentação interativa pelo navegador:
👉 http://localhost:3000/api/docs

Lá é possível:

Testar cada endpoint

Ver exemplos de request/response

Gerar tokens JWT automaticamente

🧩 Futuras Implementações
Integração com banco de dados (SQLite ou MongoDB)

Exportação de relatórios em PDF

Integração com frontend (React.js)

Automação de testes com Jest e Cypress

Deploy em ambiente público (Render ou Railway)

👤 Autor
Jefferson Paulo Barbosa
📍 Técnico de Qualidade | QA Engineer | Analista de Testes
🔗 LinkedIn
💻 Projeto desenvolvido como parte da Mentoria de Testes de Software – Júlio de Lima

🏁 Licença
Este projeto é open-source e distribuído sob a licença MIT.
Sinta-se à vontade para estudar, melhorar e utilizar para fins educacionais e profissionais.

⚠️ Status do Projeto: Em desenvolvimento e fase de testes de QA.
A API está funcional, mas novas features e validações serão adicionadas conforme evolução da mentoria.

✨ "Qualidade não é um ato, é um hábito." — Aristóteles

yaml
Copiar código

---

Quer que eu adicione também uma **seção de “Contexto da Mentoria”**, explicando brevemente o objetivo do módulo (por exemplo: “Desafio prático de criação de uma API RESTful para estudos de testes manuais e automação”)?  
Isso deixaria o README ainda mais alinhado com o formato usado por Júlio na mentoria.
