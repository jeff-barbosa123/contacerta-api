// Importa variáveis de ambiente do arquivo .env
import dotenv from 'dotenv';
dotenv.config();

// Importa a aplicação principal
import app from './app.js';

// Define a porta a partir do .env ou usa 3000 por padrão
const PORT = process.env.PORT || 3000;

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});