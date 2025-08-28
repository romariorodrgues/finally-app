-- 🚀 MIGRATION SIMPLIFICADA - SEM USUÁRIOS DE TESTE
-- Execute este script primeiro no SQL Editor do Supabase Studio
-- Dashboard > SQL Editor > New Query > Cole este código > Run

-- ========================================
-- 1. EXTENSÕES E CONFIGURAÇÕES INICIAIS
-- ========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- 2. TABELAS PRINCIPAIS
-- ========================================

-- Tabela de usuários públicos (sincronizada com auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'therapist')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de perfis
CREATE TABLE IF NOT EXISTS public.profiles (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    birth_date DATE NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'non_binary', 'other')),
    location_city TEXT NOT NULL,
    location_state TEXT NOT NULL,
    location_country TEXT DEFAULT 'Brasil',
    occupation TEXT,
    education_level TEXT,
    height_cm INTEGER,
    relationship_status TEXT NOT NULL CHECK (relationship_status IN ('single', 'divorced', 'widowed')),
    has_children BOOLEAN DEFAULT FALSE,
    wants_children TEXT,
    children_count INTEGER DEFAULT 0,
    bio TEXT,
    interests TEXT[],
    photos TEXT[],
    profile_completion_percentage INTEGER DEFAULT 0,
    is_profile_public BOOLEAN DEFAULT TRUE,
    last_active TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de leads
CREATE TABLE IF NOT EXISTS public.leads (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    age INTEGER,
    city TEXT,
    how_did_you_hear TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'rejected')),
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de questionários
CREATE TABLE IF NOT EXISTS public.questionnaires (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    responses JSONB NOT NULL DEFAULT '{}',
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de matches
CREATE TABLE IF NOT EXISTS public.matches (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    therapist_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    compatibility_score FLOAT DEFAULT 0,
    match_reasons TEXT[],
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active')),
    admin_approved_by UUID REFERENCES public.users(id),
    admin_approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, therapist_id)
);

-- Tabela de chats
CREATE TABLE IF NOT EXISTS public.chats (
    id SERIAL PRIMARY KEY,
    match_id INTEGER REFERENCES public.matches(id) ON DELETE CASCADE,
    participant_1_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    participant_2_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de mensagens
CREATE TABLE IF NOT EXISTS public.messages (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER REFERENCES public.chats(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de reports/denúncias
CREATE TABLE IF NOT EXISTS public.reports (
    id SERIAL PRIMARY KEY,
    reporter_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    message_id INTEGER REFERENCES public.messages(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    reviewed_by UUID REFERENCES public.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 3. TRIGGERS PARA UPDATED_AT
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas relevantes
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_questionnaires_updated_at ON public.questionnaires;
CREATE TRIGGER update_questionnaires_updated_at BEFORE UPDATE ON public.questionnaires FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_matches_updated_at ON public.matches;
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON public.matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chats_updated_at ON public.chats;
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON public.chats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ========================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 5. POLÍTICAS DE SEGURANÇA
-- ========================================

-- Usuários podem ver seus próprios dados
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own data" ON public.users;
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Perfis são visíveis para usuários autenticados, mas editáveis apenas pelo dono
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Admins podem ver tudo
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- ========================================
-- 6. FUNÇÃO DE SINCRONIZAÇÃO AUTH
-- ========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, role)
    VALUES (NEW.id, NEW.email, 'user');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar usuário na tabela pública quando criado no auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- 7. DADOS DE TESTE BÁSICOS (SEM USUÁRIOS)
-- ========================================

-- Inserir alguns leads de exemplo
INSERT INTO public.leads (
  first_name, last_name, email, phone, age, city,
  how_did_you_hear, status, created_at, updated_at
) VALUES 
('Ana', 'Costa', 'ana.costa@email.com', '(11) 99999-1111', 28, 'São Paulo', 'Google', 'pending', NOW(), NOW()),
('Carlos', 'Lima', 'carlos.lima@email.com', '(21) 99999-2222', 35, 'Rio de Janeiro', 'Indicação', 'pending', NOW(), NOW()),
('Fernanda', 'Oliveira', 'fernanda.oliveira@email.com', '(31) 99999-3333', 29, 'Belo Horizonte', 'Instagram', 'converted', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- ========================================
-- ✅ SCHEMA CRIADO COM SUCESSO!
-- ========================================
-- 
-- PRÓXIMOS PASSOS:
-- 1. Use a API para criar usuários de teste:
--    POST http://localhost:3000/api/create-test-users
-- 
-- 2. Credenciais de teste (após criar via API):
--    admin@finally.app / Admin123456!!14!
--    therapist@finally.app / Therapist123!
--    user@finally.app / User123!
