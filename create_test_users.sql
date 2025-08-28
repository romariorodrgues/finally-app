-- Script para criar usuários de teste completos
-- Cria tanto admin quanto usuário comum para testes

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

-- Verificar usuários criados
SELECT 
  'Usuários criados:' as info,
  email,
  name,
  role,
  email_verified
FROM public.users 
ORDER BY role, email;
