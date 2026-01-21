/**
 * Credentials Manager Component
 * 
 * Manages encrypted credentials for integrations.
 * Super admin only - displays and manages API keys, secrets, certificates.
 */

import React, { useState } from 'react';
import {
  Card,
  Button,
  Heading,
  Paragraph,
  Tag,
  Textfield,
  Select,
  Modal,
  Alert,
  Spinner,
} from '@xalatechnologies/platform/ui';
import {
  Key,
  Plus,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import {
  useIntegrationCredentials,
  useCreateCredential,
  useDeleteCredential,
  useRotateCredential,
  useCredentialValue,
  type CredentialInfo,
  type CreateCredentialInput,
} from '@digilist/client-sdk';
import { useT } from '@xalatechnologies/platform/i18n';

interface CredentialsManagerProps {
  integrationId: string;
  integrationName: string;
  onClose?: () => void;
}

const CREDENTIAL_TYPE_LABELS: Record<string, string> = {
  api_key: 'API-nøkkel',
  client_id: 'Klient-ID',
  client_secret: 'Klient-hemmelighet',
  certificate: 'Sertifikat',
  private_key: 'Privat nøkkel',
  oauth_token: 'OAuth-token',
  oauth_refresh_token: 'OAuth oppdateringstoken',
  webhook_secret: 'Webhook-hemmelighet',
  bearer_token: 'Bearer-token',
};

export function CredentialsManager({
  integrationId,
  integrationName,
  onClose: _onClose,
}: CredentialsManagerProps): React.ReactElement {
  const t = useT();
  // Translation function available for future localization
  const _t = useT(); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRotateModal, setShowRotateModal] = useState<CredentialInfo | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<CredentialInfo | null>(null);
  const [revealedCredentialId, setRevealedCredentialId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: credentials, isLoading, error, refetch } = useIntegrationCredentials(integrationId);
  const createCredential = useCreateCredential();
  const deleteCredential = useDeleteCredential();
  const rotateCredential = useRotateCredential();

  const handleCopy = async (value: string, id: string): Promise<void> => {
    await navigator.clipboard.writeText(value);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('nb-NO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner aria-label={t('state.loading')} />
      </div>
    );
  }

  if (error) {
    return (
      <Alert data-color="danger">
        <Heading level={4} data-size="xs">{t('integrations.text.feilVedLastingAvLegitimasjoner')}</Heading>
        <Paragraph>{t('common.kunne_ikke_hente_legitimasjoner')}</Paragraph>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading level={3} data-size="sm">{t('integrations.text.legitimasjoner')}</Heading>
          <Paragraph data-size="sm" className="text-gray-600">
            Administrer API-nøkler og hemmeligheter for {integrationName}
          </Paragraph>
        </div>
        <div className="flex gap-2">
          <Button
            data-variant="secondary"
            data-size="sm"
            type="button"
            onClick={() => refetch()}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Oppdater
          </Button>
          <Button
            data-variant="primary"
            data-size="sm"
            type="button"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Legg til
          </Button>
        </div>
      </div>

      {(!credentials || credentials.length === 0) ? (
        <Card className="p-8 text-center">
          <Key className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <Heading level={4} data-size="xs">{t('integrations.text.ingenLegitimasjoner')}</Heading>
          <Paragraph data-size="sm" className="text-gray-600 mt-2">
            Legg til API-nøkler og hemmeligheter for å konfigurere integrasjonen.
          </Paragraph>
          <Button
            data-variant="primary"
            data-size="sm"
            type="button"
            className="mt-4"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Legg til legitimasjon
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {credentials.map((credential) => (
            <CredentialCard
              key={credential.id}
              credential={credential}
              integrationId={integrationId}
              isRevealed={revealedCredentialId === credential.id}
              isCopied={copiedId === credential.id}
              onReveal={() => setRevealedCredentialId(
                revealedCredentialId === credential.id ? null : credential.id
              )}
              onCopy={handleCopy}
              onRotate={() => setShowRotateModal(credential)}
              onDelete={() => setShowDeleteConfirm(credential)}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}

      {/* Add Credential Modal */}
      {showAddModal && (
        <AddCredentialModal
          integrationId={integrationId}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            refetch();
          }}
          createCredential={createCredential}
        />
      )}

      {/* Rotate Credential Modal */}
      {showRotateModal && (
        <RotateCredentialModal
          credential={showRotateModal}
          integrationId={integrationId}
          onClose={() => setShowRotateModal(null)}
          onSuccess={() => {
            setShowRotateModal(null);
            refetch();
          }}
          rotateCredential={rotateCredential}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          credential={showDeleteConfirm}
          integrationId={integrationId}
          onClose={() => setShowDeleteConfirm(null)}
          onSuccess={() => {
            setShowDeleteConfirm(null);
            refetch();
          }}
          deleteCredential={deleteCredential}
        />
      )}
    </div>
  );
}

interface CredentialCardProps {
  credential: CredentialInfo;
  integrationId: string;
  isRevealed: boolean;
  isCopied: boolean;
  onReveal: () => void;
  onCopy: (value: string, id: string) => void;
  onRotate: () => void;
  onDelete: () => void;
  formatDate: (date: string | null) => string;
}

function CredentialCard({
  credential,
  integrationId,
  isRevealed,
  isCopied,
  onReveal,
  onCopy,
  onRotate,
  onDelete,
  formatDate,
}: CredentialCardProps): React.ReactElement {
  const { data: revealedValue, isLoading: isLoadingValue } = useCredentialValue(
    integrationId,
    credential.id,
    { enabled: isRevealed }
  );

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Key className="w-4 h-4 text-gray-500" />
            <span className="font-medium">{credential.name}</span>
            <Tag data-size="sm" data-color="neutral">
              {CREDENTIAL_TYPE_LABELS[credential.credentialType] || credential.credentialType}
            </Tag>
            {!credential.isActive && (
              <Tag data-size="sm" data-color="warning">{t('integrations.status.inactive')}</Tag>
            )}
            {credential.isExpired && (
              <Tag data-size="sm" data-color="danger">{t('integrations.text.utlopt')}</Tag>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <span>{t('common.verdi')}</span>
              {isLoadingValue ? (
                <Spinner aria-label={t("state.loading")} data-size="sm" />
              ) : isRevealed && revealedValue ? (
                <code className="bg-gray-100 px-2 py-0.5 rounded font-mono text-xs">
                  {revealedValue}
                </code>
              ) : (
                <code className="bg-gray-100 px-2 py-0.5 rounded font-mono text-xs">
                  {credential.maskedValue}
                </code>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            {credential.lastUsedAt && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Sist brukt: {formatDate(credential.lastUsedAt)}
              </span>
            )}
            {credential.lastRotatedAt && (
              <span className="flex items-center gap-1">
                <RefreshCw className="w-3 h-3" />
                Rotert: {formatDate(credential.lastRotatedAt)}
              </span>
            )}
            {credential.expiresAt && (
              <span className="flex items-center gap-1">
                {credential.isExpired ? (
                  <AlertTriangle className="w-3 h-3 text-red-500" />
                ) : (
                  <Clock className="w-3 h-3" />
                )}
                Utløper: {formatDate(credential.expiresAt)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            data-variant="tertiary"
            data-size="sm"
            type="button"
            onClick={onReveal}
            title={isRevealed ? 'Skjul' : 'Vis'}
          >
            {isRevealed ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>
          {isRevealed && revealedValue && (
            <Button
              data-variant="tertiary"
              data-size="sm"
              type="button"
              onClick={() => onCopy(revealedValue, credential.id)}
              title={t('integrations.title.kopier')}
            >
              {isCopied ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          )}
          <Button
            data-variant="tertiary"
            data-size="sm"
            type="button"
            onClick={onRotate}
            title={t('integrations.title.roter')}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            data-variant="tertiary"
            data-size="sm"
            type="button"
            onClick={onDelete}
            title={t("action.delete")}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

interface AddCredentialModalProps {
  integrationId: string;
  onClose: () => void;
  onSuccess: () => void;
  createCredential: ReturnType<typeof useCreateCredential>;
}

function AddCredentialModal({
  integrationId,
  onClose,
  onSuccess,
  createCredential,
}: AddCredentialModalProps): React.ReactElement {
  const [formData, setFormData] = useState<CreateCredentialInput>({
    credentialType: 'api_key',
    name: '',
    value: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim() || !formData.value.trim()) {
      setError('Navn og verdi er påkrevd');
      return;
    }

    try {
      await createCredential.mutateAsync({
        integrationId,
        input: formData,
      });
      onSuccess();
    } catch {
      setError('Kunne ikke opprette legitimasjon');
    }
  };

  return (
    <Modal open onClose={onClose}>
      <Heading level={3} data-size="sm" className="mb-4">
        Legg til legitimasjon
      </Heading>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Type"
          value={formData.credentialType}
          onChange={(e) => setFormData({ ...formData, credentialType: e.target.value as CreateCredentialInput['credentialType'] })}
        >
          {Object.entries(CREDENTIAL_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>

        <Textfield
          label="Navn"
          placeholder={t('common.feks_production_api_key')}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <Textfield
          label="Verdi"
          placeholder={t('common.apinokkel_eller_hemmelighet')}
          value={formData.value}
          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          type="password"
          required
        />

        {error && (
          <Alert data-color="danger">
            <Paragraph>{error}</Paragraph>
          </Alert>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button data-variant="secondary" type="button" onClick={onClose}>{t("action.cancel")}</Button>
          <Button
            data-variant="primary"
            type="submit"
            disabled={createCredential.isPending}
          >
            {createCredential.isPending ? t('state.saving') : 'Legg til'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

interface RotateCredentialModalProps {
  credential: CredentialInfo;
  integrationId: string;
  onClose: () => void;
  onSuccess: () => void;
  rotateCredential: ReturnType<typeof useRotateCredential>;
}

function RotateCredentialModal({
  credential,
  integrationId,
  onClose,
  onSuccess,
  rotateCredential,
}: RotateCredentialModalProps): React.ReactElement {
  const [newValue, setNewValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);

    if (!newValue.trim()) {
      setError('Ny verdi er påkrevd');
      return;
    }

    try {
      await rotateCredential.mutateAsync({
        integrationId,
        credentialId: credential.id,
        newValue,
      });
      onSuccess();
    } catch {
      setError('Kunne ikke rotere legitimasjon');
    }
  };

  return (
    <Modal open onClose={onClose}>
      <Heading level={3} data-size="sm" className="mb-4">
        Roter legitimasjon
      </Heading>

      <Alert data-color="warning" className="mb-4">
        <Paragraph data-size="sm">
          Du er i ferd med å rotere <strong>{credential.name}</strong>.
          Den gamle verdien vil bli erstattet og kan ikke gjenopprettes.
        </Paragraph>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Textfield
          label={t('common.ny_verdi')}
          placeholder={t('common.ny_apinokkel_eller_hemmelighet')}
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          type="password"
          required
        />

        {error && (
          <Alert data-color="danger">
            <Paragraph>{error}</Paragraph>
          </Alert>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button data-variant="secondary" type="button" onClick={onClose}>{t("action.cancel")}</Button>
          <Button
            data-variant="primary"
            type="submit"
            disabled={rotateCredential.isPending}
          >
            {rotateCredential.isPending ? t('common.roterer') : 'Roter'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

interface DeleteConfirmModalProps {
  credential: CredentialInfo;
  integrationId: string;
  onClose: () => void;
  onSuccess: () => void;
  deleteCredential: ReturnType<typeof useDeleteCredential>;
}

function DeleteConfirmModal({
  credential,
  integrationId,
  onClose,
  onSuccess,
  deleteCredential,
}: DeleteConfirmModalProps): React.ReactElement {
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (): Promise<void> => {
    setError(null);

    try {
      await deleteCredential.mutateAsync({
        integrationId,
        credentialId: credential.id,
      });
      onSuccess();
    } catch {
      setError('Kunne ikke slette legitimasjon');
    }
  };

  return (
    <Modal open onClose={onClose}>
      <Heading level={3} data-size="sm" className="mb-4">
        Slett legitimasjon
      </Heading>

      <Alert data-color="danger" className="mb-4">
        <Paragraph data-size="sm">
          Er du sikker på at du vil slette <strong>{credential.name}</strong>?
          Denne handlingen kan ikke angres.
        </Paragraph>
      </Alert>

      {error && (
        <Alert data-color="danger" className="mb-4">
          <Paragraph>{error}</Paragraph>
        </Alert>
      )}

      <div className="flex justify-end gap-2">
        <Button data-variant="secondary" type="button" onClick={onClose}>{t("action.cancel")}</Button>
        <Button
          data-variant="primary"
          data-color="danger"
          type="button"
          onClick={handleDelete}
          disabled={deleteCredential.isPending}
        >
          {deleteCredential.isPending ? 'Sletter...' : t("action.delete")}
        </Button>
      </div>
    </Modal>
  );
}

export default CredentialsManager;
