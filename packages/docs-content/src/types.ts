/**
 * Docs Content Types
 *
 * TypeScript interfaces for the documentation content system.
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

/** Section identifiers */
export type DocsSection =
  | 'booking'
  | 'rbac'
  | 'payments'
  | 'admin'
  | 'api'
  | 'integrations'
  | 'faq';

/** All available sections */
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
  updatedAt: string;
  audiences: DocsAudience[];
  roles: DocsRole[];
  featureTags: DocsFeatureTag[];
  order?: number;
  draft?: boolean;
}

/** Full article with content */
export interface DocsArticle extends DocsArticleMeta {
  content: string;
  toc: TocItem[];
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

/** Search index entry */
export interface DocsSearchIndexEntry {
  slug: string;
  section: DocsSection;
  title: string;
  description: string;
  headings: string[];
  content: string;
}

/** Supported locales */
export type DocsLocale = 'nb' | 'en';
