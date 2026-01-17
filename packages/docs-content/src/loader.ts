/**
 * Content Loader
 *
 * Loads and parses MDX content files with frontmatter.
 * Designed to work in both Node.js and browser environments.
 */

import matter from 'gray-matter';
import type {
  DocsArticle,
  DocsArticleMeta,
  DocsSection,
  DocsLocale,
  TocItem,
  DocsSectionMeta,
  DOCS_SECTIONS,
} from './types';

// Section metadata configuration
const SECTION_META: Record<DocsSection, Omit<DocsSectionMeta, 'articleCount'>> = {
  booking: {
    id: 'booking',
    title: { nb: 'Bookingsystem', en: 'Booking System' },
    description: { nb: 'Opprett og administrer bookinger', en: 'Create and manage bookings' },
    icon: 'calendar',
    featureFlag: 'docs.section.booking.enabled',
  },
  rbac: {
    id: 'rbac',
    title: { nb: 'Roller og tilgang', en: 'Roles & Access' },
    description: { nb: 'Forstå brukerroller og tillatelser', en: 'Understand user roles and permissions' },
    icon: 'shield',
    featureFlag: 'docs.section.rbac.enabled',
  },
  payments: {
    id: 'payments',
    title: { nb: 'Betalinger', en: 'Payments' },
    description: { nb: 'Betalinger og fakturering', en: 'Payments and invoicing' },
    icon: 'credit-card',
    featureFlag: 'docs.section.payments.enabled',
  },
  admin: {
    id: 'admin',
    title: { nb: 'Administrasjon', en: 'Administration' },
    description: { nb: 'Innstillinger og konfigurasjon', en: 'Settings and configuration' },
    icon: 'settings',
    featureFlag: 'docs.section.admin.enabled',
  },
  api: {
    id: 'api',
    title: { nb: 'API-dokumentasjon', en: 'API Documentation' },
    description: { nb: 'Teknisk referanse for utviklere', en: 'Technical reference for developers' },
    icon: 'api',
    featureFlag: 'docs.section.api.enabled',
  },
  integrations: {
    id: 'integrations',
    title: { nb: 'Integrasjoner', en: 'Integrations' },
    description: { nb: 'Koble til andre systemer', en: 'Connect to other systems' },
    icon: 'link',
    featureFlag: 'docs.section.integrations.enabled',
  },
  faq: {
    id: 'faq',
    title: { nb: 'Ofte stilte spørsmål', en: 'FAQ' },
    description: { nb: 'Vanlige spørsmål og svar', en: 'Frequently asked questions' },
    icon: 'help',
    featureFlag: 'docs.section.faq.enabled',
  },
};

/**
 * Extract TOC items from markdown content
 */
export function extractToc(content: string): TocItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const toc: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length as 2 | 3;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-zæøå0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    toc.push({ id, text, level });
  }

  return toc;
}

/**
 * Parse frontmatter and content from MDX string
 */
export function parseArticle(
  rawContent: string,
  section: DocsSection,
  slug: string
): DocsArticle {
  const { data, content } = matter(rawContent);

  const meta: DocsArticleMeta = {
    slug,
    title: data.title || slug,
    description: data.description || '',
    section,
    updatedAt: data.updatedAt || new Date().toISOString().split('T')[0],
    audiences: data.audiences || [],
    roles: data.roles || [],
    featureTags: data.featureTags || [],
    order: data.order,
    draft: data.draft,
  };

  return {
    ...meta,
    content,
    toc: extractToc(content),
  };
}

/**
 * Get section metadata
 */
export function getSectionMeta(section: DocsSection): Omit<DocsSectionMeta, 'articleCount'> {
  return SECTION_META[section];
}

/**
 * Get all section metadata
 */
export function getAllSectionsMeta(): Omit<DocsSectionMeta, 'articleCount'>[] {
  return Object.values(SECTION_META);
}

/**
 * Content loader interface for browser environments
 * Uses dynamic imports to load content at runtime
 */
export interface ContentLoader {
  getArticle(section: DocsSection, slug: string, locale: DocsLocale): Promise<DocsArticle | null>;
  getArticlesBySection(section: DocsSection, locale: DocsLocale): Promise<DocsArticleMeta[]>;
  getSections(locale: DocsLocale): Promise<DocsSectionMeta[]>;
}

// Re-export types
export * from './types';
