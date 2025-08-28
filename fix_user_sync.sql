-- Script de diagnóstico e correção para usuários não sincronizados
-- Execute no SQL Editor do Supabase Studio

-- ========================================
-- 1. VERIFICAR USUÁRIOS NO AUTH
-- ========================================
SELECT 'Usuários no auth.users:' as tipo;
SELECT id, email, created_at FROM auth.users WHERE email LIKE '%@finally.app' ORDER BY created_at;

-- ========================================
-- 2. VERIFICAR USUÁRIOS NA TABELA PÚBLICA
-- ========================================
SELECT 'Usuários na public.users:' as tipo;
SELECT id, email, role, created_at FROM public.users WHERE email LIKE '%@finally.app' ORDER BY created_at;

-- ========================================
-- 3. ENCONTRAR USUÁRIOS DESCONECTADOS
-- ========================================
SELECT 'Usuários auth que não estão em public:' as tipo;
SELECT au.id, au.email, au.created_at 
FROM auth.users au 
LEFT JOIN public.users pu ON au.id = pu.id 
WHERE pu.id IS NULL AND au.email LIKE '%@finally.app';

-- ========================================
-- 4. SINCRONIZAR USUÁRIOS FALTANTES
-- ========================================
-- Inserir usuários do auth.users que não estão em public.users
INSERT INTO public.users (id, email, role, created_at, updated_at)
SELECT 
    au.id, 
    au.email, 
    CASE 
        WHEN au.email = 'admin@finally.app' THEN 'admin'
        WHEN au.email = 'therapist@finally.app' THEN 'therapist'
        ELSE 'user'
    END as role,
    au.created_at,
    NOW() as updated_at
FROM auth.users au 
LEFT JOIN public.users pu ON au.id = pu.id 
WHERE pu.id IS NULL AND au.email LIKE '%@finally.app'
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    updated_at = NOW();

-- ========================================
-- 5. VERIFICAR RESULTADO FINAL
-- ========================================
SELECT 'Resultado final - Usuários sincronizados:' as tipo;
SELECT pu.id, pu.email, pu.role, pu.created_at 
FROM public.users pu 
WHERE pu.email LIKE '%@finally.app' 
ORDER BY pu.created_at;

-- ========================================
-- 6. TESTAR TRIGGER DE SINCRONIZAÇÃO
-- ========================================
-- Verificar se o trigger está funcionando
SELECT 'Triggers ativos:' as tipo;
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- ========================================
-- ✅ SINCRONIZAÇÃO CONCLUÍDA!
-- ========================================
-- Agora você pode tentar fazer login novamente
