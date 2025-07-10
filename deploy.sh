#!/bin/bash

echo "🚀 Iniciando deploy do LenzooCRM..."

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Por favor, instale o Docker primeiro."
    exit 1
fi

# Verificar se o Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
    exit 1
fi

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down

# Remover imagens antigas (opcional)
read -p "Deseja remover imagens antigas? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️ Removendo imagens antigas..."
    docker-compose down --rmi all
fi

# Build das imagens
echo "🔨 Fazendo build das imagens..."
docker-compose build --no-cache

# Iniciar serviços
echo "🚀 Iniciando serviços..."
docker-compose up -d

# Aguardar serviços ficarem prontos
echo "⏳ Aguardando serviços ficarem prontos..."
sleep 30

# Verificar status dos containers
echo "📊 Status dos containers:"
docker-compose ps

# Verificar logs
echo "📋 Logs dos serviços:"
docker-compose logs --tail=20

echo "✅ Deploy concluído!"
echo "🌐 Frontend: http://localhost"
echo "🔧 Backend API: http://localhost/api"
echo "📊 Banco de dados: localhost:5432"

echo ""
echo "📝 Para ver os logs em tempo real:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Para parar os serviços:"
echo "   docker-compose down" 