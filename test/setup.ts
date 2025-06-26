import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Polyfills for JSDOM environment
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock Next.js Link - simplified version
vi.mock('next/link', () => ({
  default: vi.fn(({ children }) => children),
}))

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn(),
    resetPasswordForEmail: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
    insert: vi.fn(),
    upsert: vi.fn(),
  })),
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => mockSupabaseClient,
}))

// Extend global object for tests
declare global {
  // eslint-disable-next-line no-var
  var mockSupabaseClient: {
    auth: {
      signInWithPassword: ReturnType<typeof vi.fn>
      signUp: ReturnType<typeof vi.fn>
      signOut: ReturnType<typeof vi.fn>
      getUser: ReturnType<typeof vi.fn>
      resetPasswordForEmail: ReturnType<typeof vi.fn>
    }
    from: ReturnType<typeof vi.fn>
  }
}

global.mockSupabaseClient = mockSupabaseClient 