#!/bin/bash

echo "🚀 Instalando dependências do Salvatore..."
echo ""

echo "📦 Instalando backend..."
cd backend
npm install
cd ..
echo "✅ Backend instalado"
echo ""

echo "📦 Instalando frontend..."
cd frontend
npm install
cd ..
echo "✅ Frontend instalado"
echo ""

echo "✅ Instalação concluída!"
echo ""
echo "Para iniciar o projeto:"
echo "1. Em um terminal: cd backend && npm run dev"
echo "2. Em outro terminal: cd frontend && npm run dev"
echo "3. Acesse: http://localhost:5173"
