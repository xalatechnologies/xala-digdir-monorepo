/**
 * DocsHeader Component
 *
 * Top header with search bar, breadcrumbs, and language switcher.
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Textfield, Button, SearchIcon } from '@xala/ds';
import { useT, useLocale } from '@xala/i18n';

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
    <header style={{ /* header - converted from CSS module */ }}>
      <div style={{ /* headerContent - converted from CSS module */ }}>
        {/* Search bar */}
        <form onSubmit={handleSearch} style={{ /* searchForm - converted from CSS module */ }}>
          <div style={{ /* searchInputWrapper - converted from CSS module */ }}>
            <SearchIcon style={{ /* searchIcon - converted from CSS module */ }} />
            <Textfield
              type="search"
              placeholder={t('form.docs.search.placeholder') || 'Søk i dokumentasjon...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ /* searchInput - converted from CSS module */ }}
              aria-label={t('docs.search.label') || 'Søk'}
            />
          </div>
          <Button type="submit" data-size="sm" data-color="neutral" variant="tertiary">
            {t('docs.search.button') || 'Søk'}
          </Button>
        </form>

        {/* Actions */}
        <div style={{ /* headerActions - converted from CSS module */ }}>
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
