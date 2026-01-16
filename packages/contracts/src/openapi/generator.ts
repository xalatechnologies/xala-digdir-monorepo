/**
 * OpenAPI Generator
 *
 * Generates OpenAPI 3.1 specification from Zod schemas.
 * Run with: pnpm openapi:generate
 */
import { extendZodWithOpenApi, generateSchema } from '@anatine/zod-openapi';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

// Extend Zod with OpenAPI support
extendZodWithOpenApi(z);

// Import all schemas
import {
  RentalObjectSchema,
  CreateRentalObjectSchema,
  UpdateRentalObjectSchema,
  RentalObjectQuerySchema,
  PricingSchema,
  LocationSchema,
} from '../schemas/rental-object.schema';

import {
  BookingSchema,
  CreateBookingSchema,
  UpdateBookingSchema,
  BookingQuerySchema,
  BookingQuoteRequestSchema,
  BookingQuoteResponseSchema,
} from '../schemas/booking.schema';

import {
  OrganizationSchema,
  CreateOrganizationSchema,
  UpdateOrganizationSchema,
  OrganizationQuerySchema,
} from '../schemas/organization.schema';

import {
  UserSchema,
  CreateUserSchema,
  UpdateUserSchema,
  UserQuerySchema,
} from '../schemas/user.schema';

import {
  CapabilitiesResponseSchema,
} from '../schemas/capabilities.schema';

import {
  ProblemDetailsSchema,
  PaginatedResponseMetaSchema,
} from '../schemas/common.schema';

