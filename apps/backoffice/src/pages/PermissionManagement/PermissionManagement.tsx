import React, { useState } from 'react';
import './PermissionManagement.css';
import { useT } from '@xala/i18n';
import {
  useAdminPermissions,
  useGrantAdminPermission,
  useRevokeAdminPermission,
  type GrantPermissionDTO,
} from '@digilist/client-sdk/hooks';
import type { RentalObjectPermission } from '@digilist/client-sdk/services';

/**
 * Permission Management Dashboard
 *
 * Admin interface for managing granular rental object permissions
 * Features:
 * - Grant/revoke permissions
 * - User and organization grants
 * - Time-based permissions
 * - Audit log
 */

// Use the SDK type for permissions
type Permission = RentalObjectPermission;

export const PermissionManagement: React.FC = () => {
  const t = useT();
  const [showForm, setShowForm] = useState(false);
  const [filterObjectId, setFilterObjectId] = useState('');
  const [filterGrantee, setFilterGrantee] = useState('');

  // Fetch permissions using SDK hook
  const { data: permissionsData, isLoading } = useAdminPermissions({
    rentalObjectId: filterObjectId || undefined,
    search: filterGrantee || undefined,
  });
  const permissions = permissionsData?.data ?? [];

  // Grant permission mutation using SDK hook
  const grantPermission = useGrantAdminPermission();

  // Revoke permission mutation using SDK hook
  const revokePermission = useRevokeAdminPermission();

  const handleGrantPermission = (data: GrantPermissionDTO) => {
    grantPermission.mutate(data, {
      onSuccess: () => {
        setShowForm(false);
      },
    });
  };

  /**
   * Render permission badge
   */
  const renderPermissionBadges = (permission: Permission) => {
    const activePerms = [];
    if (permission.canView) activePerms.push('Vis');
    if (permission.canBook) activePerms.push('Book');
    if (permission.canManage) activePerms.push('Administrer');
    if (permission.canApproveBookings) activePerms.push('Godkjenn');
    if (permission.canCancelBookings) activePerms.push('Kanseller');
    if (permission.canViewReports) activePerms.push('Rapporter');
    if (permission.canSetPricing) activePerms.push('Prising');
    if (permission.canManageAvailability) activePerms.push('Tilgjengelighet');

    return (
      <div className="permission-badges">
        {activePerms.map(perm => (
          <span key={perm} className="permission-badge">
            {perm}
          </span>
        ))}
      </div>
    );
  };

  /**
   * Check if permission is active
   */
  const isActive = (permission: Permission): boolean => {
    if (permission.revokedAt) return false;
    
    const now = new Date();
    if (permission.validFrom && new Date(permission.validFrom) > now) return false;
    if (permission.validUntil && new Date(permission.validUntil) < now) return false;
    
    return true;
  };

  if (isLoading) {
    return <div className="loading">Laster tillatelser...</div>;
  }

  return (
    <div className="permission-management">
      {/* Header */}
      <div className="permission-header">
        <h1>{t('backoffice.text.tillatelsesstyring')}</h1>
        <p>{t('common.detaljert_tilgangskontroll_for_utleieobjekter')}</p>
        <button onClick={() => setShowForm(true)} className="btn-primary" type="button">
          + Gi tillatelse
        </button>
      </div>

      {/* Filters */}
      <div className="permission-filters">
        <input
          type="text"
          placeholder={t('common.filtrer_etter_objekt')}
          value={filterObjectId}
          onChange={(e) => setFilterObjectId(e.target.value)}
          className="filter-input"
        />
        <input
          type="text"
          placeholder={t('common.filtrer_etter_brukerorganisasjon')}
          value={filterGrantee}
          onChange={(e) => setFilterGrantee(e.target.value)}
          className="filter-input"
        />
      </div>

      {/* Permissions List */}
      <div className="permissions-list">
        {permissions.length === 0 ? (
          <div className="empty-state">
            <p>{t('common.ingen_tillatelser_funnet')}</p>
            <button onClick={() => setShowForm(true)} className="btn-secondary" type="button">
              Opprett første tillatelse
            </button>
          </div>
        ) : (
          <table className="permissions-table">
            <thead>
              <tr>
                <th>{t('backoffice.text.utleieobjekt')}</th>
                <th>{t('common.gitt_til')}</th>
                <th>{t('backoffice.text.tillatelser')}</th>
                <th>{t('common.gyldig_periode')}</th>
                <th>{t('backoffice.text.status')}</th>
                <th>{t('backoffice.text.handlinger')}</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((permission: Permission) => (
                <tr key={permission.id} className={!isActive(permission) ? 'inactive' : ''}>
                  <td>
                    <strong>{permission.rentalObjectName}</strong>
                  </td>
                  <td>
                    {permission.userId ? (
                      <div>
                        <span className="tag tag-user">{t('backoffice.text.user')}</span>
                        {permission.userName}
                      </div>
                    ) : (
                      <div>
                        <span className="tag tag-org">{t('backoffice.text.organization')}</span>
                        {permission.organizationName}
                      </div>
                    )}
                  </td>
                  <td>
                    {renderPermissionBadges(permission)}
                  </td>
                  <td>
                    {permission.validFrom || permission.validUntil ? (
                      <div className="validity-period">
                        {permission.validFrom && (
                          <div>Fra: {new Date(permission.validFrom).toLocaleDateString('nb-NO')}</div>
                        )}
                        {permission.validUntil && (
                          <div>Til: {new Date(permission.validUntil).toLocaleDateString('nb-NO')}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted">{t('backoffice.text.ubegrenset')}</span>
                    )}
                  </td>
                  <td>
                    {isActive(permission) ? (
                      <span className="status-badge status-active">{t('backoffice.status.active')}</span>
                    ) : (
                      <span className="status-badge status-inactive">{t('backoffice.status.inactive')}</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => revokePermission.mutate(permission.id)}
                      className="btn-danger-sm"
                      disabled={!isActive(permission)} type="button"
                    >
                      Tilbakekall
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Grant Permission Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{t('common.gi_tillatelse')}</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const grantTo = formData.get('grantTo') as 'USER' | 'ORGANIZATION';
                const data: GrantPermissionDTO = {
                  rentalObjectId: formData.get('rentalObjectId') as string,
                  grantTo,
                  permissions: {
                    canView: formData.get('canView') === 'on',
                    canBook: formData.get('canBook') === 'on',
                    canManage: formData.get('canManage') === 'on',
                    canApproveBookings: formData.get('canApproveBookings') === 'on',
                    canCancelBookings: formData.get('canCancelBookings') === 'on',
                    canViewReports: formData.get('canViewReports') === 'on',
                    canSetPricing: formData.get('canSetPricing') === 'on',
                    canManageAvailability: formData.get('canManageAvailability') === 'on',
                  },
                  validFrom: (formData.get('validFrom') as string) || undefined,
                  validUntil: (formData.get('validUntil') as string) || undefined,
                  userId: grantTo === 'USER' ? (formData.get('userId') as string) : undefined,
                  organizationId: grantTo === 'ORGANIZATION' ? (formData.get('organizationId') as string) : undefined,
                };

                handleGrantPermission(data);
              }}
            >
              {/* Form fields */}
              <div className="form-group">
                <label>{t('backoffice.text.utleieobjekt')}</label>
                <input type="text" name="rentalObjectId" required className="form-input" />
              </div>

              <div className="form-group">
                <label>{t('common.gi_til')}</label>
                <select name="grantTo" className="form-select">
                  <option value="USER">{t('backoffice.text.user')}</option>
                  <option value="ORGANIZATION">{t('backoffice.text.organization')}</option>
                </select>
              </div>

              <div className="form-group">
                <label>Bruker/Organisasjon ID</label>
                <input type="text" name="userId" className="form-input" />
              </div>

              <div className="form-section">
                <h3>{t('backoffice.text.tillatelser')}</h3>
                <div className="checkbox-grid">
                  <label>
                    <input type="checkbox" name="canView" defaultChecked />
                    Vis
                  </label>
                  <label>
                    <input type="checkbox" name="canBook" />
                    Book
                  </label>
                  <label>
                    <input type="checkbox" name="canManage" />
                    Administrer
                  </label>
                  <label>
                    <input type="checkbox" name="canApproveBookings" />
                    Godkjenn bookinger
                  </label>
                  <label>
                    <input type="checkbox" name="canCancelBookings" />
                    Kanseller bookinger
                  </label>
                  <label>
                    <input type="checkbox" name="canViewReports" />
                    Se rapporter
                  </label>
                  <label>
                    <input type="checkbox" name="canSetPricing" />
                    Sette prising
                  </label>
                  <label>
                    <input type="checkbox" name="canManageAvailability" />
                    Administrere tilgjengelighet
                  </label>
                </div>
              </div>

              <div className="form-section">
                <h3>{t('common.gyldig_periode_valgfritt')}</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('backoffice.text.fra')}</label>
                    <input type="date" name="validFrom" className="form-input" />
                  </div>
                  <div className="form-group">
                    <label>{t('backoffice.text.til')}</label>
                    <input type="date" name="validUntil" className="form-input" />
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                  Avbryt
                </button>
                <button type="submit" className="btn-primary">
                  Gi tillatelse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionManagement;
