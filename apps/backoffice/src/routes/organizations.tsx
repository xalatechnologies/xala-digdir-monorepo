import { useParams, useNavigate } from 'react-router-dom';
import { Card, Heading, Paragraph, Button, Badge, Table, Dropdown, ChevronLeftIcon } from '@xala/ds';
import { useCallback, useState } from 'react';
import {
  useUploadOrganizationLogo,
  formatBytes,
  formatSpeed,
  formatETA,
  UploadProgressTracker,
} from '@digilist/client-sdk';
import type { UploadProgressEvent } from '@digilist/client-sdk';

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const MoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);

// Mock data
interface Organization {
  id: string;
  name: string;
  orgNumber: string;
  memberCount: number;
  activeBookings: number;
  seasonLeases: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

const mockOrganizations: Organization[] = [
  { id: '1', name: 'Nordre Follo IL', orgNumber: '912 345 678', memberCount: 450, activeBookings: 8, seasonLeases: 2, status: 'active', createdAt: '2022-03-15' },
  { id: '2', name: 'Ski Håndball', orgNumber: '923 456 789', memberCount: 280, activeBookings: 5, seasonLeases: 1, status: 'active', createdAt: '2022-05-20' },
  { id: '3', name: 'Ås Turnforening', orgNumber: '934 567 890', memberCount: 320, activeBookings: 4, seasonLeases: 1, status: 'active', createdAt: '2022-08-10' },
  { id: '4', name: 'Langhus Fotball', orgNumber: '945 678 901', memberCount: 380, activeBookings: 6, seasonLeases: 1, status: 'active', createdAt: '2023-01-05' },
  { id: '5', name: 'Vestby Korps', orgNumber: '956 789 012', memberCount: 65, activeBookings: 2, seasonLeases: 0, status: 'active', createdAt: '2023-04-18' },
  { id: '6', name: 'Ås Kultur', orgNumber: '967 890 123', memberCount: 120, activeBookings: 3, seasonLeases: 0, status: 'active', createdAt: '2023-06-01' },
  { id: '7', name: 'Gamle Klubben', orgNumber: '978 901 234', memberCount: 45, activeBookings: 0, seasonLeases: 0, status: 'inactive', createdAt: '2021-11-30' },
];

function StatusBadge({ status }: { status: Organization['status'] }) {
  return (
    <Badge data-color={status === 'active' ? 'success' : 'neutral'} data-size="sm">
      {status === 'active' ? 'Aktiv' : 'Inaktiv'}
    </Badge>
  );
}

export function OrganizationsPage() {
  const navigate = useNavigate();

  const totalMembers = mockOrganizations.reduce((sum, o) => sum + o.memberCount, 0);
  const activeOrgs = mockOrganizations.filter((o) => o.status === 'active').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Heading level={1} data-size="lg" style={{ margin: 0 }}>
            Organisasjoner
          </Heading>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
            Administrer registrerte organisasjoner og deres medlemmer.
          </Paragraph>
        </div>
        <Button type="button" variant="primary" data-size="md">
          <PlusIcon />
          Legg til organisasjon
        </Button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--ds-spacing-4)' }}>
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            Totalt organisasjoner
          </Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)' }}>
            {mockOrganizations.length}
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            Aktive organisasjoner
          </Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)' }}>
            {activeOrgs}
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            Totalt medlemmer
          </Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)' }}>
            {totalMembers.toLocaleString('nb-NO')}
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            Med sesongleie
          </Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)' }}>
            {mockOrganizations.filter((o) => o.seasonLeases > 0).length}
          </Heading>
        </Card>
      </div>

      {/* Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>Navn</Table.HeaderCell>
              <Table.HeaderCell>Org.nr</Table.HeaderCell>
              <Table.HeaderCell>Medlemmer</Table.HeaderCell>
              <Table.HeaderCell>Aktive bookinger</Table.HeaderCell>
              <Table.HeaderCell>Sesongleie</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Registrert</Table.HeaderCell>
              <Table.HeaderCell style={{ width: '60px' }}></Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {mockOrganizations.map((org) => (
              <Table.Row
                key={org.id}
                onClick={() => navigate(`/organizations/${org.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <Table.Cell>
                  <span style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                    {org.name}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <span style={{ fontFamily: 'monospace', fontSize: 'var(--ds-font-size-sm)' }}>
                    {org.orgNumber}
                  </span>
                </Table.Cell>
                <Table.Cell>{org.memberCount}</Table.Cell>
                <Table.Cell>
                  {org.activeBookings > 0 ? (
                    <Badge data-color="accent" data-size="sm">{org.activeBookings}</Badge>
                  ) : (
                    <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>0</span>
                  )}
                </Table.Cell>
                <Table.Cell>
                  {org.seasonLeases > 0 ? (
                    <Badge data-color="success" data-size="sm">{org.seasonLeases}</Badge>
                  ) : (
                    <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>0</span>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <StatusBadge status={org.status} />
                </Table.Cell>
                <Table.Cell>
                  {new Date(org.createdAt).toLocaleDateString('nb-NO')}
                </Table.Cell>
                <Table.Cell>
                  <Dropdown.TriggerContext>
                    <Dropdown.Trigger asChild>
                      <Button
                        type="button"
                        variant="tertiary"
                        data-size="sm"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Handlinger"
                      >
                        <MoreIcon />
                      </Button>
                    </Dropdown.Trigger>
                    <Dropdown placement="bottom-end">
                      <Dropdown.List>
                        <Dropdown.Item>
                          <Dropdown.Button onClick={() => navigate(`/organizations/${org.id}`)}>
                            Se detaljer
                          </Dropdown.Button>
                        </Dropdown.Item>
                        <Dropdown.Item>
                          <Dropdown.Button onClick={() => navigate(`/organizations/${org.id}`)}>Rediger</Dropdown.Button>
                        </Dropdown.Item>
                        <Dropdown.Item>
                          <Dropdown.Button>Se bookinger</Dropdown.Button>
                        </Dropdown.Item>
                        <Dropdown.Item>
                          <Dropdown.Button>
                            {org.status === 'active' ? 'Deaktiver' : 'Aktiver'}
                          </Dropdown.Button>
                        </Dropdown.Item>
                      </Dropdown.List>
                    </Dropdown>
                  </Dropdown.TriggerContext>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card>
    </div>
  );
}

/**
 * Organization Edit Page - Edit organization details and logo
 */
export function OrganizationEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressEvent | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'compressing' | 'uploading' | 'complete' | 'error'>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const uploadMutation = useUploadOrganizationLogo();

  // Mock organization data - in real app, fetch from SDK
  const organization = mockOrganizations.find(o => o.id === id);

  if (!organization && id !== 'new') {
    return (
      <Card style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
        <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          Organisasjon ikke funnet
        </Heading>
        <Paragraph
          data-size="sm"
          style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0, marginBottom: 'var(--ds-spacing-4)' }}
        >
          Organisasjonen du leter etter finnes ikke eller du har ikke tilgang.
        </Paragraph>
        <Button type="button" variant="primary" onClick={() => navigate('/organizations')}>
          Tilbake til liste
        </Button>
      </Card>
    );
  }

  const handleFileUpload = useCallback(async (file: File) => {
    if (!id || id === 'new') {
      // For new organizations, just show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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
            id,
            file,
            options: {
              onProgress: (progress) => {
                setUploadProgress(progress);
              },
            },
          });

          setUploadStatus('complete');
          setLogoPreview(reader.result as string);

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
  }, [id, uploadMutation]);

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
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)' }}>
          <Button
            type="button"
            variant="tertiary"
            onClick={() => navigate('/organizations')}
            aria-label="Tilbake til liste"
          >
            <ChevronLeftIcon />
          </Button>
          <div>
            <Heading level={1} data-size="lg" style={{ margin: 0 }}>
              {id === 'new' ? 'Ny organisasjon' : organization?.name || 'Rediger organisasjon'}
            </Heading>
            <Paragraph
              data-size="sm"
              style={{
                color: 'var(--ds-color-neutral-text-subtle)',
                margin: 0,
                marginTop: 'var(--ds-spacing-1)',
              }}
            >
              {id === 'new' ? 'Opprett ny organisasjon' : 'Rediger organisasjonsdetaljer'}
            </Paragraph>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/organizations')}
          >
            Avbryt
          </Button>
          <Button type="button" variant="primary">
            Lagre
          </Button>
        </div>
      </div>

      {/* Logo Upload Section */}
      <Card
        style={{
          padding: 'var(--ds-spacing-5)',
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          border: '1px solid var(--ds-color-neutral-border-subtle)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--ds-color-accent-base-default)' }}>
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <div>
              <Heading level={3} data-size="xs" style={{ margin: 0 }}>
                Organisasjonslogo
              </Heading>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                Last opp logo for organisasjonen
              </Paragraph>
            </div>
          </div>
        </div>

        {/* Logo Preview */}
        {logoPreview && (
          <div style={{ marginBottom: 'var(--ds-spacing-4)', display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                width: '200px',
                height: '200px',
                borderRadius: 'var(--ds-border-radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--ds-color-neutral-border-subtle)',
              }}
            >
              <img
                src={logoPreview}
                alt="Organisasjonslogo"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        )}

        {/* Upload Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && document.getElementById('logo-input')?.click()}
          style={{
            border: `2px dashed ${isDragging ? 'var(--ds-color-accent-border-default)' : 'var(--ds-color-neutral-border-default)'}`,
            borderRadius: 'var(--ds-border-radius-lg)',
            padding: 'var(--ds-spacing-6)',
            textAlign: 'center',
            backgroundColor: isDragging ? 'var(--ds-color-accent-surface-default)' : 'var(--ds-color-neutral-surface-default)',
            transition: 'all 0.2s ease',
            cursor: isUploading ? 'default' : 'pointer',
          }}
        >
          {!isUploading ? (
            <>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--ds-color-neutral-text-subtle)" strokeWidth="1.5" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                Dra og slipp logo her
              </Paragraph>
              <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                eller klikk for å velge fil • PNG, JPG, SVG • Maks 2 MB
              </Paragraph>
            </>
          ) : null}
          <input
            id="logo-input"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            disabled={isUploading}
          />
        </div>

        {/* Upload Progress Display */}
        {uploadProgress && uploadStatus !== 'idle' && (
          <div style={{ marginTop: 'var(--ds-spacing-4)' }}>
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
                    Organisasjonslogo
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
            marginTop: 'var(--ds-spacing-4)',
            padding: 'var(--ds-spacing-3)',
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
            Anbefalt: kvadratisk bilde med minimum 400x400 piksler. Filer over 2 MB vil bli komprimert automatisk.
          </Paragraph>
        </div>
      </Card>

      {/* Basic Info Section (Placeholder) */}
      <Card
        style={{
          padding: 'var(--ds-spacing-5)',
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          border: '1px solid var(--ds-color-neutral-border-subtle)',
        }}
      >
        <Heading level={3} data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          Grunnleggende informasjon
        </Heading>
        <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
          Organisasjonsdetaljer vil bli lagt til her i en fremtidig fase.
        </Paragraph>
      </Card>
    </div>
  );
}