// Generate OpenAPI spec
function generateOpenAPISpec() {
  const spec = {
    openapi: '3.1.0',
    info: {
      title: 'Digilist API',
      description: 'API for the Digilist municipal booking platform',
      version: '1.0.0',
      contact: {
        name: 'Xala Technologies',
        email: 'api@xalatechnologies.com',
      },
    },
    servers: [
      { url: 'https://api.digilist.no', description: 'Production' },
      { url: 'http://localhost:4000', description: 'Development' },
    ],
    tags: [
      { name: 'Rental Objects', description: 'Rental object management' },
      { name: 'Bookings', description: 'Booking management' },
      { name: 'Organizations', description: 'Organization management' },
      { name: 'Users', description: 'User management' },
      { name: 'Capabilities', description: 'User capabilities' },
    ],
    paths: {
      // Rental Objects
      '/api/rental-objects': {
        get: {
          tags: ['Rental Objects'],
          summary: 'List rental objects',
          operationId: 'listRentalObjects',
          parameters: schemaToParameters(RentalObjectQuerySchema),
          responses: {
            200: {
              description: 'List of rental objects',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { type: 'array', items: { $ref: '#/components/schemas/RentalObject' } },
                      meta: { $ref: '#/components/schemas/PaginatedResponseMeta' },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Rental Objects'],
          summary: 'Create rental object',
          operationId: 'createRentalObject',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateRentalObject' },
              },
            },
          },
          responses: {
            201: {
              description: 'Created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { data: { $ref: '#/components/schemas/RentalObject' } },
                  },
                },
              },
            },
            400: { $ref: '#/components/responses/BadRequest' },
          },
        },
      },
      '/api/rental-objects/{id}': {
        get: {
          tags: ['Rental Objects'],
          summary: 'Get rental object by ID',
          operationId: 'getRentalObject',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: {
              description: 'Rental object details',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { data: { $ref: '#/components/schemas/RentalObject' } },
                  },
                },
              },
            },
            404: { $ref: '#/components/responses/NotFound' },
          },
        },
        patch: {
          tags: ['Rental Objects'],
          summary: 'Update rental object',
          operationId: 'updateRentalObject',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateRentalObject' },
              },
            },
          },
          responses: {
            200: {
              description: 'Updated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { data: { $ref: '#/components/schemas/RentalObject' } },
                  },
                },
              },
            },
          },
        },
      },

      // Bookings
      '/api/bookings': {
        get: {
          tags: ['Bookings'],
          summary: 'List bookings',
          operationId: 'listBookings',
          parameters: schemaToParameters(BookingQuerySchema),
          responses: {
            200: {
              description: 'List of bookings',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { type: 'array', items: { $ref: '#/components/schemas/Booking' } },
                      meta: { $ref: '#/components/schemas/PaginatedResponseMeta' },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Bookings'],
          summary: 'Create booking',
          operationId: 'createBooking',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateBooking' },
              },
            },
          },
          responses: {
            201: {
              description: 'Created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { data: { $ref: '#/components/schemas/Booking' } },
                  },
                },
              },
            },
          },
        },
      },

      // Capabilities
      '/api/web/me/capabilities': {
        get: {
          tags: ['Capabilities'],
          summary: 'Get web app capabilities',
          operationId: 'getWebCapabilities',
          responses: {
            200: {
              description: 'User capabilities',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { data: { $ref: '#/components/schemas/CapabilitiesResponse' } },
                  },
                },
              },
            },
          },
        },
      },
      '/api/backoffice/me/capabilities': {
        get: {
          tags: ['Capabilities'],
          summary: 'Get backoffice capabilities',
          operationId: 'getBackofficeCapabilities',
          responses: {
            200: {
              description: 'User capabilities',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { data: { $ref: '#/components/schemas/CapabilitiesResponse' } },
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        // Entities
        RentalObject: generateSchema(RentalObjectSchema),
        CreateRentalObject: generateSchema(CreateRentalObjectSchema),
        UpdateRentalObject: generateSchema(UpdateRentalObjectSchema),
        Pricing: generateSchema(PricingSchema),
        Location: generateSchema(LocationSchema),

        Booking: generateSchema(BookingSchema),
        CreateBooking: generateSchema(CreateBookingSchema),
        UpdateBooking: generateSchema(UpdateBookingSchema),
        BookingQuoteRequest: generateSchema(BookingQuoteRequestSchema),
        BookingQuoteResponse: generateSchema(BookingQuoteResponseSchema),

        Organization: generateSchema(OrganizationSchema),
        CreateOrganization: generateSchema(CreateOrganizationSchema),
        UpdateOrganization: generateSchema(UpdateOrganizationSchema),

        User: generateSchema(UserSchema),
        CreateUser: generateSchema(CreateUserSchema),
        UpdateUser: generateSchema(UpdateUserSchema),

        CapabilitiesResponse: generateSchema(CapabilitiesResponseSchema),

        // Common
        PaginatedResponseMeta: generateSchema(PaginatedResponseMetaSchema),
        ProblemDetails: generateSchema(ProblemDetailsSchema),
      },
      responses: {
        BadRequest: {
          description: 'Bad Request',
          content: {
            'application/problem+json': {
              schema: { $ref: '#/components/schemas/ProblemDetails' },
            },
          },
        },
        NotFound: {
          description: 'Not Found',
          content: {
            'application/problem+json': {
              schema: { $ref: '#/components/schemas/ProblemDetails' },
            },
          },
        },
        Unauthorized: {
          description: 'Unauthorized',
          content: {
            'application/problem+json': {
              schema: { $ref: '#/components/schemas/ProblemDetails' },
            },
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  };

  return spec;
}

/**
 * Convert Zod schema to OpenAPI query parameters
 */
function schemaToParameters(schema: z.ZodObject<z.ZodRawShape>): Array<{
  name: string;
  in: string;
  required: boolean;
  schema: { type: string };
}> {
  const shape = schema.shape;
  return Object.entries(shape).map(([name, fieldSchema]) => {
    const isOptional = fieldSchema.isOptional?.() ?? true;
    let type = 'string';

    // Infer type from schema
    if (fieldSchema instanceof z.ZodNumber) {
      type = 'integer';
    } else if (fieldSchema instanceof z.ZodBoolean) {
      type = 'boolean';
    }

    return {
      name,
      in: 'query',
      required: !isOptional,
      schema: { type },
    };
  });
}

// Main
async function main() {
  const spec = generateOpenAPISpec();
  const outputPath = path.join(__dirname, '../../openapi.yaml');

  // Convert to YAML
  const yaml = JSON.stringify(spec, null, 2);
  fs.writeFileSync(outputPath, yaml, 'utf-8');

  console.log(`✅ OpenAPI spec generated: ${outputPath}`);
}

main().catch(console.error);
