import path from "path";
import { fileURLToPath } from "url";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

// Corrigir o caminho absoluto do YAML
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho do arquivo swagger.yaml
const swaggerPath = path.join(__dirname, "../recursos/swagger.yaml");
const swaggerDocument = YAML.load(swaggerPath);

export function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: "none",
      displayRequestDuration: true,
    },
  }));

  console.log("📘 Swagger UI disponível em: http://localhost:3000/api-docs");
}