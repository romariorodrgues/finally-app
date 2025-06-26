# Finally App 🧠💙

Sistema de psicoterapia que conecta pacientes e terapeutas através de matching inteligente baseado em questionários personalizados.

## 🎯 Visão Geral

O Finally App é uma plataforma completa de telemedicina focada em saúde mental, que facilita o encontro entre pacientes e terapeutas através de um algoritmo de matching baseado em questionários detalhados, preferências e necessidades específicas.

## ✨ Funcionalidades Implementadas

### 🔐 **Sistema de Autenticação**
- Login/logout seguro com Supabase Auth
- Sistema de roles: `patient`, `therapist`, `admin`
- Middleware de proteção de rotas
- Testes unitários completos para autenticação

### 👤 **Onboarding Completo**
- **Criação de Perfil**: Formulário detalhado com informações pessoais
- **Questionário Inteligente**: Sistema de perguntas para matching personalizado
- **Progress Tracking**: Acompanhamento do progresso de completude do perfil

### 🤝 **Sistema de Matches**
- Algoritmo de matching baseado em respostas do questionário
- **Aprovação Administrativa**: Admin pode aprovar/rejeitar matches
- Interface intuitiva para visualização de matches
- APIs REST para gestão de matches

### 💬 **Chat em Tempo Real**
- **Lista de Conversas**: Interface moderna com busca e filtros
- **Mensagens em Tempo Real**: Chat funcional entre paciente e terapeuta
- **Contadores de Mensagens**: Sistema de mensagens não lidas
- **Preview de Mensagens**: Última mensagem e timestamp
- **Sistema de Denúncia**: Possibilidade de reportar mensagens inadequadas

### ⚙️ **Painel Administrativo**
- Dashboard completo para administradores
- Gestão de usuários, matches e sistema
- Hooks especializados (`use-admin-data`, `use-admin-matches`)
- Interface para aprovação/rejeição de matches

### 🏪 **Marketplace de Terapeutas**
- Visualização de terapeutas disponíveis
- Interface atrativa com informações relevantes
- Sistema de busca e filtros

## 🚧 Em Desenvolvimento

### 🏥 **Dashboard do Terapeuta**
**Status**: Temporariamente desabilitado
- Gestão de clientes/pacientes
- Sistema de anotações de sessão
- Relatórios de progresso
- Gestão de agenda

### 📅 **Sistema de Agendamento**
**Status**: Não implementado
- Calendário de disponibilidade
- Marcação de consultas
- Notificações de compromissos
- Gestão de horários

### 📊 **Analytics e Relatórios**
**Status**: Não implementado
- Métricas de engajamento
- Relatórios de progresso do paciente
- Dashboard de performance
- Estatísticas administrativas

### 🔔 **Sistema de Notificações**
**Status**: Não implementado
- Notificações push
- Emails automáticos
- Lembretes de sessão
- Alertas do sistema

### 💳 **Sistema de Pagamentos**
**Status**: Não implementado
- Integração com gateway de pagamento
- Gestão de assinaturas
- Cobrança por sessão
- Relatórios financeiros

## 🛠️ Stack Tecnológica

### **Frontend**
- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **shadcn/ui** - Componentes de UI modernos

### **Backend**
- **Supabase** - BaaS completo
  - Autenticação
  - Database PostgreSQL
  - Real-time subscriptions
  - Storage

### **Qualidade e Testes**
- **Vitest** - Framework de testes
- **React Testing Library** - Testes de componentes
- **ESLint** - Linting de código
- **TypeScript** - Verificação de tipos

### **Deploy**
- **Vercel** (recomendado)
- Configuração otimizada para Next.js

## 🚀 Setup Local

### **Pré-requisitos**
- Node.js 18+
- npm ou yarn
- Conta no Supabase

### **Instalação**

```bash
# Clonar repositório
git clone https://github.com/romariorodrgues/finally-app.git
cd finally-app

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
```

### **Configuração do Supabase**

