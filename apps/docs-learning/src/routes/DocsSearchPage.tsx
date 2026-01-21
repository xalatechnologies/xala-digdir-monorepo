/**
 * Docs Search Page
 */

import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Heading, Paragraph, Textfield, Card } from '@xalatechnologies/platform/ui';
import { useT } from '@xalatechnologies/platform/i18n';

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
    <div style={{ /* container - converted from CSS module */ }}>
      <header style={{ /* header - converted from CSS module */ }}>
        <Heading level={1}>{t('docs.search.page.title')}</Heading>
      </header>

      <div style={{ /* searchBox - converted from CSS module */ }}>
        <Textfield
          type="search"
          label={t('docs.search.label')}
          placeholder={t('form.docs.search.placeholder')}
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
          style={{ /* searchInput - converted from CSS module */ }}
          autoFocus
        />
      </div>

      <div style={{ /* results - converted from CSS module */ }}>
        {query.trim() && (
          <Paragraph style={{ /* resultCount - converted from CSS module */ }}>
            {results.length} {t('docs.search.results')} "{query}"
          </Paragraph>
        )}

        {results.map((result) => (
          <Link
            key={`${result.section}-${result.slug}`}
            to={`/${result.section}/${result.slug}`}
            style={{ /* resultLink - converted from CSS module */ }}
          >
            <Card style={{ /* resultCard - converted from CSS module */ }} style={{ padding: 'var(--ds-spacing-4)' }}>
              <Paragraph data-size="xs" style={{ /* resultSection - converted from CSS module */ }}>
                {t(`docs.sections.${result.section}.title`)}
              </Paragraph>
              <Heading level={3} style={{ /* resultTitle - converted from CSS module */ }}>
                {t(result.titleKey)}
              </Heading>
            </Card>
          </Link>
        ))}

        {query.trim() && results.length === 0 && (
          <div style={{ /* noResults - converted from CSS module */ }}>
            <Paragraph>{t('docs.search.noResults')}</Paragraph>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocsSearchPage;
