#!/bin/bash
# Script de setup do Supabase para desenvolvimento local
# Execute este script após instalar o Docker

echo "🚀 Configurando Supabase para desenvolvimento local..."

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker Desktop e tente novamente."
    exit 1
fi

# Iniciar o Supabase local
echo "📦 Iniciando serviços locais do Supabase..."
npx supabase start

# Aguardar serviços ficarem prontos
echo "⏳ Aguardando serviços ficarem prontos..."
sleep 10

# Executar migrações
echo "🔧 Executando migrações do banco de dados..."
npx supabase db reset

echo "✅ Setup do Supabase concluído!"
echo ""
echo "🎯 Informações de acesso:"
echo "Local API: http://localhost:54321"
echo "Studio: http://localhost:54323"
echo "Inbucket: http://localhost:54324"
echo ""
echo "🔑 Credenciais de teste:"
echo "Admin: admin@finally.app / Admin123456!!14!"
echo "Terapeuta: therapist@finally.app / Therapist123!"
echo "Usuário: user@finally.app / User123!"
echo ""
echo "📋 Para parar os serviços: npx supabase stop"
