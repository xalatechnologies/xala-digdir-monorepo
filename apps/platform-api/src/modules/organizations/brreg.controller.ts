/**
 * Brreg Integration Controller
 * 
 * Integration with Brønnøysundregistrene (Brreg) for Norwegian organization lookup
 * Used for membership organizations in MinSide
 * 
 * Endpoints:
 * - GET /api/brreg/search - Search organizations
 * - GET /api/brreg/org/:orgNumber - Get organization details
 * - POST /api/organizations/from-brreg - Create org from Brreg data
 */
import { Controller, Get, Post } from '../../core/decorators';
import type { FastifyRequest, FastifyReply } from 'fastify';

interface TenantRequest extends FastifyRequest {
  tenantId?: string | null;
  userId?: string | null;
}

// Mock Brreg data (in production, would call Brreg API)
const mockBrregOrgs = [
  {
    organisasjonsnummer: '123456789',
    navn: 'Idrettslaget Fjelltopp',
    organisasjonsform: { kode: 'FLI', beskrivelse: 'Forening/lag/innretning' },
    registreringsdatoEnhetsregisteret: '2015-03-15',
    registrertIMvaregisteret: false,
    naeringskode1: { kode: '93.120', beskrivelse: 'Idrettslag' },
    antallAnsatte: 0,
    forretningsadresse: {
      land: 'Norge',
      landkode: 'NO',
      postnummer: '0001',
      poststed: 'OSLO',
      adresse: ['Idrettsveien 1'],
      kommune: 'OSLO',
      kommunenummer: '0301',
    },
    hjemmeside: 'https://fjelltopp-il.no',
  },
  {
    organisasjonsnummer: '987654321',
    navn: 'Kulturhuset Sentrum',
    organisasjonsform: { kode: 'STI', beskrivelse: 'Stiftelse' },
    registreringsdatoEnhetsregisteret: '2010-06-20',
    registrertIMvaregisteret: true,
    naeringskode1: { kode: '90.040', beskrivelse: 'Drift av lokaler' },
    antallAnsatte: 5,
    forretningsadresse: {
      land: 'Norge',
      landkode: 'NO',
      postnummer: '5006',
      poststed: 'BERGEN',
      adresse: ['Kulturgate 42'],
      kommune: 'BERGEN',
      kommunenummer: '4601',
    },
  },
  {
    organisasjonsnummer: '111222333',
    navn: 'Svømmeklubben Havet',
    organisasjonsform: { kode: 'FLI', beskrivelse: 'Forening/lag/innretning' },
    registreringsdatoEnhetsregisteret: '2018-09-01',
    registrertIMvaregisteret: false,
    naeringskode1: { kode: '93.120', beskrivelse: 'Idrettslag' },
    antallAnsatte: 0,
    forretningsadresse: {
      land: 'Norge',
      landkode: 'NO',
      postnummer: '7011',
      poststed: 'TRONDHEIM',
      adresse: ['Sjøgata 10'],
      kommune: 'TRONDHEIM',
      kommunenummer: '5001',
    },
  },
];

@Controller('/api/brreg')
export class BrregController {

  /**
   * GET /api/brreg/search - Search for organizations in Brreg
   * Query params: q (search query), type (org form type)
   */
  @Get('/search')
  async searchOrganizations(request: TenantRequest, reply: FastifyReply) {
    const { q, type, limit = 20 } = request.query as any;

    if (!q || q.length < 2) {
      reply.code(400);
      return {
        type: 'https://api.digilist.no/errors/validation-error',
        title: 'Validation Error',
        status: 400,
        detail: 'Search query must be at least 2 characters',
      };
    }

    let results = mockBrregOrgs.filter(org => 
      org.navn.toLowerCase().includes(q.toLowerCase()) ||
      org.organisasjonsnummer.includes(q)
    );

    if (type) {
      results = results.filter(org => org.organisasjonsform.kode === type);
    }

    results = results.slice(0, Number(limit));

    return {
      data: results.map(org => ({
        orgNumber: org.organisasjonsnummer,
        name: org.navn,
        type: org.organisasjonsform.beskrivelse,
        typeCode: org.organisasjonsform.kode,
        address: org.forretningsadresse,
        industry: org.naeringskode1?.beskrivelse,
      })),
      meta: {
        total: results.length,
        source: 'brreg.no',
      },
    };
  }

