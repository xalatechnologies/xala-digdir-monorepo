/**
 * DocsHeader Component
 *
 * Top header with search bar, breadcrumbs, and language switcher.
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Textfield, Button, SearchIcon } from '@xala/ds';
import { useT, useLocale } from '@xala/i18n';
import styles from './DocsHeader.module.css';

export function DocsHeader() {
  const t = useT();
  const navigate = useNavigate();
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

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'nb' ? 'en' : 'nb');
  }, [locale, setLocale]);

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        {/* Search bar */}
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <div className={styles.searchInputWrapper}>
            <SearchIcon className={styles.searchIcon} />
            <Textfield
              type="search"
              placeholder={t('form.docs.search.placeholder') || 'Søk i dokumentasjon...'}
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
          <Button
            type="button"
            data-size="sm"
            data-color="neutral"
            variant="tertiary"
            onClick={toggleLocale}
          >
            {locale === 'nb' ? 'EN' : 'NO'}
          </Button>
        </div>
      </div>
    </header>
  );
}

export default DocsHeader;
