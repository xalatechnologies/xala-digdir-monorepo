/**
 * Help Controller
 * In-app help, FAQ, and support endpoints
 * KRAV-SUP-01: Opplæringsplan + innebygde hjelpeverktøy
 * KRAV-SUP-03: Brukerstøtte for innbyggere
 */
import { Controller, Get, Post } from '../../core/decorators';
import type { FastifyRequest, FastifyReply } from 'fastify';

interface TenantRequest extends FastifyRequest {
  tenantId?: string | null;
  userId?: string | null;
}

@Controller('/api/help')
export class HelpController {
  /**
   * GET /api/help/faq - Get FAQ entries
   */
  @Get('/faq')
  async getFaq(request: TenantRequest, reply: FastifyReply) {
    const { category, lang = 'no' } = request.query as any;

    const faqs = [
      {
        id: 'faq-1',
        category: 'booking',
        question: 'Hvordan booker jeg et lokale?',
        answer: 'Gå til "Lokaler" i menyen, velg ønsket lokale, og klikk "Book nå". Følg veiviseren for å fullføre bookingen.',
        sortOrder: 1,
      },
      {
        id: 'faq-2',
        category: 'booking',
        question: 'Kan jeg kansellere en booking?',
        answer: 'Ja, du kan kansellere innen fristen som er angitt for hvert lokale. Gå til "Mine bookinger" og klikk "Kanseller".',
        sortOrder: 2,
      },
      {
        id: 'faq-3',
        category: 'payment',
        question: 'Hvilke betalingsmetoder støttes?',
        answer: 'Vi støtter Vipps og faktura. Velg betalingsmetode under booking.',
        sortOrder: 1,
      },
      {
        id: 'faq-4',
        category: 'payment',
        question: 'Hvordan får jeg kvittering?',
        answer: 'Kvittering sendes automatisk til din e-post etter betaling. Du kan også laste ned fra "Mine bookinger".',
        sortOrder: 2,
      },
      {
        id: 'faq-5',
        category: 'account',
        question: 'Hvordan logger jeg inn?',
        answer: 'Klikk "Logg inn" og bruk ID-porten (BankID) for sikker innlogging.',
        sortOrder: 1,
      },
      {
        id: 'faq-6',
        category: 'account',
        question: 'Hvordan endrer jeg mine opplysninger?',
        answer: 'Gå til "Min profil" for å oppdatere kontaktinformasjon og varslingsinnstillinger.',
        sortOrder: 2,
      },
      {
        id: 'faq-7',
        category: 'seasonal',
        question: 'Hva er sesongleie?',
        answer: 'Sesongleie er faste tider for lag og foreninger over en hel sesong (høst/vår). Søk om sesongleie under "Sesongleie".',
        sortOrder: 1,
      },
      {
        id: 'faq-8',
        category: 'accessibility',
        question: 'Er løsningen universelt utformet?',
        answer: 'Ja, løsningen oppfyller WCAG 2.1 AA og er tilgjengelig for alle brukere.',
        sortOrder: 1,
      },
    ];

    const filtered = category
      ? faqs.filter(f => f.category === category)
      : faqs;

    return {
      data: filtered,
      meta: {
        total: filtered.length,
        categories: ['booking', 'payment', 'account', 'seasonal', 'accessibility'],
        language: lang,
      },
    };
  }

  /**
   * GET /api/help/guides - Get user guides/tutorials
   */
  @Get('/guides')
  async getGuides(request: TenantRequest, reply: FastifyReply) {
    const { role = 'user' } = request.query as any;

    const guides = [
      // User guides
      {
        id: 'guide-user-1',
        role: 'user',
        title: 'Kom i gang med booking',
        description: 'Lær hvordan du booker lokaler enkelt og raskt.',
        steps: [
          'Logg inn med ID-porten',
          'Finn ønsket lokale under "Lokaler"',
          'Velg dato og tid',
          'Godkjenn vilkår og betal',
          'Motta bekreftelse på e-post',
        ],
        estimatedMinutes: 5,
      },
      {
        id: 'guide-user-2',
        role: 'user',
        title: 'Administrer dine bookinger',
        description: 'Se, endre og kanseller bookinger.',
        steps: [
          'Gå til "Mine bookinger"',
          'Se oversikt over kommende og tidligere bookinger',
          'Klikk på en booking for detaljer',
          'Bruk "Kanseller" for å avbestille innen frist',
        ],
        estimatedMinutes: 3,
      },
      // Admin guides
      {
        id: 'guide-admin-1',
        role: 'admin',
        title: 'Opprett nytt lokale',
        description: 'Legg til utleieobjekter i systemet.',
        steps: [
          'Gå til "Lokaler" i administrasjon',
          'Klikk "Nytt lokale"',
          'Fyll inn navn, beskrivelse, bilder',
          'Konfigurer tilgjengelighet og priser',
          'Publiser lokalet',
        ],
        estimatedMinutes: 10,
      },
      {
        id: 'guide-admin-2',
        role: 'admin',
        title: 'Behandle bookingforespørsler',
        description: 'Godkjenn eller avslå bookinger som krever saksbehandling.',
        steps: [
          'Gå til "Bookingforespørsler"',
          'Se detaljer om forespørselen',
          'Godkjenn eller avslå med kommentar',
          'Bruker mottar automatisk varsel',
        ],
        estimatedMinutes: 5,
      },
    ];

    const filtered = guides.filter(g => g.role === role || role === 'all');

    return {
      data: filtered,
      meta: {
        total: filtered.length,
        roles: ['user', 'admin', 'case_handler'],
      },
    };
  }

