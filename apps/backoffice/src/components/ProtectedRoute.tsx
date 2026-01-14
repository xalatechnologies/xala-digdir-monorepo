import { Navigate, useLocation } from 'react-router-dom';
import { Spinner, Heading, Paragraph } from '@xala/ds';
import { useAuth, type BackofficeRole } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: BackofficeRole;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isLoading, isAuthenticated, checkRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: 'var(--ds-color-neutral-background-default)',
        }}
      >
        <Spinner aria-label="Laster..." data-data-size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && !checkRole(requiredRole)) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          gap: 'var(--ds-spacing-4)',
          padding: 'var(--ds-spacing-6)',
          textAlign: 'center',
        }}
      >
        <Heading
          level={1}
          data-size="lg"
          style={{ color: 'var(--ds-color-danger-text-default)' }}
        >
          Ingen tilgang
        </Heading>
        <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          Du har ikke tilgang til denne siden.
          <br />
          Kontakt administrator hvis du mener dette er feil.
        </Paragraph>
      </div>
    );
  }

  return <>{children}</>;
}
