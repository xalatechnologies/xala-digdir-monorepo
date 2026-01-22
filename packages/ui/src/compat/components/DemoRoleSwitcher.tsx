/**
 * DemoRoleSwitcher - Role switcher for demo/development
 */

import React from 'react';
import { Button, Card, Heading, Paragraph } from '@digdir/designsystemet-react';

export type DemoRoleKey = 'admin' | 'staff' | 'user' | 'guest' | string;

export interface DemoRole {
  key: DemoRoleKey;
  label: string;
  description?: string;
}

export interface DemoRoleSwitcherProps {
  roles?: DemoRole[];
  currentRole?: DemoRoleKey;
  onRoleSelect: (role: DemoRoleKey) => void;
  isLoading?: boolean;
  t?: (key: string) => string;
  className?: string;
}

const defaultRoles: DemoRole[] = [
  { key: 'admin', label: 'Administrator', description: 'Full access to all features' },
  { key: 'staff', label: 'Staff', description: 'Can manage bookings and listings' },
  { key: 'user', label: 'User', description: 'Standard user access' },
];

export function DemoRoleSwitcher({
  roles = defaultRoles,
  currentRole,
  onRoleSelect,
  isLoading,
  t = (key) => key,
  className,
}: DemoRoleSwitcherProps) {
  return (
    <div className={className}>
      <Heading level={3} size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
        {t('demo.roleSwitch.title')}
      </Heading>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
        {roles.map((role) => (
          <button
            key={role.key}
            onClick={() => onRoleSelect(role.key)}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--ds-spacing-3)',
              border: currentRole === role.key
                ? '2px solid var(--ds-color-accent-border-default)'
                : '1px solid var(--ds-color-neutral-border-default)',
              borderRadius: 'var(--ds-border-radius-md)',
              background: currentRole === role.key
                ? 'var(--ds-color-accent-surface-default)'
                : 'var(--ds-color-neutral-surface-default)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              width: '100%',
              textAlign: 'left',
            }}
          >
            <div>
              <div style={{ fontWeight: 500 }}>{role.label}</div>
              {role.description && (
                <div style={{ fontSize: '0.875rem', color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {role.description}
                </div>
              )}
            </div>
            {currentRole === role.key && (
              <span style={{ color: 'var(--ds-color-accent-text-default)' }}>✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
