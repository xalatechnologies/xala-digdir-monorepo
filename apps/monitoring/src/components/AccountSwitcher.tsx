/**
 * AccountSwitcher Context Wrapper
 *
 * Thin wrapper that connects AccountContext to the DS AccountSwitcher block.
 * This follows Thin App architecture - app-specific context wiring, DS handles UI.
 */

import { useNavigate } from 'react-router-dom';
import { AccountSwitcher as DSAccountSwitcher } from '@xalatechnologies/platform/ui';
import { useAccountContext } from '@digilist/runtime';

export function AccountSwitcher() {
  const {
    accountType,
    selectedOrganization,
    organizations,
    switchToPersonal,
    switchToOrganization,
    getActiveAccount,
  } = useAccountContext();

  const navigate = useNavigate();

  const handleSwitchToPersonal = () => {
    switchToPersonal();
    navigate('/', { state: { intentionalSwitch: true } });
  };

  const handleSwitchToOrganization = (orgId: string) => {
    switchToOrganization(orgId);
    navigate('/org', { state: { intentionalSwitch: true } });
  };

  const handleManageOrganizations = () => {
    navigate('/settings');
  };

  return (
    <DSAccountSwitcher
      accountType={accountType}
      selectedOrganization={selectedOrganization}
      organizations={organizations}
      activeAccount={getActiveAccount()}
      onSwitchToPersonal={handleSwitchToPersonal}
      onSwitchToOrganization={handleSwitchToOrganization}
      onManageOrganizations={handleManageOrganizations}
    />
  );
}
