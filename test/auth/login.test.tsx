import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/auth/login/page'

// Mock Next.js modules
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => 
    <a href={href}>{children}</a>,
}))

// Mock Supabase client
const mockSignInWithPassword = vi.fn()
const mockSupabaseClient = {
  auth: {
    signInWithPassword: mockSignInWithPassword,
  },
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
}))

describe('LoginPage', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('renders login form correctly', () => {
    render(<LoginPage />)
    
    expect(screen.getByText('Bem-vinda de volta')).toBeInTheDocument()
    expect(screen.getByText('Entre na sua conta para continuar sua jornada em busca do amor verdadeiro')).toBeInTheDocument()
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('displays validation errors for empty fields', async () => {
    render(<LoginPage />)
    
    const submitButton = screen.getByRole('button', { name: /entrar/i })
    
    // Submit button should be disabled when fields are empty
    expect(submitButton).toBeDisabled()
  })

  it('enables submit button when both fields are filled', async () => {
    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText('E-mail')
    const passwordInput = screen.getByLabelText('Senha')
    const submitButton = screen.getByRole('button', { name: /entrar/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    
    expect(submitButton).not.toBeDisabled()
  })

  it('toggles password visibility', async () => {
    render(<LoginPage />)
    
    const passwordInput = screen.getByLabelText('Senha')
    const toggleButton = screen.getByRole('button', { name: '' }) // Eye icon button
    
    expect(passwordInput).toHaveAttribute('type', 'password')
    
    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')
    
    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('handles successful login', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: { id: '123', email: 'test@example.com' } },
      error: null,
    })

    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText('E-mail')
    const passwordInput = screen.getByLabelText('Senha')
    const submitButton = screen.getByRole('button', { name: /entrar/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    })
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('handles login error', async () => {
    const errorMessage = 'Invalid login credentials'
    mockSignInWithPassword.mockResolvedValue({
      data: null,
      error: { message: errorMessage },
    })

    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText('E-mail')
    const passwordInput = screen.getByLabelText('Senha')
    const submitButton = screen.getByRole('button', { name: /entrar/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
    
    // Submit button should be enabled again after error
    expect(submitButton).not.toBeDisabled()
  })

  it('handles network/unexpected errors', async () => {
    mockSignInWithPassword.mockRejectedValue(new Error('Network error'))

    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText('E-mail')
    const passwordInput = screen.getByLabelText('Senha')
    const submitButton = screen.getByRole('button', { name: /entrar/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Erro no login. Verifique suas credenciais.')).toBeInTheDocument()
    })
  })

  it('shows loading state during submission', async () => {
    // Make the promise hang to test loading state
    mockSignInWithPassword.mockImplementation(() => new Promise(() => {}))

    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText('E-mail')
    const passwordInput = screen.getByLabelText('Senha')
    const submitButton = screen.getByRole('button', { name: /entrar/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    expect(screen.getByText('Entrando...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
    expect(emailInput).toBeDisabled()
    expect(passwordInput).toBeDisabled()
  })

  it('toggles remember me checkbox', async () => {
    render(<LoginPage />)
    
    const rememberMeCheckbox = screen.getByLabelText('Lembrar de mim')
    
    expect(rememberMeCheckbox).not.toBeChecked()
    
    await user.click(rememberMeCheckbox)
    expect(rememberMeCheckbox).toBeChecked()
    
    await user.click(rememberMeCheckbox)
    expect(rememberMeCheckbox).not.toBeChecked()
  })

  it('contains links to forgot password and terms/privacy', () => {
    render(<LoginPage />)
    
    expect(screen.getByText('Esqueceu a senha?')).toBeInTheDocument()
    expect(screen.getByText('Termos de Uso')).toBeInTheDocument()
    expect(screen.getByText('Política de Privacidade')).toBeInTheDocument()
  })

  it('has correct email input validation', async () => {
    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText('E-mail')
    
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('required')
    expect(emailInput).toHaveAttribute('placeholder', 'seu@email.com')
  })

  it('has correct password input validation', async () => {
    render(<LoginPage />)
    
    const passwordInput = screen.getByLabelText('Senha')
    
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toHaveAttribute('required')
    expect(passwordInput).toHaveAttribute('placeholder', '••••••••')
  })
}) 