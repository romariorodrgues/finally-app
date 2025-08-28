-- Script para criar usuários de teste diretamente no Supabase Auth
-- Execute no SQL Editor do Supabase Studio

-- 1. Primeiro, criar usuários no sistema de autenticação
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_sent_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin
) VALUES 
(
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated', 
    'admin@finally.app',
    crypt('Admin123456!!14!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false
),
(
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'therapist@finally.app', 
    crypt('Therapist123!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false
),
(
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'user@finally.app',
    crypt('User123!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false
)
ON CONFLICT (email) DO NOTHING;

-- 2. Atualizar roles na tabela pública (o trigger deve ter criado os registros)
UPDATE public.users SET role = 'admin' WHERE email = 'admin@finally.app';
UPDATE public.users SET role = 'therapist' WHERE email = 'therapist@finally.app'; 
UPDATE public.users SET role = 'user' WHERE email = 'user@finally.app';

-- 3. Verificar usuários criados
SELECT id, email, role FROM public.users WHERE email LIKE '%@finally.app';
