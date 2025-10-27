import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.DISABLE_CRON = '1';
import app from '../src/app.js';

let server;
let baseURL;

before(() => {
  server = app.listen(0);
  const { port } = server.address();
  baseURL = `http://127.0.0.1:${port}`;
});

after(() => {
  server?.close();
});

async function login() {
  const res = await fetch(`${baseURL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@contacerta.com', senha: 'admin123' })
  });
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.ok(json?.data?.token);
  return json.data.token;
}

test('healthcheck', async () => {
  const res = await fetch(`${baseURL}/`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, 'API ContaCerta em execucao');
});

test('login retorna token', async () => {
  const token = await login();
  assert.ok(token.length > 20);
});

test('clientes protegido retorna lista', async () => {
  const token = await login();
  const res = await fetch(`${baseURL}/api/clientes`, { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.status, 200);
  assert.ok(Array.isArray(json.data));
});

test('relatorios cmv retorna objeto', async () => {
  const token = await login();
  const res = await fetch(`${baseURL}/api/relatorios/cmv`, { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.status, 200);
  assert.ok(typeof json.data?.cmv_total === 'number');
  assert.ok(typeof json.data?.cmv_base === 'number');
});

