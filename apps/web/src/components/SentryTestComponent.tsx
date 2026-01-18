/**
 * Sentry Test Component - Web App
 *
 * TEMPORARY COMPONENT FOR TESTING ERROR TRACKING
 * This component should be removed before production deployment.
 *
 * Usage:
 * 1. Import this component in any route (e.g., HomePage)
 * 2. Click the buttons to trigger different types of errors
 * 3. Verify errors appear in Sentry dashboard with proper context
 * 4. Remove this component when testing is complete
 */

import { useState } from 'react';
import { Button, Card } from '@xala/ds';
import { setTenantContext, setUserContext, addBreadcrumb, captureException } from '../lib/sentry';
import { useT } from '@xala/i18n';

export function SentryTestComponent() {
  const [counter, setCounter] = useState(0);

  const handleSyncError = () => {
    // This will be caught by ErrorBoundary
    throw new Error('Test synchronous error from button click - Web App');
  };

  const handleAsyncError = async () => {
    // Add breadcrumb before error
    addBreadcrumb('User clicked async error button', 'test', 'info');

    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100));

    // This error might not be caught by ErrorBoundary
    // Better to use try-catch and captureException
    try {
      throw new Error('Test async error from setTimeout - Web App');
    } catch (error) {
      captureException(error as Error, {
        operation: 'test-async-error',
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handlePromiseRejection = () => {
    // Unhandled promise rejection
    Promise.reject(new Error('Test unhandled promise rejection - Web App'));
  };

  const handleTypeError = () => {
    // This will throw a TypeError
    const obj: any = null;
    obj.nonExistentMethod();
  };

  const handleSetTenantContext = () => {
    setTenantContext(
      'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      'Test Kommune'
    );
    alert('Tenant context set! Next error will include tenant information.');
  };

  const handleSetUserContext = () => {
    setUserContext(
      'test-user-456',
      'test@web.example.com',
      'user'
    );
    alert('User context set! Next error will include user information.');
  };

  const handleAddBreadcrumbs = () => {
    addBreadcrumb('User clicked button', 'ui', 'info');
    addBreadcrumb('Navigation to test page', 'navigation', 'info');
    addBreadcrumb('Data loaded successfully', 'data', 'debug');
    setCounter(counter + 1);
    alert(`Added 3 breadcrumbs! Counter: ${counter + 1}`);
  };

  return (
    <Card style={{ padding: '2rem', margin: '2rem', maxWidth: '800px' }}>
      <h2 style={{ marginBottom: '1rem' }}>{t('.sentry.error.tracking.test.panel.web.app')}</h2>
      <p style={{ marginBottom: '1.5rem', color: 'var(--ds-color-neutral-text-subtle)' }}>
        ⚠️ <strong>{t('for.testing.only')}</strong> Remove this component before production.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <h3 style={{ marginBottom: '0.5rem' }}>{t('context.setup')}</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Button onClick={handleSetTenantContext} variant="secondary" type="button">
              Set Tenant Context
            </Button>
            <Button onClick={handleSetUserContext} variant="secondary" type="button">
              Set User Context
            </Button>
            <Button onClick={handleAddBreadcrumbs} variant="secondary" type="button">
              Add Breadcrumbs ({counter})
            </Button>
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '0.5rem' }}>{t('error.tests')}</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Button onClick={handleSyncError} variant="danger" type="button">
              Throw Sync Error
            </Button>
            <Button onClick={handleAsyncError} variant="danger" type="button">
              Throw Async Error
            </Button>
            <Button onClick={handlePromiseRejection} variant="danger" type="button">
              Promise Rejection
            </Button>
            <Button onClick={handleTypeError} variant="danger" type="button">
              Throw TypeError
            </Button>
          </div>
        </div>

        <div style={{
          padding: '1rem',
          backgroundColor: 'var(--ds-color-neutral-background-subtle)',
          borderRadius: 'var(--ds-border-radius-sm)',
          fontSize: '0.875rem'
        }}>
          <h4 style={{ marginBottom: '0.5rem' }}>{t('testing.instructions')}</h4>
          <ol style={{ marginLeft: '1.5rem', lineHeight: '1.6' }}>
            <li>{t('first.set.tenant.and.user.context.optional.but.rec')}</li>
            <li>{t('add.some.breadcrumbs.to.test.breadcrumb.tracking')}</li>
            <li>{t('error.generic')}</li>
            <li>{t('check.the.browser.console.for.error.logs')}</li>
            <li>{t('check.your.sentry.dashboard.for.the.error.report')}</li>
            <li>{t('verify.context.tenant.user.and.breadcrumbs.appear.')}</li>
          </ol>
          <p style={{ marginTop: '0.5rem', color: 'var(--ds-color-neutral-text-subtle)' }}>
            <strong>{t('note')}</strong> Sync errors will show the ErrorBoundary screen.
            Async errors are caught and reported but won't trigger ErrorBoundary.
          </p>
        </div>
      </div>
    </Card>
  );
}
