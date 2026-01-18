/**
 * Test Setup and Configuration
 * Provides mock authentication and test utilities
 */
import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock authentication for tests
export const mockAuthUser = {
  id: 'test-user-monitoring-001',
  email: 'monitoring@digilist.no',
  name: 'Monitoring Admin',
  role: 'SAAS_ADMIN',
  tenantId: 'monitoring-tenant-001',
  permissions: ['monitoring:read', 'monitoring:write', 'monitoring:admin'],
};

// Mock @xala/auth module
vi.mock('@xala/auth', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    user: mockAuthUser,
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
  useOAuthCallback: () => null,
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock translations for Norwegian
const translations: Record<string, string> = {
  'components.accountSwitcher.asPrivatePerson': 'Som privatperson',
  'components.accountSwitcher.organizations': 'Organisasjoner',
  'components.accountSwitcher.manageOrganizations': 'Administrer organisasjoner',
  'components.accountSwitcher.switchAccount': 'Bytt konto',
  'common.loading': 'Laster...',
  'common.error': 'Feil',
  'common.save': 'Lagre',
  'common.cancel': 'Avbryt',
  'common.delete': 'Slett',
  'common.edit': 'Rediger',
  'common.close': 'Lukk',
  'common.search': 'Søk',
  'common.filter': 'Filtrer',
  'common.reset': 'Tilbakestill',
};

// Mock @xala/i18n module
vi.mock('@xala/i18n', () => ({
  I18nProvider: ({ children }: { children: React.ReactNode }) => children,
  useI18n: () => ({
    locale: 'nb',
    setLocale: vi.fn(),
    t: (key: string) => translations[key] || key,
  }),
  useT: () => (key: string) => translations[key] || key,
  useLocale: () => 'nb',
}));

// Mock @digilist/client-sdk realtime
vi.mock('@digilist/client-sdk', async () => {
  const actual = await vi.importActual('@digilist/client-sdk');
  return {
    ...actual,
    RealtimeProvider: ({ children }: { children: React.ReactNode }) => children,
  };
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock @xala/ds components that might be undefined
vi.mock('@xala/ds', async () => {
  const actual = await vi.importActual('@xala/ds');
  const React = await import('react');
  return {
    ...actual,
    // Ensure all components are defined
    Button: actual?.Button || (({ children, ...props }: any) => React.createElement('button', props, children)),
    Card: actual?.Card || (({ children, ...props }: any) => React.createElement('div', props, children)),
    Input: actual?.Input || ((props: any) => React.createElement('input', props)),
    Select: actual?.Select || ((props: any) => React.createElement('select', props)),
    Checkbox: actual?.Checkbox || ((props: any) => React.createElement('input', { ...props, type: 'checkbox' })),
    Radio: actual?.Radio || ((props: any) => React.createElement('input', { ...props, type: 'radio' })),
    Modal: actual?.Modal || (({ children, ...props }: any) => React.createElement('div', props, children)),
    Dropdown: actual?.Dropdown || (({ children, ...props }: any) => React.createElement('div', props, children)),
    Spinner: actual?.Spinner || (() => React.createElement('div', {}, 'Loading...')),
    Alert: actual?.Alert || (({ children, ...props }: any) => React.createElement('div', props, children)),
  };
});
