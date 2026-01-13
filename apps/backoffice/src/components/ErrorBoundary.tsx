/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorScreen } from '@xala/ds';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    // TODO: Send to error tracking service (e.g., Sentry)
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorScreen
          title="Noe gikk galt"
          message={this.state.error?.message || 'En uventet feil har oppstått. Vennligst prøv igjen.'}
          actionLabel="Last siden på nytt"
          onAction={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}
