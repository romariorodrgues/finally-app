-- Script para criar usuário admin completo no sistema Finally
-- Este script cria o usuário na tabela public.users que é onde o NextAuth procura

-- Primeiro, verificar se existe um usuário na auth.users
SELECT 'Usuários em auth.users:' as info;
SELECT id, email, created_at FROM auth.users WHERE email = 'admin@finally.app';

SELECT 'Usuários em public.users:' as info;
SELECT id, email, name, role FROM public.users WHERE email = 'admin@finally.app';

-- Criar o usuário admin na tabela public.users
-- Senha será 'admin123' criptografada com bcrypt
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
  '$2a$10$K7L/G8QvLKu8Pr86VQLjI.rDkfqf3FvLXDqcW3/cQJ6A8zMJm8qKW', -- admin123 criptografada
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

-- Verificar se o usuário foi criado corretamente
SELECT 'Verificação final:' as info;
SELECT 
  id,
  email,
  name,
  role,
  email_verified,
  created_at
FROM public.users 
WHERE email = 'admin@finally.app';

-- Mostrar total de usuários
SELECT 'Total de usuários:' as info, COUNT(*) as total FROM public.users;
