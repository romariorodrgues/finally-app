-- Verificar usuários na tabela auth.users (criados pelo Supabase Auth)
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users 
WHERE email = 'admin@finally.app';

-- Verificar usuários na tabela public.users (necessária para o NextAuth)
SELECT 
  id,
  email,
  name,
  role,
  email_verified,
  created_at
FROM public.users 
WHERE email = 'admin@finally.app';

-- Verificar se existem outros usuários na public.users
SELECT COUNT(*) as total_users FROM public.users;

-- Mostrar estrutura da tabela users para confirmar colunas
\d public.users;
