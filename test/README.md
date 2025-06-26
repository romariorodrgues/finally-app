# Testes Unitários - Finally App

## 📋 Visão Geral

Este diretório contém os testes unitários para a aplicação Finally App, focando na funcionalidade de autenticação e login.

## 🛠️ Configuração

### Dependências de Teste

- **Vitest**: Framework de testes moderno e rápido
- **React Testing Library**: Biblioteca para testar componentes React
- **Jest DOM**: Matchers customizados para testes DOM
- **User Event**: Simulação de interações do usuário

### Instalação

```bash
npm install
```

### Scripts Disponíveis

```bash
# Executar testes em modo watch
npm run test

# Executar testes uma vez
npm run test:run

# Executar testes com interface gráfica
npm run test:ui

# Executar testes com coverage
npm run test:coverage
```

## 📁 Estrutura de Testes

```
test/
├── README.md                   # Este arquivo
├── setup.ts                   # Configuração global dos testes
└── auth/
    ├── login.test.tsx         # Testes do componente de login
    └── auth-helpers.test.ts   # Testes dos helpers de autenticação
```

## 🧪 Testes Implementados

### 1. Testes do Componente de Login (`login.test.tsx`)

#### **Renderização e UI**
- ✅ Renderiza o formulário de login corretamente
- ✅ Exibe todos os campos necessários (email, senha)
- ✅ Mostra links para "Esqueceu a senha" e políticas
- ✅ Valida atributos dos inputs (type, required, placeholder)

#### **Validação de Formulário**
- ✅ Desabilita botão de submit quando campos estão vazios
- ✅ Habilita botão quando ambos os campos são preenchidos
- ✅ Alterna visibilidade da senha ao clicar no ícone

#### **Funcionalidade de Autenticação**
- ✅ Executa login com sucesso
- ✅ Redireciona para página inicial após login
- ✅ Exibe mensagens de erro para credenciais inválidas
- ✅ Trata erros de rede/inesperados
- ✅ Mostra estado de carregamento durante submissão

#### **Interações do Usuário**
- ✅ Alternar checkbox "Lembrar de mim"
- ✅ Desabilita campos durante carregamento
- ✅ Validação de input de email e senha

### 2. Testes dos Auth Helpers (`auth-helpers.test.ts`)

#### **Funções de Autenticação**
- ✅ Sign up com email, senha e metadata
- ✅ Sign up sem metadata opcional
- ✅ Sign in com email e senha
- ✅ Sign out do usuário
- ✅ Reset de senha por email

#### **Tratamento de Erros**
- ✅ Errors de login com credenciais inválidas
- ✅ Errors de email não encontrado
- ✅ Errors de usuário já existente

#### **Fluxos de Integração**
- ✅ Fluxo completo de registro
- ✅ Login após registro
- ✅ Diferentes cenários de erro

## 🎯 Cobertura de Testes

Os testes cobrem:

- **Componentes de UI**: Verificação de renderização e interações
- **Lógica de Negócio**: Validação de fluxos de autenticação
- **Tratamento de Erros**: Cenários de falha e recuperação
- **Integração**: Interação entre componentes e serviços
- **Estados de Loading**: Feedback visual durante operações

## 🔧 Mocks e Configuração

### Mocks Implementados

1. **Next.js Router**: Mock do `useRouter` para navegação
2. **Next.js Link**: Mock do componente `Link`
3. **Supabase Client**: Mock completo da autenticação
4. **Window Location**: Mock para testes de reset de senha

### Configuração de Setup

O arquivo `setup.ts` configura:

- Importação de matchers do Jest DOM
- Mocks globais para Next.js
- Mock do cliente Supabase
- Configuração de ambiente de teste

## 📊 Executando os Testes

### Desenvolvimento

Durante o desenvolvimento, execute:

```bash
npm run test
```

Isso iniciará o Vitest em modo watch, executando os testes automaticamente quando arquivos são modificados.

### Interface Gráfica

Para uma experiência visual:

```bash
npm run test:ui
```

### Coverage Report

Para verificar cobertura de código:

```bash
npm run test:coverage
```

O relatório será gerado em `coverage/index.html`.

## 🔍 Debugging

### Logs de Debug

Para adicionar logs nos testes:

```typescript
console.log('Debug info:', variavel)
```

### Queries de Debug

Para verificar o DOM durante os testes:

```typescript
screen.debug() // Mostra todo o DOM
screen.debug(element) // Mostra elemento específico
```

## 📝 Convenções

### Nomenclatura de Testes

- **describe**: Descreve o componente ou funcionalidade
- **it**: Descreve o comportamento específico sendo testado
- Use descrições claras e específicas

### Estrutura de Teste

1. **Arrange**: Configura dados e mocks
2. **Act**: Executa a ação sendo testada
3. **Assert**: Verifica o resultado esperado

### Exemplo de Teste

```typescript
it('should handle successful login', async () => {
  // Arrange
  mockSignInWithPassword.mockResolvedValue({
    data: { user: { id: '123' } },
    error: null,
  })

  // Act
  render(<LoginPage />)
  await user.type(emailInput, 'test@example.com')
  await user.click(submitButton)

  // Assert
  expect(mockPush).toHaveBeenCalledWith('/')
})
```

## 🚀 Próximos Passos

### Melhorias Planejadas

1. **Testes E2E**: Adicionar testes end-to-end com Playwright
2. **Testes de Acessibilidade**: Validar conformidade WCAG
3. **Testes de Performance**: Benchmark de componentes
4. **Testes de Responsividade**: Diferentes tamanhos de tela

### Expansão de Cobertura

- Testes para outros componentes de autenticação
- Testes para middleware de autenticação
- Testes para hooks customizados
- Testes para utilitários de validação

## 📞 Suporte

Para dúvidas sobre testes:

1. Verifique a documentação do Vitest
2. Consulte exemplos nos arquivos existentes
3. Use o comando `npm run test:ui` para debugging visual

---

**Nota**: Certifique-se de que todos os testes passem antes de fazer commits. Use `npm run test:run` para verificação final. 