  /**
   * GET /api/help/tooltips - Get UI tooltips for contextual help
   */
  @Get('/tooltips')
  async getTooltips(request: TenantRequest, reply: FastifyReply) {
    const tooltips = {
      booking: {
        startTime: 'Velg starttid for leieperioden',
        endTime: 'Velg sluttid for leieperioden',
        notes: 'Legg til evt. beskjed til utleier',
        termsAccepted: 'Du må godta vilkårene for å fullføre booking',
      },
      listing: {
        status: 'Publisert = synlig for alle, Utkast = kun synlig for admin',
        capacity: 'Maks antall personer lokalet er godkjent for',
        pricePerHour: 'Standard timepris før rabatter',
      },
      seasonal: {
        weekdays: 'Velg hvilke ukedager sesongleien gjelder',
        priority: 'Lavere tall = høyere prioritet i køen',
      },
    };

    return { data: tooltips };
  }

  /**
   * POST /api/help/contact - Submit support request
   * KRAV-SUP-03: Kontaktmulighet for henvendelser
   */
  @Post('/contact')
  async submitContact(request: TenantRequest, reply: FastifyReply) {
    const { name, email, subject, message, category } = request.body as any;

    // Validate required fields
    if (!email || !message) {
      reply.code(400);
      return {
        type: '/errors/validation',
        title: 'Validation Error',
        status: 400,
        detail: 'E-post og melding er påkrevd',
      };
    }

    // Create support ticket (mock)
    const ticketId = `TKT-${Date.now().toString().slice(-6)}`;

    return {
      data: {
        ticketId,
        status: 'received',
        message: 'Takk for din henvendelse. Vi svarer normalt innen 1-2 virkedager.',
        submittedAt: new Date().toISOString(),
        contact: { name, email, subject, category },
      },
    };
  }

  /**
   * GET /api/help/training - Get training materials
   * KRAV-SUP-01: Opplæringsplan
   */
  @Get('/training')
  async getTraining(request: TenantRequest, reply: FastifyReply) {
    return {
      data: {
        plan: {
          title: 'Opplæringsplan for Digilist',
          version: '1.0',
          lastUpdated: '2026-01-14',
          modules: [
            {
              id: 'module-1',
              title: 'Grunnleggende bruk',
              description: 'Innlogging, navigasjon og brukergrensesnitt',
              duration: '30 min',
              targetRoles: ['user', 'admin', 'case_handler'],
            },
            {
              id: 'module-2',
              title: 'Booking for innbyggere',
              description: 'Søk, velg, book og betal for lokaler',
              duration: '20 min',
              targetRoles: ['user'],
            },
            {
              id: 'module-3',
              title: 'Administrasjon av lokaler',
              description: 'Opprette, redigere og publisere lokaler',
              duration: '45 min',
              targetRoles: ['admin'],
            },
            {
              id: 'module-4',
              title: 'Saksbehandling',
              description: 'Behandle forespørsler og godkjenninger',
              duration: '30 min',
              targetRoles: ['case_handler', 'admin'],
            },
            {
              id: 'module-5',
              title: 'Rapporter og statistikk',
              description: 'Generere og eksportere rapporter',
              duration: '20 min',
              targetRoles: ['admin'],
            },
          ],
        },
        resources: [
          { type: 'pdf', title: 'Brukermanual', url: '/docs/manual.pdf' },
          { type: 'video', title: 'Introduksjonsvideo', url: '/docs/intro.mp4' },
          { type: 'link', title: 'FAQ', url: '/api/help/faq' },
        ],
        support: {
          email: 'support@digilist.no',
          phone: '+47 123 45 678',
          hours: 'Man-Fre 08:00-16:00',
        },
      },
    };
  }
}
