/**
 * GraphQL Schema and Context
 * Code-first GraphQL schema generation
 */

/**
 * GraphQL Context interface
 */
export interface GraphQLContext {
  tenantId: string;
  userId?: string;
  adapters: any;
}

/**
 * Create GraphQL context from request
 */
export function createGraphQLContext(request: any): GraphQLContext {
  return {
    tenantId: request.tenantId || 'default',
    userId: request.userId,
    adapters: request.adapters,
  };
}

/**
 * GraphQL Schema (SDL)
 * Note: In production, use code-first approach with Pothos or TypeGraphQL
 */
export const typeDefs = `
  scalar DateTime
  scalar JSON

  type Query {
    # Tenant queries
    tenant(id: ID!): Tenant
    tenants(status: String, page: Int, limit: Int): TenantConnection!
    
    # Listing queries
    listing(id: ID!): Listing
    listings(tenantId: ID!, status: String, type: String, page: Int, limit: Int): ListingConnection!
    
    # Booking queries
    booking(id: ID!): Booking
    bookings(tenantId: ID!, status: String, listingId: ID, page: Int, limit: Int): BookingConnection!
    calendar(tenantId: ID!, listingId: ID): [CalendarEvent!]!
  }

  type Mutation {
    # Tenant mutations
    createTenant(input: CreateTenantInput!): TenantPayload!
    updateTenant(id: ID!, input: UpdateTenantInput!): TenantPayload!
    deleteTenant(id: ID!): DeletePayload!
    
    # Listing mutations
    createListing(tenantId: ID!, input: CreateListingInput!): ListingPayload!
    updateListing(id: ID!, input: UpdateListingInput!): ListingPayload!
    publishListing(id: ID!): ListingPayload!
    archiveListing(id: ID!): ListingPayload!
    deleteListing(id: ID!): DeletePayload!
    
    # Booking mutations
    createBooking(tenantId: ID!, input: CreateBookingInput!): BookingPayload!
    confirmBooking(id: ID!): BookingPayload!
    cancelBooking(id: ID!, reason: String): BookingPayload!
    completeBooking(id: ID!): BookingPayload!
  }

  # Tenant types
  type Tenant {
    id: ID!
    name: String!
    slug: String!
    domain: String
    status: String!
    settings: JSON
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type TenantConnection {
    data: [Tenant!]!
    pagination: Pagination!
  }

  input CreateTenantInput {
    name: String!
    slug: String!
    domain: String
    ownerEmail: String!
    ownerName: String!
    plan: String
  }

  input UpdateTenantInput {
    name: String
    domain: String
    status: String
  }

  type TenantPayload {
    tenant: Tenant
    userId: String
  }

  # Listing types
  type Listing {
    id: ID!
    tenantId: ID!
    name: String!
    slug: String!
    type: String!
    status: String!
    description: String
    images: [String!]!
    pricing: JSON
    capacity: Int
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ListingConnection {
    data: [Listing!]!
    pagination: Pagination!
  }

  input CreateListingInput {
    name: String!
    slug: String
    type: String
    description: String
    images: [String!]
    pricing: JSON
    capacity: Int
  }

  input UpdateListingInput {
    name: String
    type: String
    description: String
    images: [String!]
    pricing: JSON
    capacity: Int
  }

  type ListingPayload {
    listing: Listing
  }

  # Booking types
  type Booking {
    id: ID!
    tenantId: ID!
    listingId: ID!
    userId: ID!
    status: String!
    startTime: DateTime!
    endTime: DateTime!
    totalPrice: Float!
    currency: String!
    notes: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type BookingConnection {
    data: [Booking!]!
    pagination: Pagination!
  }

  input CreateBookingInput {
    listingId: ID!
    userId: ID
    startTime: DateTime!
    endTime: DateTime!
    totalPrice: Float
    notes: String
  }

  type BookingPayload {
    booking: Booking
  }

  type CalendarEvent {
    id: ID!
    listingId: ID!
    start: DateTime!
    end: DateTime!
    status: String!
  }

  # Common types
  type Pagination {
    page: Int!
    limit: Int!
    total: Int!
    totalPages: Int!
    hasNext: Boolean!
    hasPrev: Boolean!
  }

  type DeletePayload {
    success: Boolean!
  }
`;

