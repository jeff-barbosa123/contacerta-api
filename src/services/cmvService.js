import fs from 'fs';
import cron from 'node-cron';
import dotenv from 'dotenv';
dotenv.config();

// 📁 Caminhos dos arquivos CMV
const CMV_FILE = process.env.CMV_FILE_PATH || './src/config/cmv.json';
const CMV_HISTORY_FILE = './src/config/cmv-history.json';

// 🧠 Cache em memória (fallback)
let cmvCache = { valor: 12.5, atualizadoEm: new Date().toISOString(), metodo: 'file' };

// 🔹 Carrega CMV base do arquivo (com fallback)
export function getCmvBase() {
  try {
    const raw = fs.readFileSync(CMV_FILE, 'utf-8');
    cmvCache = JSON.parse(raw);
  } catch {
    console.warn('[CMV] Usando valor em cache (sem arquivo local)');
  }
  return Number(cmvCache?.valor || 0);
}

// 🔹 Salva CMV e histórico local
function saveCmv(obj) {
  fs.writeFileSync(CMV_FILE, JSON.stringify(obj, null, 2));

  let hist = [];
  try {
    hist = JSON.parse(fs.readFileSync(CMV_HISTORY_FILE, 'utf-8'));
  } catch {}
  hist.push(obj);

  fs.writeFileSync(CMV_HISTORY_FILE, JSON.stringify(hist, null, 2));
}

// 🔹 Simula leitura de API externa
async function fetchFromApi(url) {
  const simulated = 12.5 + Math.round(Math.random() * 100) / 100;
  return simulated;
}

// 🔹 Lê arquivo de CMV local
function fetchFromFile() {
  const raw = fs.readFileSync(CMV_FILE, 'utf-8');
  const json = JSON.parse(raw);
  return Number(json.valor);
}

// 🔹 Calcula internamente (fallback)
function calcInternal() {
  return 12.5;
}

// 🔹 Atualiza CMV apenas uma vez
export async function updateCmvOnce() {
  const metodo = (process.env.CMV_METHOD || 'auto').toLowerCase();
  const url = process.env.CMV_SOURCE_URL;
  let novo = getCmvBase();

  try {
    if (metodo === 'api') novo = await fetchFromApi(url);
    else if (metodo === 'file') novo = fetchFromFile();
    else if (metodo === 'calc') novo = calcInternal();
    else {
      // modo auto: tenta api > file > calc
      try {
        novo = await fetchFromApi(url);
      } catch {
        try {
          novo = fetchFromFile();
        } catch {
          novo = calcInternal();
        }
      }
    }

    cmvCache = {
      valor: Number(novo),
      atualizadoEm: new Date().toISOString(),
      metodo: metodo || 'auto'
    };

    saveCmv(cmvCache);
    console.log('[CMV] Atualizado com sucesso:', cmvCache);
  } catch (e) {
    console.error('[CMV] Falha ao atualizar, mantendo cache:', cmvCache);
  }
}

// 🔹 Agendamento de atualização automática
export function scheduleCmvUpdater() {
  updateCmvOnce(); // roda ao iniciar
  const cronExpr = process.env.CMV_UPDATE_CRON || '0 */6 * * *';
  cron.schedule(cronExpr, () => {
    console.log('[CMV] Atualizando (cron)...');
    updateCmvOnce();
  });
}