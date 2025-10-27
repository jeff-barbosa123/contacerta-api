// 📦 Importações principais
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';

// 📁 Rotas principais
import authRoutes from './routes/authRoutes.js';
import clientesRoutes from './routes/clientesRoutes.js';
import produtosRoutes from './routes/produtosRoutes.js';
import pedidosRoutes from './routes/pedidosRoutes.js';
import relatoriosRoutes from './routes/relatoriosRoutes.js';

// ⚙️ Middlewares e serviços
import { errorHandler } from './middlewares/errorHandler.js';
import { scheduleCmvUpdater } from './services/cmvService.js';

// 🚀 Inicializa o app Express
const app = express();
app.use(express.json());

// 🌍 Configuração de CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 📘 Caminhos absolutos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📄 Swagger — caminho do arquivo YAML
const swaggerPath = path.join(__dirname, 'recursos', 'swagger.yaml');
const swaggerDocument = YAML.load(swaggerPath);

// 🖼️ Pasta pública para logo
app.use('/public', express.static(path.join(__dirname, 'public')));

// 🌗 Swagger com tema escuro + logo oficial Conta Certa
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: `
    body { background-color: #0d1117 !important; }
    .topbar { background-color: #161b22 !important; border-bottom: 2px solid #30363d !important; }
    .swagger-ui .topbar-wrapper img {
      content: url("/public/ContaCerta.png");
      width: 120px;
      height: auto;
      margin-right: 10px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(255,255,255,0.15);
    }
    .swagger-ui .topbar a span {
      color: #58a6ff !important;
      font-weight: bold;
      font-size: 18px;
    }
    .swagger-ui .info { color: #c9d1d9 !important; }
    .swagger-ui .opblock-summary-method { background: #2ea043 !important; }
    .swagger-ui .opblock.opblock-get { border-color: #58a6ff !important; }
    .swagger-ui .opblock.opblock-post { border-color: #238636 !important; }
    .swagger-ui .opblock.opblock-put { border-color: #d29922 !important; }
    .swagger-ui .opblock.opblock-patch { border-color: #6aa84f !important; }
    .swagger-ui .opblock.opblock-delete { border-color: #f85149 !important; }
    .swagger-ui .opblock-summary-path, .swagger-ui .opblock-summary-description { color: #adbac7 !important; }
    .swagger-ui .model-box, .swagger-ui .model-title, .swagger-ui .response-col_description { color: #8b949e !important; }
  `,
  customSiteTitle: 'API Conta Certa v3 — Documentação Oficial',
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: 'list',
    displayRequestDuration: true,
    tryItOutEnabled: true,
  },
}));

// 🚀 Rotas principais
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/relatorios', relatoriosRoutes);

// 🩺 Healthcheck
app.get('/', (req, res) => res.json({ status: '✅ API Conta Certa em execução' }));

// ⚠️ Tratamento global de erros
app.use(errorHandler);

// ⏰ Atualização automática de CMV (via CRON)
if (process.env.DISABLE_CRON !== '1') {
  scheduleCmvUpdater();
}

// 📤 Exporta o app para uso no server.js
export default app;