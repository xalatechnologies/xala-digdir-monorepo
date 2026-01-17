/**
 * Docs Search Page
 */

import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Heading, Paragraph, Textfield, Card, CardContent, SearchIcon } from '@xala/ds';
import { useT } from '@xala/i18n';
import styles from './DocsSearchPage.module.css';

// Mock search results for MVP
const MOCK_RESULTS = [
  { section: 'booking', slug: 'create-booking', title: 'Opprett en booking', description: 'Steg-for-steg guide til opprettelse', snippet: 'Lær hvordan du oppretter en booking...' },
  { section: 'booking', slug: 'manage-bookings', title: 'Administrer bookinger', description: 'Oversikt og håndtering', snippet: 'Administrer dine bookinger fra...' },
  { section: 'rbac', slug: 'roles-explained', title: 'Forstå rollene', description: 'Detaljert beskrivelse', snippet: 'Rollene definerer tilgang til...' },
  { section: 'payments', slug: 'invoicing', title: 'Fakturering', description: 'Guide til faktura', snippet: 'Fakturaer sendes automatisk...' },
];

export function DocsSearchPage() {
  const t = useT();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const lower = query.toLowerCase();
    return MOCK_RESULTS.filter(
      (r) =>
        r.title.toLowerCase().includes(lower) ||
        r.description.toLowerCase().includes(lower) ||
        r.snippet.toLowerCase().includes(lower)
    );
  }, [query]);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.trim()) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Heading level={1}>{t('docs.search.title') || 'Søk i dokumentasjon'}</Heading>
      </header>

      <div className={styles.searchBox}>
        <Textfield
          type="search"
          placeholder={t('docs.search.placeholder') || 'Skriv for å søke...'}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className={styles.searchInput}
          autoFocus
        />
      </div>

      <div className={styles.results}>
        {query.trim() && (
          <Paragraph className={styles.resultCount}>
            {results.length} {t('docs.search.results') || 'resultater'} for "{query}"
          </Paragraph>
        )}

        {results.map((result) => (
          <Link
            key={`${result.section}-${result.slug}`}
            to={`/${result.section}/${result.slug}`}
            className={styles.resultLink}
          >
            <Card className={styles.resultCard}>
              <CardContent>
                <Paragraph data-size="xs" className={styles.resultSection}>
                  {t(`docs.sections.${result.section}.title`) || result.section}
                </Paragraph>
                <Heading level={3} className={styles.resultTitle}>
                  {result.title}
                </Heading>
                <Paragraph data-size="sm" className={styles.resultSnippet}>
                  {result.snippet}
                </Paragraph>
              </CardContent>
            </Card>
          </Link>
        ))}

        {query.trim() && results.length === 0 && (
          <div className={styles.noResults}>
            <Paragraph>{t('docs.search.noResults') || 'Ingen resultater funnet.'}</Paragraph>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocsSearchPage;
