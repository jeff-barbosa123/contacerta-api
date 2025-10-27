#!/usr/bin/env bash
set -e
echo "== Demo ContaCerta =="
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"email":"admin@contacerta.com","senha":"admin123"}' | jq -r '.data.token')
echo "TOKEN: $TOKEN"
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/clientes | jq
