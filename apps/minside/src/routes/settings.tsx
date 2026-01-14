import { Card, Heading, Paragraph, Button } from '@xala/ds';
import { useT, useLocale } from '@xala/i18n';
import { useAuth } from '../hooks/useAuth';
import { useCallback, useState } from 'react';
import {
  useUploadUserAvatar,
  formatBytes,
  formatSpeed,
  formatETA,
  UploadProgressTracker,
} from '@digilist/client-sdk';
import type { UploadProgressEvent } from '@digilist/client-sdk';

export function SettingsPage() {
  const t = useT();
  const { locale } = useLocale();
  const { user, logout } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressEvent | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'compressing' | 'uploading' | 'complete' | 'error'>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const uploadMutation = useUploadUserAvatar();

  const handleFileUpload = useCallback(async (file: File) => {
    if (!user?.id) {
      setUploadError('Bruker-ID mangler');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    const tracker = new UploadProgressTracker();

    try {
      // Simulate compression phase
      setUploadStatus('compressing');
      const reader = new FileReader();

      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = tracker.update(e.loaded, e.total);
          setUploadProgress(progress);
        }
      };

      reader.onloadend = async () => {
        // Start upload phase
        setUploadStatus('uploading');
        tracker.reset();

        try {
          await uploadMutation.mutateAsync({
            id: user.id,
            file,
            options: {
              onProgress: (progress) => {
                setUploadProgress(progress);
              },
            },
          });

          setUploadStatus('complete');
          setAvatarPreview(reader.result as string);

          // Clear progress after a delay
          setTimeout(() => {
            setUploadProgress(null);
            setUploadStatus('idle');
          }, 2000);
        } catch (error) {
          setUploadStatus('error');
          setUploadError(error instanceof Error ? error.message : 'Opplasting feilet');
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      setUploadStatus('error');
      setUploadError(error instanceof Error ? error.message : 'Opplasting feilet');
    } finally {
      setIsUploading(false);
    }
  }, [user?.id, uploadMutation]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) {
      await handleFileUpload(files[0]!);
    }
  }, [handleFileUpload]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) {
      await handleFileUpload(files[0]!);
    }
    e.target.value = '';
  }, [handleFileUpload]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div>
        <Heading level={1} data-size="lg" style={{ margin: 0 }}>
          {t('minside.settings')}
        </Heading>
        <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
          {t('minside.settingsDesc')}
        </Paragraph>
      </div>

      {/* Profile Section */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          {t('minside.profile')}
        </Heading>

        {/* User Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)', marginBottom: 'var(--ds-spacing-5)' }}>
          {avatarPreview ? (
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: 'var(--ds-border-radius-full)',
                overflow: 'hidden',
                border: '2px solid var(--ds-color-neutral-border-subtle)',
              }}
            >
              <img
                src={avatarPreview}
                alt="Brukeravatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ) : (
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: 'var(--ds-border-radius-full)',
                backgroundColor: 'var(--ds-color-accent-surface-default)',
                color: 'var(--ds-color-accent-text-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--ds-font-size-xl)',
                fontWeight: 'var(--ds-font-weight-bold)',
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          <div>
            <Paragraph data-size="md" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
              {user?.name || 'Bruker'}
            </Paragraph>
            <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              {user?.email || ''}
            </Paragraph>
          </div>
        </div>

        {/* Avatar Upload Section */}
        <div
          style={{
            marginTop: 'var(--ds-spacing-4)',
            paddingTop: 'var(--ds-spacing-4)',
            borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-3)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--ds-color-accent-base-default)' }}>
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <Heading level={3} data-size="xs" style={{ margin: 0 }}>
              Profilbilde
            </Heading>
          </div>

          {/* Upload Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && document.getElementById('avatar-input')?.click()}
            style={{
              border: `2px dashed ${isDragging ? 'var(--ds-color-accent-border-default)' : 'var(--ds-color-neutral-border-default)'}`,
              borderRadius: 'var(--ds-border-radius-lg)',
              padding: 'var(--ds-spacing-4)',
              textAlign: 'center',
              backgroundColor: isDragging ? 'var(--ds-color-accent-surface-default)' : 'var(--ds-color-neutral-surface-default)',
              transition: 'all 0.2s ease',
              cursor: isUploading ? 'default' : 'pointer',
            }}
          >
            {!isUploading ? (
              <>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--ds-color-neutral-text-subtle)" strokeWidth="1.5" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                  Dra og slipp bilde her
                </Paragraph>
                <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                  eller klikk for å velge fil • PNG, JPG • Maks 2 MB
                </Paragraph>
              </>
            ) : null}
            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              disabled={isUploading}
            />
          </div>

          {/* Upload Progress Display */}
          {uploadProgress && uploadStatus !== 'idle' && (
            <div style={{ marginTop: 'var(--ds-spacing-3)' }}>
              <div
                style={{
                  padding: 'var(--ds-spacing-3)',
                  backgroundColor: 'var(--ds-color-neutral-surface-default)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  border: '1px solid var(--ds-color-neutral-border-subtle)',
                }}
              >
                {/* Status header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                    {uploadStatus === 'compressing' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--ds-color-accent-base-default)', animation: 'spin 1s linear infinite' }}>
                        <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8" />
                      </svg>
                    )}
                    {uploadStatus === 'uploading' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--ds-color-accent-base-default)' }}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    )}
                    {uploadStatus === 'complete' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--ds-color-success-base-default)' }}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {uploadStatus === 'error' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--ds-color-danger-base-default)' }}>
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                    )}
                    <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                      Profilbilde
                    </Paragraph>
                  </div>
                  <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {uploadStatus === 'compressing' && 'Komprimerer...'}
                    {uploadStatus === 'uploading' && 'Laster opp...'}
                    {uploadStatus === 'complete' && 'Fullført'}
                    {uploadStatus === 'error' && uploadError}
                  </Paragraph>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                  <div
                    style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: 'var(--ds-color-neutral-background-subtle)',
                      borderRadius: 'var(--ds-border-radius-full)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${uploadProgress.percentage}%`,
                        height: '100%',
                        backgroundColor: uploadStatus === 'error'
                          ? 'var(--ds-color-danger-base-default)'
                          : uploadStatus === 'complete'
                          ? 'var(--ds-color-success-base-default)'
                          : 'var(--ds-color-accent-base-default)',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Progress details */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {formatBytes(uploadProgress.loaded)} av {formatBytes(uploadProgress.total)} ({uploadProgress.percentage}%)
                  </Paragraph>
                  {uploadProgress.speed !== undefined && uploadProgress.speed > 0 && (
                    <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {formatSpeed(uploadProgress.speed)}
                      {uploadProgress.estimatedTimeRemaining !== undefined && (
                        <> • {formatETA(uploadProgress.estimatedTimeRemaining)} gjenstår</>
                      )}
                    </Paragraph>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tips */}
          <div
            style={{
              marginTop: 'var(--ds-spacing-3)',
              padding: 'var(--ds-spacing-2)',
              backgroundColor: 'var(--ds-color-info-surface-default)',
              borderRadius: 'var(--ds-border-radius-md)',
              border: '1px solid var(--ds-color-info-border-default)',
              display: 'flex',
              gap: 'var(--ds-spacing-2)',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ color: 'var(--ds-color-info-text-default)', flexShrink: 0, marginTop: '2px' }}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-info-text-default)' }}>
              Anbefalt: kvadratisk bilde med minimum 200x200 piksler. Filer over 2 MB vil bli komprimert automatisk.
            </Paragraph>
          </div>
        </div>
      </Card>

      {/* Preferences Section */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          {t('minside.preferences')}
        </Heading>

        {/* Language Setting */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 'var(--ds-spacing-4)', borderBottom: '1px solid var(--ds-color-neutral-border-subtle)' }}>
          <div>
            <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
              {t('settings.language')}
            </Paragraph>
            <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              {locale === 'nb' ? 'Norsk (Bokmål)' : 'English'}
            </Paragraph>
          </div>
          {/* TODO: Re-enable when localization is fully implemented
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
            <Button
              type="button"
              variant={locale === 'nb' ? 'primary' : 'secondary'}
              data-size="sm"
              onClick={() => setLocale('nb')}
            >
              Norsk
            </Button>
            <Button
              type="button"
              variant={locale === 'en' ? 'primary' : 'secondary'}
              data-size="sm"
              onClick={() => setLocale('en')}
            >
              English
            </Button>
          </div>
          */}
        </div>

        {/* Notifications Setting */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--ds-spacing-4)' }}>
          <div>
            <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
              {t('minside.notifications')}
            </Paragraph>
            <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              E-postvarsler for bookinger
            </Paragraph>
          </div>
          <Button type="button" variant="secondary" data-size="sm">
            {t('common.edit')}
          </Button>
        </div>
      </Card>

      {/* Logout */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
              {t('auth.logout')}
            </Paragraph>
            <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              Logg ut av din konto
            </Paragraph>
          </div>
          <Button type="button" variant="secondary" data-size="sm" onClick={logout}>
            {t('auth.logout')}
          </Button>
        </div>
      </Card>
    </div>
  );
}
