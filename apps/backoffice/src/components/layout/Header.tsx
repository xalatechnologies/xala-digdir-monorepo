import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { DashboardHeader, type SearchResultGroup } from '@xalatechnologies/platform/ui';
import { useUnreadCount } from '@digilist/client-sdk';
import { useAuth } from '@xala/auth';
import { useTheme } from '@xalatechnologies/platform/ui';
import { useT } from '@xala/i18n';
import { useNotificationCenter } from '@xala/runtime';

interface HeaderProps {
  title?: string;
}

export function Header({ title: _title }: HeaderProps) {
  const t = useT();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { openNotificationCenter } = useNotificationCenter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultGroup[]>([]);

  // Get real unread notification count
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.data?.count ?? 0;

  // Handle search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.length >= 2) {
      // TODO: Implement actual search logic
      setSearchResults([]);
    } else {
      setSearchResults([]);
    }
  };

  return (
    <DashboardHeader
      logo={<img src="/logo.svg" alt="Digilist" style={{ height: 32 }} />}
      user={user ? { name: user.name || '', email: user.email || '' } : null}
      searchPlaceholder={t('common.sok_i_bookinger_lokaler')}
      searchValue={searchQuery}
      searchResults={searchResults}
      onSearchChange={handleSearchChange}
      onSearchResultSelect={(result) => {
        if (result.href) navigate(result.href);
      }}
      showThemeToggle
      isDark={isDark}
      onThemeToggle={toggleTheme}
      showNotifications
      notificationCount={unreadCount}
      onNotificationClick={openNotificationCenter}
      onLogout={logout}
      onSettingsClick={() => navigate('/settings')}
      onProfileClick={() => navigate('/settings')}
    />
  );
}
