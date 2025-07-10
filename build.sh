#!/bin/bash

echo "🚀 Iniciando build do LenzooCRM..."

# Instalar dependências do frontend
echo "📦 Instalando dependências do frontend..."
npm install

# Build do frontend
echo "🔨 Build do frontend..."
npm run build

# Instalar dependências do backend
echo "📦 Instalando dependências do backend..."
cd backend
npm install

# Build do backend
echo "🔨 Build do backend..."
npm run build

echo "✅ Build concluído com sucesso!" 