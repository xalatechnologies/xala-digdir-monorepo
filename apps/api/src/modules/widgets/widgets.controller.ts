/**
 * Widgets Controller
 * Embeddable widgets for external websites
 */
import { Controller, Get } from '../../core/decorators';
import { container } from '../../core/container';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, desc } from 'drizzle-orm';
import { listings } from '../../database/schema/index';

@Controller('/api/widgets')
export class WidgetsController {
  /**
   * GET /api/widgets/listings - Widget listing data
   */
  @Get('/listings')
  async getListingsWidget(request: FastifyRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { tenantId, limit = 6 } = request.query as any;

    const result = await db
      .select({
        id: listings.id,
        name: listings.name,
        slug: listings.slug,
        type: listings.type,
        description: listings.description,
        pricing: listings.pricing,
        images: listings.images,
      })
      .from(listings)
      .where(eq(listings.status, 'published'))
      .orderBy(desc(listings.createdAt))
      .limit(Number(limit));

    return { data: result };
  }

  /**
   * GET /api/widgets/calendar - Calendar widget data
   */
  @Get('/calendar')
  async getCalendarWidget(request: FastifyRequest, reply: FastifyReply) {
    const { listingId, month } = request.query as any;

    // Return mock calendar data
    return {
      data: {
        listingId,
        month: month || new Date().toISOString().slice(0, 7),
        availableDays: [1, 2, 3, 5, 6, 8, 9, 10, 12, 13, 15, 16, 17, 19, 20],
        blockedDays: [4, 7, 11, 14, 18],
      },
    };
  }

  /**
   * GET /api/widgets/embed.js - Embeddable script
   */
  @Get('/embed.js')
  async getEmbedScript(request: FastifyRequest, reply: FastifyReply) {
    reply.header('Content-Type', 'application/javascript');
    
    return `
(function() {
  var DIGILIST_API = 'https://api.digilist.no';
  
  function DigilistWidget(config) {
    this.tenantId = config.tenantId;
    this.containerId = config.containerId;
    this.type = config.type || 'listings';
  }
  
  DigilistWidget.prototype.render = function() {
    var container = document.getElementById(this.containerId);
    if (!container) return;
    
    var iframe = document.createElement('iframe');
    iframe.src = DIGILIST_API + '/widgets/' + this.type + '?tenantId=' + this.tenantId;
    iframe.style.width = '100%';
    iframe.style.border = 'none';
    iframe.style.minHeight = '400px';
    container.appendChild(iframe);
  };
  
  window.DigilistWidget = DigilistWidget;
})();
    `.trim();
  }
}
