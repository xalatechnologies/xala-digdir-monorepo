/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree
 * and displays a user-friendly error screen with recovery options.
 *
 * This is a class component as required by React's error boundary API.
 *
 * Domain-agnostic - all integrations (Sentry, audit logging) should be
 * injected via callbacks.
 *
 * @example
 * ```tsx
 * // In app with SDK
 * import { auditService } from '@digilist/client-sdk';
 * import * as Sentry from '@sentry/react';
 *
 * <ErrorBoundary
 *   onError={(error, errorInfo) => {
 *     // Sentry integration
 *     Sentry.captureException(error, {
 *       contexts: { react: { componentStack: errorInfo.componentStack } },
 *     });
 *     // Audit logging
 *     auditService.logError('react_error_boundary', 'application', error, {
 *       componentStack: errorInfo.componentStack,
 *     });
 *   }}
 *   labels={{
 *     title: t('errors.somethingWentWrong'),
 *     defaultDescription: t('errors.unexpectedError'),
 *     retryButton: t('common.retry'),
 *   }}
 * >
 *   <App />
 * </ErrorBoundary>
 * ```
 */
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorScreen } from './AuthComponents';

// =============================================================================
// Types
// =============================================================================

export interface ErrorBoundaryLabels {
  title: string;
  defaultDescription: string;
  retryButton: string;
}

export interface ErrorBoundaryProps {
  /** Child components to wrap and catch errors for */
  children: ReactNode;
  /** Custom fallback UI to render when an error occurs */
  fallback?: ReactNode;
  /** Callback when an error is caught (for error tracking, audit logging, etc.) */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Custom title for the error screen (overrides labels.title) */
  errorTitle?: string;
  /** Custom description for the error screen */
  errorDescription?: string;
  /** Show the retry button (default: true) */
  showRetryButton?: boolean;
  /** Custom retry button text (overrides labels.retryButton) */
  retryButtonText?: string;
  /** Custom retry handler (defaults to page reload) */
  onRetry?: () => void;
  /** Labels for i18n */
  labels?: Partial<ErrorBoundaryLabels>;
}

// =============================================================================
// Default Labels
// =============================================================================

const DEFAULT_LABELS: ErrorBoundaryLabels = {
  title: 'Noe gikk galt',
  defaultDescription: 'En uventet feil har oppstatt. Vennligst prov igjen.',
  retryButton: 'Last siden pa nytt',
};

// =============================================================================
// ErrorBoundary - React Error Boundary Class Component
// =============================================================================

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
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console for development debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call the onError callback if provided
    // This is the integration point for Sentry, audit logging, etc.
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = (): void => {
    // Reset error state
    this.setState({ hasError: false, error: null });

    // Use custom retry handler if provided, otherwise reload the page
    if (this.props.onRetry) {
      this.props.onRetry();
    } else {
      window.location.reload();
    }
  };

  render(): ReactNode {
    const {
      children,
      fallback,
      errorTitle,
      errorDescription,
      showRetryButton = true,
      retryButtonText,
      labels: customLabels,
    } = this.props;

    const labels = { ...DEFAULT_LABELS, ...customLabels };

    if (this.state.hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Use ErrorScreen with configured or default text
      return (
        <ErrorScreen
          title={errorTitle || labels.title}
          description={
            errorDescription ||
            this.state.error?.message ||
            labels.defaultDescription
          }
          showRetryButton={showRetryButton}
          retryButtonText={retryButtonText || labels.retryButton}
          onRetry={this.handleRetry}
        />
      );
    }

    return children;
  }
}

// =============================================================================
// withErrorBoundary - Higher-Order Component wrapper
// =============================================================================

export interface WithErrorBoundaryOptions {
  /** Custom fallback UI to render when an error occurs */
  fallback?: ReactNode;
  /** Callback when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Custom title for the error screen */
  errorTitle?: string;
  /** Custom description for the error screen */
  errorDescription?: string;
  /** Labels for i18n */
  labels?: Partial<ErrorBoundaryLabels>;
}

/**
 * Higher-order component that wraps a component with an ErrorBoundary
 *
 * @example
 * const SafeComponent = withErrorBoundary(UnsafeComponent, {
 *   errorTitle: 'Komponent feil',
 *   onError: (error) => logToService(error),
 * });
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithErrorBoundaryOptions = {}
): React.FC<P> {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const ComponentWithErrorBoundary: React.FC<P> = (props) => {
    // Build props object only with defined values to satisfy exactOptionalPropertyTypes
    const boundaryProps: Partial<ErrorBoundaryProps> & { children: ReactNode } = {
      children: <WrappedComponent {...props} />,
    };

    if (options.fallback !== undefined) {
      boundaryProps.fallback = options.fallback;
    }
    if (options.onError !== undefined) {
      boundaryProps.onError = options.onError;
    }
    if (options.errorTitle !== undefined) {
      boundaryProps.errorTitle = options.errorTitle;
    }
    if (options.errorDescription !== undefined) {
      boundaryProps.errorDescription = options.errorDescription;
    }
    if (options.labels !== undefined) {
      boundaryProps.labels = options.labels;
    }

    return <ErrorBoundary {...(boundaryProps as ErrorBoundaryProps)} />;
  };

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;

  return ComponentWithErrorBoundary;
}
