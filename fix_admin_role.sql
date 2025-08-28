-- Script para verificar e corrigir o role do usuário admin
-- Execute no SQL Editor do Supabase Studio

-- Verificar usuário atual na tabela users
SELECT 'Usuário atual na tabela users:' as info;
SELECT 
  id,
  email,
  role,
  name,
  created_at,
  updated_at
FROM public.users 
WHERE email = 'admin@finally.app';

-- Atualizar role para admin se necessário
UPDATE public.users 
SET 
  role = 'admin',
  name = 'Admin Finally',
  updated_at = now()
WHERE email = 'admin@finally.app';

-- Verificar se a atualização foi bem-sucedida
SELECT 'Usuário após atualização:' as info;
SELECT 
  id,
  email,
  role,
  name,
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
  created_at
FROM public.users 
ORDER BY created_at;
