/**
 * Translations Controller
 * REST API endpoints for fetching translations from database
 */
import { Controller, Get } from '../../core/decorators';
import { container } from '../../core/container';
import { translations } from '@digilist/database-schema';
import { eq, and, isNull, or } from 'drizzle-orm';
import type { FastifyRequest, FastifyReply } from 'fastify';

@Controller('/api/translations')
export class TranslationsController {
  /**
   * GET /api/translations/:language
   * Fetch all translations for a specific language
   */
  @Get('/:language')
  async getByLanguage(
    request: FastifyRequest<{ Params: { language: string } }>,
    reply: FastifyReply
  ) {
    const { language } = request.params;
    const tenantId = request.headers['x-tenant-id'] as string | undefined;
    const db = container.resolve<any>('Database');

    try {
      const results = await db
        .select({
          namespace: translations.namespace,
          key: translations.key,
          value: translations.value,
        })
        .from(translations)
        .where(
          and(
            eq(translations.language, language),
            or(
              isNull(translations.tenantId),
              tenantId ? eq(translations.tenantId, tenantId) : isNull(translations.tenantId)
            )
          )
        );

      // Group by namespace
      const grouped: Record<string, Record<string, string>> = {};
      for (const row of results) {
        if (!grouped[row.namespace]) {
          grouped[row.namespace] = {};
        }
        grouped[row.namespace][row.key] = row.value;
      }

      return {
        language,
        translations: grouped,
        count: results.length,
      };
    } catch (error) {
      console.error('Failed to fetch translations:', error);
      return reply.status(500).send({ error: 'Failed to fetch translations' });
    }
  }

  /**
   * GET /api/translations/:language/:namespace
   * Fetch translations for a specific namespace
   */
  @Get('/:language/:namespace')
  async getByNamespace(
    request: FastifyRequest<{ Params: { language: string; namespace: string } }>,
    reply: FastifyReply
  ) {
    const { language, namespace } = request.params;
    const tenantId = request.headers['x-tenant-id'] as string | undefined;
    const db = container.resolve<any>('Database');

    try {
      const results = await db
        .select({
          key: translations.key,
          value: translations.value,
        })
        .from(translations)
        .where(
          and(
            eq(translations.language, language),
            eq(translations.namespace, namespace),
            or(
              isNull(translations.tenantId),
              tenantId ? eq(translations.tenantId, tenantId) : isNull(translations.tenantId)
            )
          )
        );

      const translationsMap: Record<string, string> = {};
      for (const row of results) {
        translationsMap[row.key] = row.value;
      }

      return {
        language,
        namespace,
        translations: translationsMap,
        count: results.length,
      };
    } catch (error) {
      console.error('Failed to fetch translations:', error);
      return reply.status(500).send({ error: 'Failed to fetch translations' });
    }
  }
}
