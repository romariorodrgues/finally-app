import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuthClient } from '@/lib/auth/auth-helpers'

// Mock Supabase client
const mockSignUp = vi.fn()
const mockSignIn = vi.fn()
const mockSignOut = vi.fn()
const mockResetPassword = vi.fn()

const mockSupabaseClient = {
  auth: {
    signUp: mockSignUp,
    signInWithPassword: mockSignIn,
    signOut: mockSignOut,
    resetPasswordForEmail: mockResetPassword,
  },
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
}))

describe('Auth Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useAuthClient', () => {
    it('should sign up a user with email and password', async () => {
      const authClient = useAuthClient()
      const email = 'test@example.com'
      const password = 'password123'
      const metadata = { name: 'Test User' }

      const expectedResponse = {
        data: { user: { id: '123', email } },
        error: null,
      }

      mockSignUp.mockResolvedValue(expectedResponse)

      const result = await authClient.signUp(email, password, metadata)

      expect(mockSignUp).toHaveBeenCalledWith({
        email,
        password,
        options: {
          data: metadata,
        },
      })
      expect(result).toEqual(expectedResponse)
    })

    it('should sign up a user without metadata', async () => {
      const authClient = useAuthClient()
      const email = 'test@example.com'
      const password = 'password123'

      const expectedResponse = {
        data: { user: { id: '123', email } },
        error: null,
      }

      mockSignUp.mockResolvedValue(expectedResponse)

      const result = await authClient.signUp(email, password)

      expect(mockSignUp).toHaveBeenCalledWith({
        email,
        password,
        options: {
          data: undefined,
        },
      })
      expect(result).toEqual(expectedResponse)
    })

    it('should sign in a user with email and password', async () => {
      const authClient = useAuthClient()
      const email = 'test@example.com'
      const password = 'password123'

      const expectedResponse = {
        data: { user: { id: '123', email } },
        error: null,
      }

      mockSignIn.mockResolvedValue(expectedResponse)

      const result = await authClient.signIn(email, password)

      expect(mockSignIn).toHaveBeenCalledWith({
        email,
        password,
      })
      expect(result).toEqual(expectedResponse)
    })

    it('should handle sign in error', async () => {
      const authClient = useAuthClient()
      const email = 'test@example.com'
      const password = 'wrongpassword'

      const expectedResponse = {
        data: null,
        error: { message: 'Invalid login credentials' },
      }

      mockSignIn.mockResolvedValue(expectedResponse)

      const result = await authClient.signIn(email, password)

      expect(result).toEqual(expectedResponse)
    })

    it('should sign out a user', async () => {
      const authClient = useAuthClient()

      const expectedResponse = {
        error: null,
      }

      mockSignOut.mockResolvedValue(expectedResponse)

      const result = await authClient.signOut()

      expect(mockSignOut).toHaveBeenCalled()
      expect(result).toEqual(expectedResponse)
    })

    it('should reset password for email', async () => {
      const authClient = useAuthClient()
      const email = 'test@example.com'

      // Mock window.location.origin
      Object.defineProperty(window, 'location', {
        value: {
          origin: 'https://example.com',
        },
        writable: true,
      })

      const expectedResponse = {
        data: {},
        error: null,
      }

      mockResetPassword.mockResolvedValue(expectedResponse)

      const result = await authClient.resetPassword(email)

      expect(mockResetPassword).toHaveBeenCalledWith(email, {
        redirectTo: 'https://example.com/auth/reset-password',
      })
      expect(result).toEqual(expectedResponse)
    })

    it('should handle reset password error', async () => {
      const authClient = useAuthClient()
      const email = 'invalid@example.com'

      const expectedResponse = {
        data: null,
        error: { message: 'Email not found' },
      }

      mockResetPassword.mockResolvedValue(expectedResponse)

      const result = await authClient.resetPassword(email)

      expect(result).toEqual(expectedResponse)
    })
  })

  describe('Authentication Flow Integration Tests', () => {
    it('should handle complete sign up flow', async () => {
      const authClient = useAuthClient()
      const userData = {
        email: 'newuser@example.com',
        password: 'securepassword123',
        metadata: {
          name: 'New User',
          age: 25,
        },
      }

      // Mock successful sign up
      mockSignUp.mockResolvedValue({
        data: {
          user: {
            id: 'new-user-id',
            email: userData.email,
            email_confirmed_at: null,
          },
        },
        error: null,
      })

      const result = await authClient.signUp(
        userData.email,
        userData.password,
        userData.metadata
      )

      expect(result.data?.user?.email).toBe(userData.email)
      expect(result.error).toBeNull()
    })

    it('should handle sign in after sign up', async () => {
      const authClient = useAuthClient()
      const credentials = {
        email: 'existinguser@example.com',
        password: 'password123',
      }

      // Mock successful sign in
      mockSignIn.mockResolvedValue({
        data: {
          user: {
            id: 'existing-user-id',
            email: credentials.email,
            email_confirmed_at: '2024-01-01T00:00:00Z',
          },
        },
        error: null,
      })

      const result = await authClient.signIn(
        credentials.email,
        credentials.password
      )

      expect(result.data?.user?.email).toBe(credentials.email)
      expect(result.data?.user?.email_confirmed_at).toBeTruthy()
      expect(result.error).toBeNull()
    })

    it('should handle authentication errors gracefully', async () => {
      const authClient = useAuthClient()

      // Test different error scenarios
      const errorScenarios = [
        {
          method: 'signIn',
          params: ['wrong@email.com', 'wrongpassword'],
          error: 'Invalid login credentials',
        },
        {
          method: 'signUp',
          params: ['existing@email.com', 'password123'],
          error: 'User already registered',
        },
        {
          method: 'resetPassword',
          params: ['nonexistent@email.com'],
          error: 'Email not found',
        },
      ]

      for (const scenario of errorScenarios) {
        const mockMethod = scenario.method === 'signIn' ? mockSignIn :
                          scenario.method === 'signUp' ? mockSignUp :
                          mockResetPassword

        mockMethod.mockResolvedValue({
          data: null,
          error: { message: scenario.error },
        })

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (authClient as any)[scenario.method](...scenario.params)

        expect(result.error).toBeTruthy()
        expect(result.error.message).toBe(scenario.error)
      }
    })
  })
}) 