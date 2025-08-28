# Setup do Supabase - Finally App

Este guia explica como configurar o Supabase para desenvolvimento local ou usar um projeto online.

## 🚀 Opção 1: Desenvolvimento Local (Recomendado)

### Pré-requisitos
1. **Docker Desktop** instalado e rodando
2. **Node.js 18+** instalado

### Passos para configuração

1. **Instale o Docker Desktop** (se ainda não tiver):
   - Baixe em: https://www.docker.com/products/docker-desktop/
   - Instale e inicie o Docker Desktop

2. **Execute o script de setup**:
   ```powershell
   # No PowerShell (Windows)
   .\setup-supabase.ps1
   ```
   
   Ou execute manualmente:
   ```powershell
   npx supabase start
   npx supabase db reset
   ```

3. **Configuração automática**:
   - O arquivo `.env.local` já está configurado para desenvolvimento local
   - As migrações serão aplicadas automaticamente
   - Usuários de teste serão criados

### Acessos após setup local:
- **API Local**: http://localhost:54321
- **Supabase Studio**: http://localhost:54323 (interface web do banco)
- **Inbucket** (emails): http://localhost:54324

## 🌐 Opção 2: Supabase Online

### Se preferir usar um projeto Supabase online:

1. **Crie uma conta** em https://supabase.com
2. **Crie um novo projeto**
3. **Obtenha as credenciais** no painel do projeto
4. **Edite o arquivo `.env.local`**:
   ```env
   # Comente as linhas locais e descomente estas:
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
   SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
   ```

5. **Execute as migrações online**:
   ```powershell
   npx supabase link --project-ref seu-project-id
   npx supabase db push
   ```

## 👤 Usuários de Teste

Após o setup, você terá estes usuários disponíveis:

### Administrador
- **Email**: `admin@finally.app`
- **Senha**: `Admin123456!!14!`
- **Acesso**: Painel administrativo completo

### Terapeuta
- **Email**: `therapist@finally.app`
- **Senha**: `Therapist123!`
- **Acesso**: Dashboard do terapeuta

### Usuário/Paciente
- **Email**: `user@finally.app`
- **Senha**: `User123!`
- **Acesso**: Interface do paciente

## 🔧 Comandos Úteis

```powershell
# Iniciar Supabase local
npx supabase start

# Parar Supabase local
npx supabase stop

# Resetar banco (reaplica migrações)
npx supabase db reset

# Ver status dos serviços
npx supabase status

# Acessar o banco via SQL
npx supabase db shell

# Ver logs
npx supabase logs
```

## ⚙️ Estrutura do Banco

O banco inclui as seguintes tabelas:
- `users` - Usuários do sistema
- `profiles` - Perfis detalhados
- `questionnaires` - Questionários para matching
- `matches` - Matches entre pacientes e terapeutas
- `chats` - Conversas
- `messages` - Mensagens do chat
- `reports` - Denúncias/relatórios
- `leads` - Leads de marketing

## 🔐 Segurança

- Row Level Security (RLS) habilitado
- Políticas de acesso configuradas
- Trigger de sincronização auth.users ↔ public.users

## 🐛 Troubleshooting

### Docker não encontrado
```
Erro: Docker não está rodando
Solução: Inicie o Docker Desktop
```

### Porta já em uso
```
Erro: Port 54321 already in use
Solução: npx supabase stop && npx supabase start
```

### Migrações falharam
```
Solução: npx supabase db reset
```

## 📱 Testando a Configuração

1. **Reinicie o servidor Next.js**:
   ```powershell
   npm run dev
   ```

2. **Acesse**: http://localhost:3000

3. **Faça login** com qualquer um dos usuários de teste

4. **Teste a API** de criação de usuários:
   ```powershell
   curl -X POST http://localhost:3000/api/create-test-users
   ```
