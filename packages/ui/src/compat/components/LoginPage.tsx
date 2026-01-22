/**
 * LoginPage - Generic login page component
 */

import React from 'react';
import { Card, Heading, Paragraph, Button } from '@digdir/designsystemet-react';

export interface LoginMethod {
  id: string;
  name: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

export interface LoginPageProps {
  title?: string;
  subtitle?: string;
  logo?: React.ReactNode;
  loginMethods?: LoginMethod[];
  onBankIdLogin?: () => void;
  onDemoLogin?: () => void;
  isLoading?: boolean;
  error?: string;
  className?: string;
}

export function LoginPage({
  title = 'Logg inn',
  subtitle,
  logo,
  loginMethods = [],
  onBankIdLogin,
  onDemoLogin,
  isLoading = false,
  error,
  className,
}: LoginPageProps) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 'var(--ds-spacing-6)',
        backgroundColor: 'var(--ds-color-neutral-background-subtle)',
      }}
    >
      <Card style={{ maxWidth: '400px', width: '100%' }}>
        <Card.Block>
          {logo && (
            <div style={{ textAlign: 'center', marginBottom: 'var(--ds-spacing-6)' }}>
              {logo}
            </div>
          )}
          <Heading level={1} size="lg" style={{ textAlign: 'center' }}>
            {title}
          </Heading>
          {subtitle && (
            <Paragraph style={{ textAlign: 'center', marginTop: 'var(--ds-spacing-2)' }}>
              {subtitle}
            </Paragraph>
          )}
          {error && (
            <div
              style={{
                marginTop: 'var(--ds-spacing-4)',
                padding: 'var(--ds-spacing-3)',
                backgroundColor: 'var(--ds-color-danger-surface-default)',
                color: 'var(--ds-color-danger-text-default)',
                borderRadius: 'var(--ds-border-radius-md)',
              }}
            >
              {error}
            </div>
          )}
          <div style={{ marginTop: 'var(--ds-spacing-6)', display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
            {onBankIdLogin && (
              <Button onClick={onBankIdLogin} disabled={isLoading} variant="primary" style={{ width: '100%' }}>
                Logg inn med BankID
              </Button>
            )}
            {loginMethods.map((method) => (
              <Button key={method.id} onClick={method.onClick} disabled={isLoading} variant="secondary" style={{ width: '100%' }}>
                {method.icon}
                {method.name}
              </Button>
            ))}
            {onDemoLogin && (
              <Button onClick={onDemoLogin} disabled={isLoading} variant="tertiary" style={{ width: '100%' }}>
                Demo-innlogging
              </Button>
            )}
          </div>
        </Card.Block>
      </Card>
    </div>
  );
}
