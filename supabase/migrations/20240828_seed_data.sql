-- Inserir usuários de teste
-- Estes usuários serão criados com senhas conhecidas para desenvolvimento

-- Inserir usuários na tabela pública
INSERT INTO public.users (id, email, role, created_at, updated_at) VALUES 
('b1111111-1111-1111-1111-111111111111', 'admin@finally.app', 'admin', NOW(), NOW()),
('c2222222-2222-2222-2222-222222222222', 'therapist@finally.app', 'therapist', NOW(), NOW()),
('d3333333-3333-3333-3333-333333333333', 'user@finally.app', 'user', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Inserir perfis de exemplo
INSERT INTO public.profiles (
  user_id, first_name, last_name, birth_date, gender, 
  location_city, location_state, relationship_status, 
  profile_completion_percentage, bio, created_at, updated_at
) VALUES 
(
  'b1111111-1111-1111-1111-111111111111',
  'Admin',
  'Sistema',
  '1990-01-01',
  'other',
  'São Paulo',
  'SP',
  'single',
  100,
  'Administrador do sistema Finally App',
  NOW(),
  NOW()
),
(
  'c2222222-2222-2222-2222-222222222222',
  'Dr. Maria',
  'Silva',
  '1985-03-15',
  'female',
  'Rio de Janeiro',
  'RJ',
  'single',
  100,
  'Psicóloga especializada em terapia cognitivo-comportamental. 10 anos de experiência em atendimento clínico.',
  NOW(),
  NOW()
),
(
  'd3333333-3333-3333-3333-333333333333',
  'João',
  'Santos',
  '1992-07-20',
  'male',
  'Belo Horizonte',
  'MG',
  'single',
  80,
  'Em busca de apoio psicológico para desenvolvimento pessoal.',
  NOW(),
  NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  updated_at = NOW();

-- Inserir questionário de exemplo para o usuário
INSERT INTO public.questionnaires (user_id, responses, is_completed, created_at, updated_at) VALUES 
(
  'd3333333-3333-3333-3333-333333333333',
  '{
    "preferred_therapy_type": "cognitive_behavioral",
    "session_frequency": "weekly",
    "main_concerns": ["anxiety", "stress"],
    "previous_therapy": false,
    "preferred_gender": "any",
    "age_preference": "any"
  }',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
  responses = EXCLUDED.responses,
  is_completed = EXCLUDED.is_completed,
  updated_at = NOW();

-- Criar um match de exemplo
INSERT INTO public.matches (
  user_id, therapist_id, compatibility_score, 
  match_reasons, status, created_at, updated_at
) VALUES 
(
  'd3333333-3333-3333-3333-333333333333',
  'c2222222-2222-2222-2222-222222222222',
  0.85,
  ARRAY['Especialização em ansiedade', 'Localização próxima', 'Disponibilidade compatível'],
  'pending',
  NOW(),
  NOW()
)
ON CONFLICT (user_id, therapist_id) DO UPDATE SET
  compatibility_score = EXCLUDED.compatibility_score,
  match_reasons = EXCLUDED.match_reasons,
  updated_at = NOW();

-- Inserir alguns leads de exemplo
INSERT INTO public.leads (
  first_name, last_name, email, phone, age, city,
  how_did_you_hear, status, created_at, updated_at
) VALUES 
('Ana', 'Costa', 'ana.costa@email.com', '(11) 99999-1111', 28, 'São Paulo', 'Google', 'pending', NOW(), NOW()),
('Carlos', 'Lima', 'carlos.lima@email.com', '(21) 99999-2222', 35, 'Rio de Janeiro', 'Indicação', 'pending', NOW(), NOW()),
('Fernanda', 'Oliveira', 'fernanda.oliveira@email.com', '(31) 99999-3333', 29, 'Belo Horizonte', 'Instagram', 'converted', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
