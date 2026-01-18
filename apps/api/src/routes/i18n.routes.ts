/**
 * i18n Translations Routes
 * 
 * API endpoints for serving translations from the database.
 * The database is the ONLY source of truth for translations.
 */

import { FastifyPluginAsync } from 'fastify';
import { db } from '../db';
import { translations } from '@digilist/database-schema';
import { eq, and, or, isNull } from 'drizzle-orm';

export const i18nRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /api/i18n/:lang
   * Get all translations for a specific language
   * 
   * Merges system defaults with tenant-specific overrides if authenticated
   * 
   * @param lang - Language code (nb, en, nn)
   * @returns Flat object of key-value translation pairs
   */
  fastify.get('/i18n/:lang', {
    schema: {
      description: 'Get all translations for a language',
      tags: ['i18n'],
      params: {
        type: 'object',
        properties: {
          lang: { type: 'string', enum: ['nb', 'en', 'nn'] },
        },
        required: ['lang'],
      },
      response: {
        200: {
          type: 'object',
          additionalProperties: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      const { lang } = request.params as { lang: string };
      const user = request.user as any;
      const tenantId = user?.tenantId || null;

      try {
        // Query translations: system defaults + tenant overrides
        const rows = await db
          .select({
            namespace: translations.namespace,
            key: translations.key,
            value: translations.value,
            isSystemDefault: translations.isSystemDefault,
            tenantId: translations.tenantId,
          })
          .from(translations)
          .where(
            and(
              eq(translations.language, lang),
              or(
                isNull(translations.tenantId), // System defaults
                tenantId ? eq(translations.tenantId, tenantId) : isNull(translations.tenantId)
              )
            )
          );

        // Build result object, tenant overrides take precedence
        const result: Record<string, string> = {};
        
        // First add all system defaults
        for (const row of rows) {
          if (row.isSystemDefault) {
            result[`${row.namespace}.${row.key}`] = row.value;
          }
        }
        
        // Then overlay tenant overrides
        for (const row of rows) {
          if (!row.isSystemDefault && row.tenantId === tenantId) {
            result[`${row.namespace}.${row.key}`] = row.value;
          }
        }

        return reply.send(result);
      } catch (error) {
        fastify.log.error('Failed to fetch translations:', error);
        
        return reply.status(500).send({
          type: 'https://api.digilist.no/errors/internal',
          title: 'Internal Server Error',
          status: 500,
          detail: 'Failed to fetch translations',
        });
      }
    },
  });

  /**
   * GET /api/i18n/:lang/:namespace
   * Get translations for a specific namespace
   * 
   * @param lang - Language code  
   * @param namespace - Namespace (e.g., common, payment, saasAdmin)
   * @returns Flat object of key-value pairs within the namespace
   */
  fastify.get('/i18n/:lang/:namespace', {
    schema: {
      description: 'Get translations for a specific namespace',
      tags: ['i18n'],
      params: {
        type: 'object',
        properties: {
          lang: { type: 'string' },
          namespace: { type: 'string' },
        },
        required: ['lang', 'namespace'],
      },
    },
    handler: async (request, reply) => {
      const { lang, namespace } = request.params as { lang: string; namespace: string };
      const user = request.user as any;
      const tenantId = user?.tenantId || null;

      try {
        const rows = await db
          .select({
            key: translations.key,
            value: translations.value,
            isSystemDefault: translations.isSystemDefault,
            tenantId: translations.tenantId,
          })
          .from(translations)
          .where(
            and(
              eq(translations.language, lang),
              eq(translations.namespace, namespace),
              or(
                isNull(translations.tenantId),
                tenantId ? eq(translations.tenantId, tenantId) : isNull(translations.tenantId)
              )
            )
          );

        const result: Record<string, string> = {};
        
        // System defaults first
        for (const row of rows) {
          if (row.isSystemDefault) {
            result[row.key] = row.value;
          }
        }
        
        // Tenant overrides
        for (const row of rows) {
          if (!row.isSystemDefault && row.tenantId === tenantId) {
            result[row.key] = row.value;
          }
        }

        return reply.send(result);
      } catch (error) {
        fastify.log.error('Failed to fetch namespace translations:', error);
        
        return reply.status(500).send({
          type: 'https://api.digilist.no/errors/internal',
          title: 'Internal Server Error',
          status: 500,
          detail: 'Failed to fetch translations',
        });
      }
    },
  });

  /**
   * GET /api/i18n/keys
   * Get list of all available translation keys (for scanner/admin)
   */
  fastify.get('/i18n/keys', {
    schema: {
      description: 'Get list of all translation keys',
      tags: ['i18n', 'admin'],
    },
    handler: async (request, reply) => {
      try {
        const rows = await db
          .selectDistinct({
            namespace: translations.namespace,
            key: translations.key,
          })
          .from(translations)
          .where(eq(translations.isSystemDefault, true));

        const keys = rows.map(r => `${r.namespace}.${r.key}`);
        
        return reply.send({
          data: keys,
          meta: {
            total: keys.length,
          },
        });
      } catch (error) {
        fastify.log.error('Failed to fetch translation keys:', error);
        
        return reply.status(500).send({
          type: 'https://api.digilist.no/errors/internal',
          title: 'Internal Server Error',
          status: 500,
          detail: 'Failed to fetch translation keys',
        });
      }
    },
  });
};