/**
 * Create GraphQL resolvers from services
 */
export function createResolvers(container: any) {
  return {
    Query: {
      // Tenant queries
      tenant: async (_: any, { id }: { id: string }, ctx: GraphQLContext) => {
        const service = container.resolve('TenantService');
        return service.findById(id);
      },
      tenants: async (_: any, args: any, ctx: GraphQLContext) => {
        const service = container.resolve('TenantService');
        return service.findAll(args);
      },

      // Listing queries
      listing: async (_: any, { id }: { id: string }, ctx: GraphQLContext) => {
        const service = container.resolve('ListingService');
        return service.findById(id);
      },
      listings: async (_: any, { tenantId, ...args }: any, ctx: GraphQLContext) => {
        const service = container.resolve('ListingService');
        return service.findAll(tenantId || ctx.tenantId, args);
      },

      // Booking queries
      booking: async (_: any, { id }: { id: string }, ctx: GraphQLContext) => {
        const service = container.resolve('BookingService');
        return service.findById(id);
      },
      bookings: async (_: any, { tenantId, ...args }: any, ctx: GraphQLContext) => {
        const service = container.resolve('BookingService');
        return service.findAll(tenantId || ctx.tenantId, args);
      },
      calendar: async (_: any, { tenantId, listingId }: any, ctx: GraphQLContext) => {
        const service = container.resolve('BookingService');
        return service.getCalendarEvents(tenantId || ctx.tenantId, listingId);
      },
    },

    Mutation: {
      // Tenant mutations
      createTenant: async (_: any, { input }: any, ctx: GraphQLContext) => {
        const service = container.resolve('TenantService');
        return service.create(input);
      },
      updateTenant: async (_: any, { id, input }: any, ctx: GraphQLContext) => {
        const service = container.resolve('TenantService');
        const tenant = await service.update(id, input);
        return { tenant };
      },
      deleteTenant: async (_: any, { id }: { id: string }, ctx: GraphQLContext) => {
        const service = container.resolve('TenantService');
        await service.delete(id);
        return { success: true };
      },

      // Listing mutations
      createListing: async (_: any, { tenantId, input }: any, ctx: GraphQLContext) => {
        const service = container.resolve('ListingService');
        const listing = await service.create(tenantId || ctx.tenantId, input);
        return { listing };
      },
      updateListing: async (_: any, { id, input }: any, ctx: GraphQLContext) => {
        const service = container.resolve('ListingService');
        const listing = await service.update(id, input);
        return { listing };
      },
      publishListing: async (_: any, { id }: { id: string }, ctx: GraphQLContext) => {
        const service = container.resolve('ListingService');
        const listing = await service.publish(id);
        return { listing };
      },
      archiveListing: async (_: any, { id }: { id: string }, ctx: GraphQLContext) => {
        const service = container.resolve('ListingService');
        const listing = await service.archive(id);
        return { listing };
      },
      deleteListing: async (_: any, { id }: { id: string }, ctx: GraphQLContext) => {
        const service = container.resolve('ListingService');
        await service.delete(id);
        return { success: true };
      },

      // Booking mutations
      createBooking: async (_: any, { tenantId, input }: any, ctx: GraphQLContext) => {
        const service = container.resolve('BookingService');
        const booking = await service.create(tenantId || ctx.tenantId, ctx.userId || 'anonymous', input);
        return { booking };
      },
      confirmBooking: async (_: any, { id }: { id: string }, ctx: GraphQLContext) => {
        const service = container.resolve('BookingService');
        const booking = await service.confirm(id);
        return { booking };
      },
      cancelBooking: async (_: any, { id, reason }: any, ctx: GraphQLContext) => {
        const service = container.resolve('BookingService');
        const booking = await service.cancel(id, { reason });
        return { booking };
      },
      completeBooking: async (_: any, { id }: { id: string }, ctx: GraphQLContext) => {
        const service = container.resolve('BookingService');
        const booking = await service.complete(id);
        return { booking };
      },
    },

    // Custom scalar resolvers
    DateTime: {
      serialize: (value: Date) => value.toISOString(),
      parseValue: (value: string) => new Date(value),
    },
    JSON: {
      serialize: (value: any) => value,
      parseValue: (value: any) => value,
    },
  };
}
