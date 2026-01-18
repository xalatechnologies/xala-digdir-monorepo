/**
 * Docs Search Page
 */

import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Heading, Paragraph, Textfield, Card } from '@xala/ds';
import { useT } from '@xala/i18n';
import styles from './DocsSearchPage.module.css';

// Mock search results for MVP - article titles/snippets would come from MDX content
const MOCK_RESULTS = [
  { section: 'booking', slug: 'create-booking', titleKey: 'docs.article.createBooking', snippet: '' },
  { section: 'booking', slug: 'manage-bookings', titleKey: 'docs.article.manageBookings', snippet: '' },
  { section: 'rbac', slug: 'roles-explained', titleKey: 'docs.article.rolesExplained', snippet: '' },
  { section: 'payments', slug: 'invoicing', titleKey: 'docs.article.invoicing', snippet: '' },
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
      (r) => {
        const title = t(r.titleKey) || r.section;
        return title.toLowerCase().includes(lower) || r.section.toLowerCase().includes(lower);
      }
    );
  }, [query, t]);

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
        <Heading level={1}>{t('docs.search.page.title')}</Heading>
      </header>

      <div className={styles.searchBox}>
        <Textfield
          type="search"
          label={t('docs.search.label')}
          placeholder={t('form.docs.search.placeholder')}
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
          className={styles.searchInput}
          autoFocus
        />
      </div>

      <div className={styles.results}>
        {query.trim() && (
          <Paragraph className={styles.resultCount}>
            {results.length} {t('docs.search.results')} "{query}"
          </Paragraph>
        )}

        {results.map((result) => (
          <Link
            key={`${result.section}-${result.slug}`}
            to={`/${result.section}/${result.slug}`}
            className={styles.resultLink}
          >
            <Card className={styles.resultCard} style={{ padding: 'var(--ds-spacing-4)' }}>
              <Paragraph data-size="xs" className={styles.resultSection}>
                {t(`docs.sections.${result.section}.title`)}
              </Paragraph>
              <Heading level={3} className={styles.resultTitle}>
                {t(result.titleKey)}
              </Heading>
            </Card>
          </Link>
        ))}

        {query.trim() && results.length === 0 && (
          <div className={styles.noResults}>
            <Paragraph>{t('docs.search.noResults')}</Paragraph>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocsSearchPage;
