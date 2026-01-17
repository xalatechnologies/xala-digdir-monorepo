/**
 * Docs Content Model Types
 *
 * TypeScript interfaces for the documentation and learning system.
 * Designed for file-based MDX content (MVP) with extensibility for
 * future DB-backed CMS integration.
 */

/** Supported audience/app targets */
export type DocsAudience = 'web' | 'backoffice' | 'minside' | 'saas-admin' | 'tenant-admin';

/** Role tags for content targeting */
export type DocsRole =
  | 'end-user'
  | 'org-member'
  | 'org-admin'
  | 'tenant-admin'
  | 'saas-admin';

/** Feature tags for content filtering */
export type DocsFeatureTag =
  | 'payments'
  | 'approvals'
  | 'recurring'
  | 'feature-flags'
  | 'messaging'
  | 'booking'
  | 'rbac'
  | 'integrations';

/** Section identifiers (feature-flag controlled) */
export type DocsSection =
  | 'booking'
  | 'rbac'
  | 'payments'
  | 'admin'
  | 'api'
  | 'integrations'
  | 'faq';

/** All available sections for iteration */
export const DOCS_SECTIONS: DocsSection[] = [
  'booking',
  'rbac',
  'payments',
  'admin',
  'api',
  'integrations',
  'faq',
];

/** Table of contents item */
export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

/** Article frontmatter metadata */
export interface DocsArticleMeta {
  slug: string;
  title: string;
  description: string;
  section: DocsSection;
  updatedAt: string; // ISO date
  audiences: DocsAudience[];
  roles: DocsRole[];
  featureTags: DocsFeatureTag[];
  order?: number;
  draft?: boolean;
}

/** Full article with content */
export interface DocsArticle extends DocsArticleMeta {
  content: string; // MDX/Markdown content
  toc: TocItem[]; // Auto-generated from headings
}

/** Section metadata */
export interface DocsSectionMeta {
  id: DocsSection;
  title: { nb: string; en: string };
  description: { nb: string; en: string };
  icon: string;
  featureFlag: string;
  articleCount: number;
}

/** Search result item */
export interface DocsSearchResult {
  article: DocsArticleMeta;
  matches: {
    field: 'title' | 'description' | 'content' | 'headings';
    snippet: string;
  }[];
  score: number;
}

/** Search index entry (for client-side search) */
export interface DocsSearchIndexEntry {
  slug: string;
  section: DocsSection;
  title: string;
  description: string;
  headings: string[];
  content: string; // Plain text (stripped markdown)
}

/** Content source abstraction (for future DB-backed CMS) */
export interface DocsContentSource {
  getArticle(
    section: DocsSection,
    slug: string,
    locale: 'nb' | 'en'
  ): Promise<DocsArticle | null>;
  getArticlesBySection(
    section: DocsSection,
    locale: 'nb' | 'en'
  ): Promise<DocsArticleMeta[]>;
  getSections(locale: 'nb' | 'en'): Promise<DocsSectionMeta[]>;
  searchArticles(query: string, locale: 'nb' | 'en'): Promise<DocsSearchResult[]>;
}

/** Navigation item for sidebar */
export interface DocsNavItem {
  id: string;
  label: string;
  description?: string;
  href: string;
  icon?: string;
  featureFlag?: string;
  children?: DocsNavItem[];
}

/** Navigation section for sidebar */
export interface DocsNavSection {
  title?: string;
  items: DocsNavItem[];
}
