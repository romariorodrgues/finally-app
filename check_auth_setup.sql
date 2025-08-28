-- Script para criar usuário usando Supabase Auth
-- Execute este script no SQL Editor do Supabase Studio

-- Primeiro, vamos verificar se já existe usuário na auth.users
SELECT 'Usuários existentes em auth.users:' as info;
SELECT id, email, created_at, email_confirmed_at 
FROM auth.users 
WHERE email = 'admin@finally.app';

-- Se não existir, você precisará criar o usuário via:
-- 1. Supabase Dashboard > Authentication > Users > Add User
-- 2. Ou usar a API do Supabase Auth

-- Verificar tabela public.users
SELECT 'Usuários existentes em public.users:' as info;
SELECT id, email, role, name, created_at 
FROM public.users;

-- Mostrar estrutura da tabela users
SELECT 'Estrutura da tabela public.users:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;
