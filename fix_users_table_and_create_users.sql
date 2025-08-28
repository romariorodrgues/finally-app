-- Script para adicionar coluna password à tabela users e criar usuários de teste
-- Execute este script no SQL Editor do Supabase Studio

-- Adicionar coluna password à tabela users se não existir
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS password TEXT,
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Criar usuários de teste com todas as colunas necessárias

-- Criar usuário admin
INSERT INTO public.users (
  id,
  email,
  password,
  name,
  role,
  email_verified,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'admin@finally.app',
  '$2a$10$K7L/G8QvLKu8Pr86VQLjI.rDkfqf3FvLXDqcW3/cQJ6A8zMJm8qKW', -- admin123
  'Admin Finally',
  'admin',
  true,
  now(),
  now()
)
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  email_verified = EXCLUDED.email_verified,
  updated_at = now();

-- Criar usuário comum para teste
INSERT INTO public.users (
  id,
  email,
  password,
  name,
  role,
  email_verified,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'user@finally.app',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
  'Usuário Teste',
  'user',
  true,
  now(),
  now()
)
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  email_verified = EXCLUDED.email_verified,
  updated_at = now();

-- Criar um terapeuta para teste
INSERT INTO public.users (
  id,
  email,
  password,
  name,
  role,
  email_verified,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'therapist@finally.app',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
  'Dr. Terapeuta Teste',
  'therapist',
  true,
  now(),
  now()
)
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  email_verified = EXCLUDED.email_verified,
  updated_at = now();

-- Verificar a estrutura final da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- Verificar usuários criados
SELECT 
  'Usuários criados:' as info,
  id,
  email,
  name,
  role,
  email_verified,
  CASE WHEN password IS NOT NULL THEN 'Senha definida' ELSE 'Sem senha' END as password_status
FROM public.users 
ORDER BY role, email;
