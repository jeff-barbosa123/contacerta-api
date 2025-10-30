// Ã°Å¸â€œÂ¦ ImportaÃƒÂ§ÃƒÂµes principais
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';

// Ã°Å¸â€œÂ Rotas principais
import authRoutes from './routes/authRoutes.js';
import clientesRoutes from './routes/clientesRoutes.js';
import produtosRoutes from './routes/produtosRoutes.js';
import pedidosRoutes from './routes/pedidosRoutes.js';
\nimport custosRoutes from './routes/custosRoutes.js';\nimport perdasRoutes from './routes/perdasRoutes.js';

// Ã¢Å¡â„¢Ã¯Â¸Â Middlewares e serviÃƒÂ§os
import { errorHandler } from './middlewares/errorHandler.js';
import { scheduleCmvUpdater } from './services/cmvService.js';

// Ã°Å¸Å¡â‚¬ Inicializa o app Express
const app = express();
app.use(express.json());

// Ã°Å¸Å’Â ConfiguraÃƒÂ§ÃƒÂ£o de CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Ã°Å¸â€œËœ Caminhos absolutos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ã°Å¸â€œâ€ž Swagger Ã¢â‚¬â€ caminho do arquivo YAML
const swaggerPath = path.join(__dirname, 'recursos', 'swagger.yaml');
const swaggerDocument = YAML.load(swaggerPath);

// ðŸ†• v2.1.0 â€“ ValidaÃ§Ã£o de configuraÃ§Ã£o em produÃ§Ã£o
if ((process.env.NODE_ENV || 'development') === 'production' && !process.env.JWT_SECRET) {
  // Em produÃ§Ã£o, exigimos JWT_SECRET definido
  // Para evitar derrubar ambientes de teste, apenas encerra em produÃ§Ã£o
  // eslint-disable-next-line no-console
  console.error('[Config] JWT_SECRET ausente em produÃ§Ã£o. Defina a variÃ¡vel de ambiente JWT_SECRET.');
  process.exit(1);
}

// Ã°Å¸â€“Â¼Ã¯Â¸Â Pasta pÃƒÂºblica para logo
app.use('/public', express.static(path.join(__dirname, 'public')));

// Ã°Å¸Å’â€” Swagger com tema escuro + logo oficial Conta Certa
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: `
    body { background-color: #0d1117 !important; }
    .topbar { background-color: #161b22 !important; border-bottom: 2px solid #30363d !important; }
    .swagger-ui .topbar-wrapper img {
      content: url("/public/ContaCerta.png.png");
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
  customSiteTitle: 'API Conta Certa v3 Ã¢â‚¬â€ DocumentaÃƒÂ§ÃƒÂ£o Oficial',
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: 'list',
    displayRequestDuration: true,
    tryItOutEnabled: true,
  },
}));

// Ã°Å¸Å¡â‚¬ Rotas principais
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/pedidos', pedidosRoutes);
\napp.use('/api/custos', custosRoutes);\napp.use('/api/perdas', perdasRoutes);

// Ã°Å¸Â©Âº Healthcheck
app.get('/', (req, res) => res.json({ status: 'API Conta Certa em execuÃ§Ã£o' }));

// Ã¢Å¡Â Ã¯Â¸Â Tratamento global de erros
app.use(errorHandler);

// Ã¢ÂÂ° AtualizaÃƒÂ§ÃƒÂ£o automÃƒÂ¡tica de CMV (via CRON)
if (process.env.DISABLE_CRON !== '1') {
  scheduleCmvUpdater();
}

// Ã°Å¸â€œÂ¤ Exporta o app para uso no server.js
export default app;

