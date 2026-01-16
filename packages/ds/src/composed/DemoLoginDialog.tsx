/**
 * DemoLoginDialog Component
 * Reusable demo login dialog for all applications
 *
 * Features:
 * - Field-level validation
 * - Email format validation
 * - Real-time error clearing
 * - Loading states
 * - Accessible form controls
 */

import React, { useState } from 'react';
import { Textfield, Button, Alert } from '@digdir/designsystemet-react';
import { Dialog } from '@digdir/designsystemet-react';
import { Stack } from '../primitives';

export interface DemoLoginDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog should close */
  onClose: () => void;
  /** Callback when form is submitted with valid data */
  onSubmit: (data: DemoLoginFormData) => Promise<void>;
  /** Title for the dialog */
  title: string;
  /** Description text for the dialog */
  description: string;
  /** Cancel button text */
  cancelText: string;
  /** Submit button text */
  submitText: string;
  /** Loading button text */
  loadingText: string;
  /** Validation error messages */
  validationMessages: {
    nameRequired: string;
    emailRequired: string;
    tokenRequired: string;
    invalidEmail: string;
  };
  /** Form field labels */
  labels: {
    name: string;
    email: string;
    token: string;
  };
  /** Form field placeholders */
  placeholders: {
    name: string;
    email: string;
    token: string;
  };
}

export interface DemoLoginFormData {
  name: string;
  email: string;
  token: string;
}

export function DemoLoginDialog({
  open,
  onClose,
  onSubmit,
  title,
  description,
  cancelText,
  submitText,
  loadingText,
  validationMessages,
  labels,
  placeholders,
}: DemoLoginDialogProps): React.ReactElement {
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    token: '',
  });
  const [formData, setFormData] = useState<DemoLoginFormData>({
    name: '',
    email: '',
    token: '',
  });

  /**
   * Validate individual field
   */
  const validateField = (field: keyof DemoLoginFormData, value: string) => {
    let error = '';

    if (field === 'email' && value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        error = validationMessages.invalidEmail;
      }
    }

    setFieldErrors(prev => ({ ...prev, [field]: error }));
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setLoginError(null);
    const errors = { name: '', email: '', token: '' };

    // Validate all fields
    if (!formData.name.trim()) {
      errors.name = validationMessages.nameRequired;
    }

    if (!formData.email.trim()) {
      errors.email = validationMessages.emailRequired;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = validationMessages.invalidEmail;
      }
    }

    if (!formData.token.trim()) {
      errors.token = validationMessages.tokenRequired;
    }

    // Show field errors
    setFieldErrors(errors);

    // Stop if there are validation errors
    if (errors.name || errors.email || errors.token) {
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit(formData);
    } catch (error: any) {
      setLoginError(error.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle field change
   */
  const handleFieldChange = (field: keyof DemoLoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  /**
   * Handle dialog close
   */
  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  /**
   * Reset form when dialog opens
   */
  React.useEffect(() => {
    if (open) {
      setFormData({ name: '', email: '', token: '' });
      setFieldErrors({ name: '', email: '', token: '' });
      setLoginError(null);
      setIsLoading(false);
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={title}
      description={description}
    >
      <form onSubmit={handleSubmit}>
        <Stack direction="column" gap={20}>
          {loginError && (
            <Alert variant="error">
              {loginError}
            </Alert>
          )}

          {/* Name Field */}
          <div style={{ width: '100%' }}>
            <Textfield
              label={labels.name}
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              onBlur={(e) => validateField('name', e.target.value)}
              placeholder={placeholders.name}
              disabled={isLoading}
              required
              error={!!fieldErrors.name}
              style={{ width: '100%' }}
            />
            {fieldErrors.name && (
              <span
                style={{
                  fontSize: '14px',
                  color: '#dc2626',
                  marginTop: '4px',
                  display: 'block'
                }}
              >
                {fieldErrors.name}
              </span>
            )}
          </div>

          {/* Email Field */}
          <div style={{ width: '100%' }}>
            <Textfield
              label={labels.email}
              type="email"
              value={formData.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              onBlur={(e) => validateField('email', e.target.value)}
              placeholder={placeholders.email}
              disabled={isLoading}
              required
              error={!!fieldErrors.email}
              style={{ width: '100%' }}
            />
            {fieldErrors.email && (
              <span
                style={{
                  fontSize: '14px',
                  color: '#dc2626',
                  marginTop: '4px',
                  display: 'block'
                }}
              >
                {fieldErrors.email}
              </span>
            )}
          </div>

          {/* Token Field */}
          <div style={{ width: '100%' }}>
            <Textfield
              label={labels.token}
              value={formData.token}
              onChange={(e) => handleFieldChange('token', e.target.value)}
              onBlur={(e) => validateField('token', e.target.value)}
              placeholder={placeholders.token}
              disabled={isLoading}
              required
              error={!!fieldErrors.token}
              style={{ width: '100%' }}
            />
            {fieldErrors.token && (
              <span
                style={{
                  fontSize: '14px',
                  color: '#dc2626',
                  marginTop: '4px',
                  display: 'block'
                }}
              >
                {fieldErrors.token}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <Stack
            direction="horizontal"
            gap={12}
            justify="end"
            style={{
              marginTop: 'var(--ds-spacing-2)',
              paddingTop: 'var(--ds-spacing-4)',
              borderTop: '1px solid var(--ds-color-neutral-border-subtle)'
            }}
          >
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || !formData.name || !formData.email || !formData.token}
            >
              {isLoading ? loadingText : submitText}
            </Button>
          </Stack>
        </Stack>
      </form>
    </Dialog>
  );
}
