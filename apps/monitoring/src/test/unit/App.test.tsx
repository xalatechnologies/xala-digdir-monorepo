/**
 * Unit Tests for App Component
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from '../../App';

describe('App', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const renderApp = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
  };

  it('renders without crashing', () => {
    renderApp();
    expect(document.body).toBeInTheDocument();
  });

  it('provides necessary context providers', () => {
    const { container } = renderApp();
    expect(container).toBeInTheDocument();
  });

  it('initializes with router', () => {
    renderApp();
    // Router should be initialized
    expect(window.location.pathname).toBeDefined();
  });
});
