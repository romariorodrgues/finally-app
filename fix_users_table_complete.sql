-- Script para verificar estrutura e adicionar colunas necessárias na tabela users
-- Execute no SQL Editor do Supabase Studio

-- Verificar estrutura atual da tabela users
SELECT 'Estrutura atual da tabela users:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- Verificar usuários existentes
SELECT 'Usuários existentes:' as info;
SELECT * FROM public.users WHERE email = 'admin@finally.app';

-- Adicionar colunas necessárias se não existirem
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS password TEXT,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT true;

-- Verificar estrutura após adicionar colunas
SELECT 'Estrutura após adicionar colunas:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- Atualizar role para admin e definir nome
UPDATE public.users 
SET 
  role = 'admin',
  name = 'Admin Finally',
  email_verified = true,
  updated_at = now()
WHERE email = 'admin@finally.app';

-- Verificar se a atualização foi bem-sucedida
SELECT 'Usuário após atualização:' as info;
SELECT 
  id,
  email,
  role,
  name,
  email_verified,
  created_at,
  updated_at
FROM public.users 
WHERE email = 'admin@finally.app';

-- Verificar todos os usuários para referência
SELECT 'Todos os usuários:' as info;
SELECT 
  email,
  role,
  name,
  email_verified,
  created_at
FROM public.users 
ORDER BY created_at;
