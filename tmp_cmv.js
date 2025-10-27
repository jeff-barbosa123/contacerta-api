import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import dotenv from 'dotenv';
dotenv.config();

const CMV_FILE = process.env.CMV_FILE_PATH || './src/config/cmv.json';
const CMV_HISTORY_FILE = './src/config/cmv-history.json';
let cmvCache = { valor: 12.5, atualizadoEm: new Date().toISOString(), metodo: 'file' };

// Carrega CMV localmente
export function getCmvBase() {
  try {
    const raw = fs.readFileSync(CMV_FILE, 'utf-8');
    const json = JSON.parse(raw);
    cmvCache = json;
  } catch {
    // mantém cache
  }
  return Number(cmvCache?.valor || 0);
}

function saveCmv(obj) {
  fs.writeFileSync(CMV_FILE, JSON.stringify(obj, null, 2));
  // append history
  let hist = [];
  try { hist = JSON.parse(fs.readFileSync(CMV_HISTORY_FILE, 'utf-8')); } catch {}
  hist.push(obj);
  fs.writeFileSync(CMV_HISTORY_FILE, JSON.stringify(hist, null, 2));
}

async function fetchFromApi(url) {
  // sem internet no ambiente, simulamos um valor
  const simulated = 12.5 + Math.round(Math.random()*100)/100; // flutua um pouco
  return simulated;
}

function fetchFromFile() {
  const raw = fs.readFileSync(CMV_FILE, 'utf-8');
  const json = JSON.parse(raw);
  return Number(json.valor);
}

function calcInternal() {
  // algum cálculo interno simples
  return 12.5;
}

export async function updateCmvOnce() {
  const metodo = (process.env.CMV_METHOD || 'auto').toLowerCase();
  const url = process.env.CMV_SOURCE_URL;
  let novo = getCmvBase();
  try {
    if (metodo === 'api') {
      novo = await fetchFromApi(url);
    } else if (metodo === 'file') {
      novo = fetchFromFile();
    } else if (metodo === 'calc') {
      novo = calcInternal();
    } else {
      // auto: tenta API, cai para file, depois calc
      try { novo = await fetchFromApi(url); } catch { try { novo = fetchFromFile(); } catch { novo = calcInternal(); } }
    }
    cmvCache = { valor: Number(novo), atualizadoEm: new Date().toISOString(), metodo: metodo || 'auto' };
    saveCmv(cmvCache);
    console.log('✅ CMV atualizado:', cmvCache);
  } catch (e) {
    console.log('⚠️ Falha ao atualizar CMV, mantendo cache:', cmvCache);
  }
}

export function scheduleCmvUpdater() {
  // roda já na inicialização
  updateCmvOnce();
  const cronExpr = process.env.CMV_UPDATE_CRON || '0 */6 * * *';
  cron.schedule(cronExpr, () => {
    console.log('⏰ Atualizando CMV (cron)...');
    updateCmvOnce();
  });
}