1. Crie um projeto no [Supabase](https://supabase.com)
2. Obtenha as credenciais do projeto
3. Configure o arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### **Executar Aplicação**

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar testes
npm run test

# Linting
npm run lint
```

A aplicação estará disponível em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
finally-app/
├── app/                          # Next.js App Router
│   ├── admin/                   # Painel administrativo
│   ├── api/                     # API Routes
│   │   ├── admin/matches/       # APIs de gestão de matches
│   │   ├── chat/                # APIs do sistema de chat
│   │   └── create-test-users/   # Utilitários de desenvolvimento
│   ├── chat/                    # Sistema de chat
│   ├── matches/                 # Visualização de matches
│   ├── onboarding/              # Fluxo de cadastro
│   │   ├── page.tsx            # Criação de perfil
│   │   └── questionnaire/       # Questionário detalhado
│   └── therapist/               # Dashboard terapeuta (em desenvolvimento)
├── components/                   # Componentes React
│   ├── ui/                      # Componentes base (shadcn/ui)
│   ├── admin/                   # Componentes administrativos
│   ├── chat/                    # Componentes de chat
│   └── layout/                  # Componentes de layout
├── hooks/                       # Custom React hooks
│   ├── use-admin-data.ts        # Hook para dados administrativos
│   └── use-admin-matches.ts     # Hook para matches administrativos
├── lib/                         # Utilitários e configurações
├── test/                        # Testes unitários
│   └── auth/                    # Testes de autenticação
└── middleware.ts                # Middleware de proteção de rotas
```

## 📊 Status do Desenvolvimento

### **Progresso Geral: ~65%**

| Módulo | Status | Completude |
|--------|--------|------------|
| 🔐 Autenticação | ✅ Completo | 100% |
| 👤 Onboarding | ✅ Completo | 100% |
| 🤝 Matches | ✅ Completo | 100% |
| 💬 Chat | ✅ Completo | 100% |
| ⚙️ Admin Panel | ✅ Completo | 100% |
| 🏪 Marketplace | ✅ Completo | 90% |
| 🏥 Dashboard Terapeuta | 🚧 Em Desenvolvimento | 0% |
| 📅 Agendamento | ❌ Não Iniciado | 0% |
| 📊 Analytics | ❌ Não Iniciado | 0% |
| 🔔 Notificações | ❌ Não Iniciado | 0% |
| 💳 Pagamentos | ❌ Não Iniciado | 0% |

### **Próximos Passos (Roadmap)**

#### **Sprint 1 - Dashboard Terapeuta** (Prioridade Alta)
- [ ] Restaurar dashboard do terapeuta
- [ ] Implementar gestão de clientes
- [ ] Sistema básico de anotações
- [ ] Interface de sessões

#### **Sprint 2 - Agendamento** (Prioridade Alta)
- [ ] Calendário de disponibilidade
- [ ] Sistema de marcação de consultas
- [ ] Notificações básicas de agendamento
- [ ] Gestão de horários

#### **Sprint 3 - Melhorias e Analytics** (Prioridade Média)
- [ ] Sistema de notificações
- [ ] Analytics básico
- [ ] Relatórios de uso
- [ ] Melhorias na UX

#### **Sprint 4 - Monetização** (Prioridade Baixa)
- [ ] Sistema de pagamentos
- [ ] Gestão de assinaturas
- [ ] Relatórios financeiros

## 🧪 Testes

```bash
# Executar todos os testes
npm run test

# Executar testes em modo watch
npm run test:watch

# Cobertura de testes
npm run test:coverage
```

### **Cobertura Atual**
- ✅ Autenticação: 100%
- 🚧 Componentes: 30%
- ❌ APIs: 0%

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature: `git checkout -b feature/nova-funcionalidade`
3. Commit suas mudanças: `git commit -m 'feat: adiciona nova funcionalidade'`
4. Push para a branch: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

### **Convenções de Commit**
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Tarefas de manutenção

## 📄 Licença

Este projeto é propriedade privada. Todos os direitos reservados.

## 👥 Equipe

- **Desenvolvedor Principal**: [@romariorodrgues](https://github.com/romariorodrgues)

## 📞 Contato

Para dúvidas sobre o projeto, entre em contato através do GitHub Issues.

---

**Finally App** - Conectando pessoas à saúde mental de qualidade 🧠💙
