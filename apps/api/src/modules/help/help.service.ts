/**
 * Help Service (GAP-008)
 * Business logic for help system with TOC
 * 
 * Reference: packages/client-sdk/src/types/advanced-contracts.ts
 */
import { Injectable } from '../../core/decorators';

@Injectable()
export class HelpService {
  /**
   * Get table of contents with sections and articles
   * Returns HelpTOCDTO
   */
  async getTOC(): Promise<any> {
    // TODO: Load from CMS or database
    // For now, return hardcoded structure
    
    return {
      sections: [
        {
          id: 'getting-started',
          title: { nb: 'Kom i gang', en: 'Getting Started' },
          icon: 'rocket',
          order: 1,
          articles: [
            {
              id: 'intro',
              slug: 'introduksjon',
              title: { nb: 'Introduksjon til Digilist', en: 'Introduction to Digilist' },
              summary: { nb: 'Lær det grunnleggende om Digilist', en: 'Learn the basics of Digilist' },
              tags: ['basics', 'intro'],
              featured: true,
              lastUpdated: '2026-01-15',
            },
          ],
        },
        {
          id: 'bookings',
          title: { nb: 'Bestillinger', en: 'Bookings' },
          icon: 'calendar',
          order: 2,
          articles: [
            {
              id: 'create-booking',
              slug: 'opprette-bestilling',
              title: { nb: 'Opprette bestilling', en: 'Create Booking' },
              summary: { nb: 'Slik bestiller du utleieobjekter', en: 'How to book rental objects' },
              tags: ['bookings', 'howto'],
              featured: true,
              lastUpdated: '2026-01-15',
            },
          ],
        },
        {
          id: 'rental-objects',
          title: { nb: 'Utleieobjekter', en: 'Rental Objects' },
          icon: 'building',
          order: 3,
          articles: [],
        },
      ],
      quickLinks: [
        {
          label: { nb: 'Kontakt support', en: 'Contact Support' },
          url: '/support',
          icon: 'support',
        },
        {
          label: { nb: 'API dokumentasjon', en: 'API Documentation' },
          url: '/docs/api',
          icon: 'code',
        },
      ],
      searchEnabled: true,
    };
  }

  /**
   * Get help article by slug
   * Returns HelpArticleDTO
   */
  async getArticle(slug: string): Promise<any> {
    // TODO: Load from CMS or database
    
    return {
      id: 'intro',
      slug,
      title: { nb: 'Introduksjon til Digilist', en: 'Introduction to Digilist' },
      content: {
        nb: '# Velkommen til Digilist\n\nDigilist er en plattform for utleie av kommunale ressurser...',
        en: '# Welcome to Digilist\n\nDigilist is a platform for renting municipal resources...',
      },
      sectionId: 'getting-started',
      tags: ['basics', 'intro'],
      relatedArticles: [],
      lastUpdated: '2026-01-15',
      readTime: 5,
    };
  }

  /**
   * Search help articles
   */
  async search(query: string): Promise<any[]> {
    // TODO: Real search implementation
    
    return [];
  }
}
