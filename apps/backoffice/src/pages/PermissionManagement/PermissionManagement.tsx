import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import './PermissionManagement.css';

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

interface Permission {
  id: string;
  rentalObjectId: string;
  rentalObjectName: string;
  userId?: string;
  userName?: string;
  organizationId?: string;
  organizationName?: string;
  
  // Permission flags
  canView: boolean;
  canBook: boolean;
  canManage: boolean;
  canApproveBookings: boolean;
  canCancelBookings: boolean;
  canViewReports: boolean;
  canSetPricing: boolean;
  canManageAvailability: boolean;
  
  // Time-based
  validFrom?: Date;
  validUntil?: Date;
  
  // Audit
  grantedBy: string;
  grantedAt: Date;
  revokedAt?: Date;
}

interface PermissionFormData {
  rentalObjectId: string;
  grantTo: 'USER' | 'ORGANIZATION';
  userId?: string;
  organizationId?: string;
  permissions: {
    canView: boolean;
    canBook: boolean;
    canManage: boolean;
    canApproveBookings: boolean;
    canCancelBookings: boolean;
    canViewReports: boolean;
    canSetPricing: boolean;
    canManageAvailability: boolean;
  };
  validFrom?: string;
  validUntil?: string;
}

export const PermissionManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [filterObjectId, setFilterObjectId] = useState('');
  const [filterGrantee, setFilterGrantee] = useState('');

  // Fetch permissions
  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ['permissions', filterObjectId, filterGrantee],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterObjectId) params.set('rentalObjectId', filterObjectId);
      if (filterGrantee) params.set('search', filterGrantee);
      
      const response = await fetch(`/api/admin/permissions?${params}`);
      if (!response.ok) throw new Error('Failed to fetch permissions');
      return response.json();
    },
  });

  // Grant permission mutation
  const grantPermission = useMutation({
    mutationFn: async (data: PermissionFormData) => {
      const response = await fetch('/api/admin/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to grant permission');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      setShowForm(false);
    },
  });

  // Revoke permission mutation
  const revokePermission = useMutation({
    mutationFn: async (permissionId: string) => {
      const response = await fetch(`/api/admin/permissions/${permissionId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to revoke permission');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
    },
  });

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
        <h1>Tillatelsesstyring</h1>
        <p>Detaljert tilgangskontroll for utleieobjekter</p>
        <button onClick={() => setShowForm(true)} className="btn-primary" type="button">
          + Gi tillatelse
        </button>
      </div>

      {/* Filters */}
      <div className="permission-filters">
        <input
          type="text"
          placeholder="Filtrer etter objekt..."
          value={filterObjectId}
          onChange={(e) => setFilterObjectId(e.target.value)}
          className="filter-input"
        />
        <input
          type="text"
          placeholder="Filtrer etter bruker/organisasjon..."
          value={filterGrantee}
          onChange={(e) => setFilterGrantee(e.target.value)}
          className="filter-input"
        />
      </div>

      {/* Permissions List */}
      <div className="permissions-list">
        {permissions.length === 0 ? (
          <div className="empty-state">
            <p>Ingen tillatelser funnet</p>
            <button onClick={() => setShowForm(true)} className="btn-secondary" type="button">
              Opprett første tillatelse
            </button>
          </div>
        ) : (
          <table className="permissions-table">
            <thead>
              <tr>
                <th>Utleieobjekt</th>
                <th>Gitt til</th>
                <th>Tillatelser</th>
                <th>Gyldig periode</th>
                <th>Status</th>
                <th>Handlinger</th>
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
                        <span className="tag tag-user">Bruker</span>
                        {permission.userName}
                      </div>
                    ) : (
                      <div>
                        <span className="tag tag-org">Organisasjon</span>
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
                      <span className="text-muted">Ubegrenset</span>
                    )}
                  </td>
                  <td>
                    {isActive(permission) ? (
                      <span className="status-badge status-active">Aktiv</span>
                    ) : (
                      <span className="status-badge status-inactive">Inaktiv</span>
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
            <h2>Gi tillatelse</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data: any = {
                  rentalObjectId: formData.get('rentalObjectId'),
                  grantTo: formData.get('grantTo'),
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
                  validFrom: formData.get('validFrom') || undefined,
                  validUntil: formData.get('validUntil') || undefined,
                };
                
                if (data.grantTo === 'USER') {
                  data.userId = formData.get('userId');
                } else {
                  data.organizationId = formData.get('organizationId');
                }
                
                grantPermission.mutate(data);
              }}
            >
              {/* Form fields */}
              <div className="form-group">
                <label>Utleieobjekt</label>
                <input type="text" name="rentalObjectId" required className="form-input" />
              </div>

              <div className="form-group">
                <label>Gi til</label>
                <select name="grantTo" className="form-select">
                  <option value="USER">Bruker</option>
                  <option value="ORGANIZATION">Organisasjon</option>
                </select>
              </div>

              <div className="form-group">
                <label>Bruker/Organisasjon ID</label>
                <input type="text" name="userId" className="form-input" />
              </div>

              <div className="form-section">
                <h3>Tillatelser</h3>
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
                <h3>Gyldig periode (valgfritt)</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Fra</label>
                    <input type="date" name="validFrom" className="form-input" />
                  </div>
                  <div className="form-group">
                    <label>Til</label>
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
