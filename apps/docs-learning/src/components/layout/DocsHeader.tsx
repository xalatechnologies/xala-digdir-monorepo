/**
 * DocsHeader Component
 *
 * Top header with search bar, breadcrumbs, and language switcher.
 */

import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Textfield, Button, LanguageSwitcher, SearchIcon } from '@xala/ds';
import { useT, useLocale } from '@xala/i18n';
import styles from './DocsHeader.module.css';

export function DocsHeader() {
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const { locale, setLocale } = useLocale();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    },
    [searchQuery, navigate]
  );

  const handleLanguageChange = useCallback(
    (newLocale: string) => {
      setLocale(newLocale as 'nb' | 'en');
    },
    [setLocale]
  );

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        {/* Search bar */}
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <div className={styles.searchInputWrapper}>
            <SearchIcon className={styles.searchIcon} />
            <Textfield
              type="search"
              placeholder={t('docs.search.placeholder') || 'Søk i dokumentasjon...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
              aria-label={t('docs.search.label') || 'Søk'}
            />
          </div>
          <Button type="submit" data-size="sm" data-color="neutral" variant="tertiary">
            {t('docs.search.button') || 'Søk'}
          </Button>
        </form>

        {/* Actions */}
        <div className={styles.headerActions}>
          <LanguageSwitcher
            currentLocale={locale}
            onLocaleChange={handleLanguageChange}
            locales={[
              { code: 'nb', label: 'Norsk' },
              { code: 'en', label: 'English' },
            ]}
          />
        </div>
      </div>
    </header>
  );
}

export default DocsHeader;
