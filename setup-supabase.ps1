# Script de setup do Supabase para desenvolvimento local (Windows)
# Execute este script após instalar o Docker Desktop

Write-Host "🚀 Configurando Supabase para desenvolvimento local..." -ForegroundColor Green

# Verificar se o Docker está rodando
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker não está rodando. Por favor, inicie o Docker Desktop e tente novamente." -ForegroundColor Red
    exit 1
}

# Iniciar o Supabase local
Write-Host "📦 Iniciando serviços locais do Supabase..." -ForegroundColor Yellow
npx supabase start

# Aguardar serviços ficarem prontos
Write-Host "⏳ Aguardando serviços ficarem prontos..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Executar migrações
Write-Host "🔧 Executando migrações do banco de dados..." -ForegroundColor Yellow
npx supabase db reset

Write-Host "✅ Setup do Supabase concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Informações de acesso:" -ForegroundColor Cyan
Write-Host "Local API: http://localhost:54321" -ForegroundColor White
Write-Host "Studio: http://localhost:54323" -ForegroundColor White
Write-Host "Inbucket: http://localhost:54324" -ForegroundColor White
Write-Host ""
Write-Host "🔑 Credenciais de teste:" -ForegroundColor Cyan
Write-Host "Admin: admin@finally.app / Admin123456!!14!" -ForegroundColor White
Write-Host "Terapeuta: therapist@finally.app / Therapist123!" -ForegroundColor White
Write-Host "Usuário: user@finally.app / User123!" -ForegroundColor White
Write-Host ""
Write-Host "📋 Para parar os serviços: npx supabase stop" -ForegroundColor Yellow