  /**
   * GET /api/brreg/org/:orgNumber - Get organization details by org number
   */
  @Get('/org/:orgNumber')
  async getOrganization(request: TenantRequest, reply: FastifyReply) {
    const { orgNumber } = request.params as any;

    const org = mockBrregOrgs.find(o => o.organisasjonsnummer === orgNumber);

    if (!org) {
      reply.code(404);
      return {
        type: 'https://api.digilist.no/errors/not-found',
        title: 'Organization Not Found',
        status: 404,
        detail: `No organization found with number ${orgNumber}`,
      };
    }

    return {
      data: {
        orgNumber: org.organisasjonsnummer,
        name: org.navn,
        type: org.organisasjonsform.beskrivelse,
        typeCode: org.organisasjonsform.kode,
        registeredDate: org.registreringsdatoEnhetsregisteret,
        vatRegistered: org.registrertIMvaregisteret,
        industry: org.naeringskode1,
        employees: org.antallAnsatte,
        address: org.forretningsadresse,
        website: (org as any).hjemmeside || null,
      },
      meta: {
        source: 'brreg.no',
        fetchedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * GET /api/brreg/org/:orgNumber/roles - Get organization roles/persons
   */
  @Get('/org/:orgNumber/roles')
  async getOrganizationRoles(request: TenantRequest, reply: FastifyReply) {
    const { orgNumber } = request.params as any;

    const org = mockBrregOrgs.find(o => o.organisasjonsnummer === orgNumber);

    if (!org) {
      reply.code(404);
      return {
        type: 'https://api.digilist.no/errors/not-found',
        title: 'Organization Not Found', 
        status: 404,
      };
    }

    // Mock roles data
    return {
      data: {
        orgNumber,
        roles: [
          {
            type: 'LEDER',
            title: 'Styreleder',
            person: { name: 'Ola Nordmann', birthDate: '1970' },
          },
          {
            type: 'NEST',
            title: 'Nestleder',
            person: { name: 'Kari Hansen', birthDate: '1985' },
          },
          {
            type: 'MEDL',
            title: 'Styremedlem',
            person: { name: 'Per Olsen', birthDate: '1990' },
          },
        ],
      },
    };
  }

  /**
   * GET /api/brreg/validate/:orgNumber - Validate an org number
   */
  @Get('/validate/:orgNumber')
  async validateOrgNumber(request: TenantRequest, reply: FastifyReply) {
    const { orgNumber } = request.params as any;

    // Norwegian org numbers are 9 digits with mod11 checksum
    const isValidFormat = /^\d{9}$/.test(orgNumber);

    const org = mockBrregOrgs.find(o => o.organisasjonsnummer === orgNumber);

    return {
      data: {
        orgNumber,
        isValidFormat,
        exists: !!org,
        name: org?.navn || null,
        canBeUsedForMembership: org?.organisasjonsform.kode === 'FLI' || org?.organisasjonsform.kode === 'STI',
      },
    };
  }
}

/**
 * Controller for creating organizations from Brreg data
 */
@Controller('/api/organizations')
export class OrganizationFromBrregController {

  /**
   * POST /api/organizations/from-brreg - Create organization from Brreg data
   * Used for MinSide membership organizations
   */
  @Post('/from-brreg')
  async createFromBrreg(request: TenantRequest, reply: FastifyReply) {
    const { orgNumber } = request.body as { orgNumber: string };
    const tenantId = request.tenantId || (request as any).user?.tenantId;

    if (!orgNumber) {
      reply.code(400);
      return {
        type: 'https://api.digilist.no/errors/validation-error',
        title: 'Validation Error',
        status: 400,
        detail: 'orgNumber is required',
      };
    }

    const brregOrg = mockBrregOrgs.find(o => o.organisasjonsnummer === orgNumber);

    if (!brregOrg) {
      reply.code(404);
      return {
        type: 'https://api.digilist.no/errors/not-found',
        title: 'Organization Not Found',
        status: 404,
        detail: `Organization ${orgNumber} not found in Brreg`,
      };
    }

    // Create organization from Brreg data
    const newOrg = {
      id: `org-${Date.now()}`,
      tenantId,
      type: 'membership', // MinSide org type
      name: brregOrg.navn,
      orgNumber: brregOrg.organisasjonsnummer,
      orgType: brregOrg.organisasjonsform.kode,
      address: {
        street: brregOrg.forretningsadresse.adresse?.[0],
        postalCode: brregOrg.forretningsadresse.postnummer,
        city: brregOrg.forretningsadresse.poststed,
        municipality: brregOrg.forretningsadresse.kommune,
        municipalityNumber: brregOrg.forretningsadresse.kommunenummer,
      },
      industry: brregOrg.naeringskode1?.beskrivelse,
      website: (brregOrg as any).hjemmeside || null,
      verified: true,
      verifiedAt: new Date().toISOString(),
      verificationSource: 'brreg',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    reply.code(201);
    return { data: newOrg };
  }
}
