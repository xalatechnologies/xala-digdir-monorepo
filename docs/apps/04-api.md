# API Application

The API application is the backend services layer of the Xala Diglist Platform, providing RESTful APIs, business logic, data persistence, and integration with external services.

## Overview

The API serves as the central hub for:
- **RESTful APIs** - HTTP endpoints for all platform operations
- **Business Logic** - Core domain services and workflows
- **Data Persistence** - PostgreSQL database with Prisma ORM
- **Authentication** - ID-porten integration and JWT management
- **External Integrations** - Vipps, email/SMS, Altinn, etc.
- **Real-time Features** - WebSocket support for live updates

## Architecture

### Technology Stack
- **Runtime**: Node.js 20+
- **Framework**: Fastify
- **Language**: TypeScript
- **Database**: PostgreSQL 14+
- **ORM**: Prisma
- **Authentication**: JWT + ID-porten
- **Validation**: Zod
- **Documentation**: OpenAPI 3.0
- **Real-time**: WebSocket

### Application Structure
```
apps/api/src/
├── main.ts                    # Server entry point
├── app.ts                     # Fastify app configuration
├── modules/                   # Domain modules
│   ├── auth/                  # Authentication
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── jwt.service.ts
│   │   └── idporten.strategy.ts
│   ├── users/                 # User management
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.repository.ts
│   │   └── dto/
│   ├── organizations/         # Organization management
│   ├── listings/              # Listing management
│   │   ├── listings.controller.ts
│   │   ├── listings.service.ts
│   │   ├── listings.repository.ts
│   │   └── dto/
│   ├── bookings/              # Booking system
│   │   ├── bookings.controller.ts
│   │   ├── bookings.service.ts
│   │   ├── bookings.repository.ts
│   │   └── dto/
│   ├── notifications/         # Notifications
│   ├── payments/              # Payment integration
│   └── audit/                 # Audit logging
├── common/                    # Shared code
│   ├── decorators/            # Custom decorators
│   ├── interceptors/          # Request/response interceptors
│   ├── pipes/                 # Data transformation
│   ├── guards/                # Route guards
│   ├── exceptions/            # Custom exceptions
│   └── utils/                 # Utilities
├── config/                    # Configuration
│   ├── database.ts
│   ├── auth.ts
│   ├── swagger.ts
│   └── index.ts
├── plugins/                   # Fastify plugins
│   ├── swagger.ts
│   ├── cors.ts
│   ├── rate-limit.ts
│   └── websocket.ts
└── tests/                     # Test files
```

## Core Features

### 1. Server Configuration
```typescript
// app.ts
import fastify from 'fastify';
import { config } from './config';
import { registerPlugins } from './plugins';
import { registerRoutes } from './routes';
import { errorHandler } from './common/error-handler';

export async function createApp() {
  const app = fastify({
    logger: {
      level: config.LOG_LEVEL,
      prettyPrint: config.NODE_ENV === 'development',
    },
    trustProxy: true,
  });

  // Register plugins
  await registerPlugins(app);
  
  // Register routes
  await registerRoutes(app);
  
  // Register error handler
  app.setErrorHandler(errorHandler);
  
  // Health check
  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
  }));

  return app;
}
```

### 2. Authentication Module
```typescript
// modules/auth/auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JWTService,
    private readonly userService: UserService,
    private readonly idportenService: IDportenService,
  ) {}

  async authenticate(code: string): Promise<AuthResult> {
    // Exchange code with ID-porten
    const idportenToken = await this.idportenService.exchangeCode(code);
    
    // Get user info from ID-porten
    const userInfo = await this.idportenService.getUserInfo(idportenToken);
    
    // Find or create user
    let user = await this.userService.findBySSN(userInfo.ssn);
    
    if (!user) {
      user = await this.userService.create({
        ssn: userInfo.ssn,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        email: userInfo.email,
        phone: userInfo.phone,
      });
    }
    
    // Update last login
    await this.userService.updateLastLogin(user.id);
    
    // Generate JWT tokens
    const tokens = await this.jwtService.generateTokens({
      sub: user.id,
      email: user.email,
      roles: user.roles,
    });
    
    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    const payload = await this.jwtService.verifyRefreshToken(refreshToken);
    
    // Check if token is revoked
    const isRevoked = await this.jwtService.isTokenRevoked(payload.jti);
    if (isRevoked) {
      throw new UnauthorizedException('Token revoked');
    }
    
    // Generate new tokens
    return this.jwtService.generateTokens({
      sub: payload.sub,
      email: payload.email,
      roles: payload.roles,
    });
  }

  private sanitizeUser(user: User): SafeUser {
    const { ssn, ...safeUser } = user;
    return safeUser;
  }
}
```

### 3. Listing Module
```typescript
// modules/listings/listings.service.ts
@Injectable()
export class ListingsService {
  constructor(
    private readonly listingsRepo: ListingsRepository,
    private readonly permissionService: PermissionService,
    private readonly auditService: AuditService,
  ) {}

  async create(
    data: CreateListingDTO,
    user: AuthenticatedUser,
  ): Promise<ListingProjectionDTO> {
    // Check permissions
    await this.permissionService.canCreateListing(user);
    
    // Create listing
    const listing = await this.listingsRepo.create({
      ...data,
      organizationId: user.organizationId,
      createdBy: user.id,
    });
    
    // Log audit
    await this.auditService.log({
      userId: user.id,
      action: 'listing.created',
      resource: { type: 'listing', id: listing.id },
      tenantId: user.organizationId,
    });
    
    // Return projection
    return this.toCardProjection(listing, user);
  }

  async findMany(
    filters: ListingFiltersDTO,
    user?: AuthenticatedUser,
  ): Promise<ListingCardProjectionDTO[]> {
    const listings = await this.listingsRepo.findMany(filters);
    
    return Promise.all(
      listings.map(listing => this.toCardProjection(listing, user))
    );
  }

  async findById(
    id: string,
    user?: AuthenticatedUser,
  ): Promise<ListingDetailsProjectionDTO> {
    const listing = await this.listingsRepo.findById(id);
    
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }
    
    // Check access permissions
    await this.permissionService.canViewListing(listing, user);
    
    return this.toDetailsProjection(listing, user);
  }

  async update(
    id: string,
    data: UpdateListingDTO,
    user: AuthenticatedUser,
  ): Promise<ListingDetailsProjectionDTO> {
    const listing = await this.listingsRepo.findById(id);
    
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }
    
    // Check permissions
    await this.permissionService.canUpdateListing(listing, user);
    
    // Update listing
    const updated = await this.listingsRepo.update(id, {
      ...data,
      updatedBy: user.id,
      updatedAt: new Date(),
    });
    
    // Log audit
    await this.auditService.log({
      userId: user.id,
      action: 'listing.updated',
      resource: { type: 'listing', id },
      changes: data,
      tenantId: user.organizationId,
    });
    
    return this.toDetailsProjection(updated, user);
  }

  private async toCardProjection(
    listing: Listing,
    user?: AuthenticatedUser,
  ): Promise<ListingCardProjectionDTO> {
    const permissions = await this.permissionService.getListingPermissions(
      listing,
      user
    );

    return {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      imageUrl: listing.images[0]?.url || '/placeholder.jpg',
      status: listing.status,
      organization: {
        id: listing.organization.id,
        name: listing.organization.name,
      },
      permissions,
    };
  }

  private async toDetailsProjection(
    listing: Listing,
    user?: AuthenticatedUser,
  ): Promise<ListingDetailsProjectionDTO> {
    const permissions = await this.permissionService.getListingPermissions(
      listing,
      user
    );

    return {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      fullDescription: listing.fullDescription,
      images: listing.images,
      location: listing.location,
      capacity: listing.capacity,
      amenities: listing.amenities,
      availability: listing.availability,
      pricing: listing.pricing,
      organization: listing.organization,
      permissions,
      audit: {
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt,
        createdBy: listing.createdBy,
        updatedBy: listing.updatedBy,
      },
    };
  }
}
```

### 4. Booking Module
```typescript
// modules/bookings/bookings.service.ts
@Injectable()
export class BookingsService {
  constructor(
    private readonly bookingsRepo: BookingsRepository,
    private readonly listingsRepo: ListingsRepository,
    private readonly conflictService: ConflictService,
    private readonly notificationService: NotificationService,
    private readonly paymentService: PaymentService,
  ) {}

  async create(
    data: CreateBookingDTO,
    user: AuthenticatedUser,
  ): Promise<BookingProjectionDTO> {
    // Check listing exists and is available
    const listing = await this.listingsRepo.findById(data.listingId);
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    // Check for conflicts
    await this.conflictService.checkConflict(
      data.listingId,
      data.startTime,
      data.endTime
    );

    // Calculate price
    const price = await this.calculatePrice(listing, data);

    // Create booking
    const booking = await this.bookingsRepo.create({
      ...data,
      userId: user.id,
      organizationId: user.organizationId,
      status: 'pending',
      price,
    });

    // Process payment if required
    if (price > 0) {
      const payment = await this.paymentService.processPayment({
        bookingId: booking.id,
        amount: price,
        userId: user.id,
      });
      
      booking.paymentId = payment.id;
      await this.bookingsRepo.update(booking.id, { paymentId: payment.id });
    }

    // Send confirmation
    await this.notificationService.sendBookingConfirmation(booking);

    return this.toProjection(booking);
  }

  async approve(
    id: string,
    user: AuthenticatedUser,
  ): Promise<BookingProjectionDTO> {
    const booking = await this.bookingsRepo.findById(id);
    
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Check permissions
    if (booking.organizationId !== user.organizationId) {
      throw new ForbiddenException('Cannot approve booking');
    }

    // Update status
    const updated = await this.bookingsRepo.update(id, {
      status: 'confirmed',
      approvedBy: user.id,
      approvedAt: new Date(),
    });

    // Send notification
    await this.notificationService.sendBookingApproved(updated);

    return this.toProjection(updated);
  }

  async cancel(
    id: string,
    reason?: string,
    user?: AuthenticatedUser,
  ): Promise<void> {
    const booking = await this.bookingsRepo.findById(id);
    
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Check permissions
    if (booking.userId !== user?.id && 
        booking.organizationId !== user?.organizationId) {
      throw new ForbiddenException('Cannot cancel booking');
    }

    // Check cancellation policy
    const canCancel = await this.canCancel(booking);
    if (!canCancel) {
      throw new BadRequestException('Cannot cancel booking');
    }

    // Update status
    await this.bookingsRepo.update(id, {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelledBy: user?.id,
      cancellationReason: reason,
    });

    // Process refund if applicable
    if (booking.price > 0) {
      await this.paymentService.processRefund(booking.paymentId);
    }

    // Send notification
    await this.notificationService.sendBookingCancelled(booking);
  }

  private async calculatePrice(
    listing: Listing,
    booking: CreateBookingDTO,
  ): Promise<number> {
    const duration = differenceInMinutes(
      new Date(booking.endTime),
      new Date(booking.startTime)
    );

    const hourlyRate = listing.pricing.hourlyRate || 0;
    return (duration / 60) * hourlyRate;
  }

  private async toProjection(booking: Booking): Promise<BookingProjectionDTO> {
    return {
      id: booking.id,
      listing: {
        id: booking.listing.id,
        title: booking.listing.title,
        location: booking.listing.location,
      },
      user: {
        id: booking.user.id,
        name: `${booking.user.firstName} ${booking.user.lastName}`,
        email: booking.user.email,
      },
      timeSlot: {
        start: booking.startTime,
        end: booking.endTime,
        duration: differenceInMinutes(
          new Date(booking.endTime),
          new Date(booking.startTime)
        ),
      },
      status: booking.status,
      price: booking.price,
      createdAt: booking.createdAt,
    };
  }
}
```

### 5. Real-time Updates
```typescript
// plugins/websocket.ts
import fastify from 'fastify';
import { FastifyInstance } from 'fastify';
import { createServer } from 'http';
import { Server } from 'socket.io';

export async function registerWebSocket(app: FastifyInstance) {
  const server = createServer(app.server);
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    // Authenticate WebSocket connection
    const token = socket.handshake.auth.token;
    try {
      const user = await verifyToken(token);
      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    
    // Join user's organization room
    socket.join(`org:${user.organizationId}`);
    
    // Join user's personal room
    socket.join(`user:${user.id}`);

    // Handle booking updates
    socket.on('booking:update', async (data) => {
      // Broadcast to organization
      socket.to(`org:${user.organizationId}`).emit('booking:updated', data);
    });

    // Handle notifications
    socket.on('notification:read', async (notificationId) => {
      await markNotificationAsRead(notificationId);
      socket.emit('notification:read', notificationId);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${user.id} disconnected`);
    });
  });

  // Expose io instance
  app.decorate('io', io);
}

// Usage in services
@Injectable()
export class NotificationService {
  constructor(@Inject('IO') private readonly io: Server) {}

  async sendRealTimeNotification(
    userId: string,
    notification: Notification,
  ): Promise<void> {
    this.io.to(`user:${userId}`).emit('notification', notification);
  }

  async broadcastToOrganization(
    organizationId: string,
    event: string,
    data: any,
  ): Promise<void> {
    this.io.to(`org:${organizationId}`).emit(event, data);
  }
}
```

## Database Schema

### Prisma Schema
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                String               @id @default(cuid())
  ssn               String               @unique
  firstName         String
  lastName          String
  email             String               @unique
  phone             String?
  avatar            String?
  organizationId    String
  organization      Organization         @relation(fields: [organizationId], references: [id])
  roles             Role[]
  bookings          Booking[]
  createdAt         DateTime             @default(now())
  updatedAt         DateTime             @updatedAt
  lastLoginAt       DateTime?
  
  @@map("users")
}

model Organization {
  id          String      @id @default(cuid())
  name        String
  domain      String      @unique
  settings    Json
  users       User[]
  listings    Listing[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  @@map("organizations")
}

model Listing {
  id                String      @id @default(cuid())
  title             String
  description       String
  fullDescription   String?
  location          Location
  capacity          Int
  amenities         String[]
  images            Image[]
  availability      Availability[]
  pricing           Pricing
  organizationId    String
  organization      Organization @relation(fields: [organizationId], references: [id])
  bookings          Booking[]
  status            Status      @default(AVAILABLE)
  createdBy         String
  updatedBy         String?
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  @@map("listings")
}

model Booking {
  id               String      @id @default(cuid())
  listingId        String
  listing          Listing    @relation(fields: [listingId], references: [id])
  userId           String
  user             User       @relation(fields: [userId], references: [id])
  organizationId   String
  startTime        DateTime
  endTime          DateTime
  purpose          String?
  status           BookingStatus @default(PENDING)
  price            Float?
  paymentId        String?
  approvedBy        String?
  approvedAt       DateTime?
  cancelledBy      String?
  cancelledAt      DateTime?
  cancellationReason String?
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  @@map("bookings")
}

model AuditLog {
  id          String   @id @default(cuid())
  userId      String
  action      String
  resource    Json
  metadata    Json
  tenantId    String
  timestamp   DateTime @default(now())
  
  @@map("audit_logs")
}

type Status      @db.Text
type BookingStatus @db.Text
type Role        @db.Text

enum Status {
  AVAILABLE
  UNAVAILABLE
  MAINTENANCE
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
  NO_SHOW
}

enum Role {
  USER
  ORG_ADMIN
  LISTING_MANAGER
  BOOKING_MANAGER
  ADMIN
}
```

## API Documentation

### OpenAPI Configuration
```typescript
// plugins/swagger.ts
import swagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

export async function registerSwagger(app: FastifyInstance) {
  await app.register(swagger, {
    swagger: {
      info: {
        title: 'Xala Diglist API',
        description: 'API for the Xala Diglist Platform',
        version: '1.0.0',
        contact: {
          name: 'API Support',
          email: 'api@diglist.no',
        },
      },
      host: 'api.diglist.no',
      schemes: ['https'],
      consumes: ['application/json'],
      produces: ['application/json'],
      securityDefinitions: {
        Bearer: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
        },
      },
    },
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });
}
```

### Controller Example
```typescript
// modules/listings/listings.controller.ts
@Controller('/listings')
@ApiTags('listings')
@UseGuards(JwtAuthGuard)
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get listings' })
  @ApiResponse({
    status: 200,
    description: 'List of listings',
    type: [ListingCardProjectionDTO],
  })
  async findMany(
    @Query() filters: ListingFiltersDTO,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ListingCardProjectionDTO[]> {
    return this.listingsService.findMany(filters, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get listing by ID' })
  @ApiResponse({
    status: 200,
    description: 'Listing details',
    type: ListingDetailsProjectionDTO,
  })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ListingDetailsProjectionDTO> {
    return this.listingsService.findById(id, user);
  }

  @Post()
  @ApiOperation({ summary: 'Create listing' })
  @ApiResponse({
    status: 201,
    description: 'Listing created',
    type: ListingDetailsProjectionDTO,
  })
  @UseGuards(PermissionsGuard)
  @RequirePermissions('listing:create')
  async create(
    @Body() createDto: CreateListingDTO,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ListingDetailsProjectionDTO> {
    return this.listingsService.create(createDto, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update listing' })
  @ApiResponse({
    status: 200,
    description: 'Listing updated',
    type: ListingDetailsProjectionDTO,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateListingDTO,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ListingDetailsProjectionDTO> {
    return this.listingsService.update(id, updateDto, user);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete listing' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    return this.listingsService.delete(id, user);
  }
}
```

## Testing

### Unit Testing
```typescript
// modules/listings/__tests__/listings.service.spec.ts
describe('ListingsService', () => {
  let service: ListingsService;
  let repository: jest.Mocked<ListingsRepository>;
  let permissionService: jest.Mocked<PermissionService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ListingsService,
        {
          provide: ListingsRepository,
          useValue: mockRepository,
        },
        {
          provide: PermissionService,
          useValue: mockPermissionService,
        },
      ],
    }).compile();

    service = module.get<ListingsService>(ListingsService);
    repository = module.get(ListingsRepository);
    permissionService = module.get(PermissionService);
  });

  describe('create', () => {
    it('should create listing with valid data', async () => {
      const user = createMockUser();
      const createDto = createMockCreateListingDTO();
      const expectedListing = createMockListing();

      repository.create.mockResolvedValue(expectedListing);
      permissionService.canCreateListing.mockResolvedValue();

      const result = await service.create(createDto, user);

      expect(result).toMatchObject({
        id: expectedListing.id,
        title: expectedListing.title,
      });
      expect(permissionService.canCreateListing).toHaveBeenCalledWith(user);
      expect(repository.create).toHaveBeenCalledWith({
        ...createDto,
        organizationId: user.organizationId,
        createdBy: user.id,
      });
    });

    it('should throw error if user lacks permission', async () => {
      const user = createMockUser();
      const createDto = createMockCreateListingDTO();

      permissionService.canCreateListing.mockRejectedValue(
        new ForbiddenException()
      );

      await expect(service.create(createDto, user)).rejects.toThrow(
        ForbiddenException
      );
    });
  });
});
```

### Integration Testing
```typescript
// __tests__/listings.integration.spec.ts
describe('Listings API (e2e)', () => {
  let app: FastifyInstance;
  let prisma: PrismaClient;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  describe('POST /listings', () => {
    it('should create listing', async () => {
      const user = await createTestUser(prisma);
      const token = await generateTestToken(user);
      
      const response = await app.inject({
        method: 'POST',
        url: '/listings',
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          title: 'Test Listing',
          description: 'Test Description',
          location: {
            address: 'Test Address',
            city: 'Oslo',
            country: 'Norway',
          },
          capacity: 10,
        },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body).toMatchObject({
        title: 'Test Listing',
        description: 'Test Description',
      });
    });
  });
});
```

## Performance Optimizations

### Database Optimization
```typescript
// Repository with optimized queries
export class ListingsRepository {
  async findManyOptimized(filters: ListingFilters): Promise<Listing[]> {
    return this.prisma.listing.findMany({
      where: this.buildWhereClause(filters),
      include: {
        organization: {
          select: { id: true, name: true },
        },
        images: {
          take: 1,
          select: { url: true },
        },
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      // Use cursor-based pagination for large datasets
      cursor: filters.cursor ? { id: filters.cursor } : undefined,
      take: filters.limit || 20,
    });
  }
}
```

### Caching Strategy
```typescript
// plugins/cache.ts
import fastifyRedis from '@fastify/redis';
import fastifyCaching from '@fastify/caching';

export async function registerCache(app: FastifyInstance) {
  await app.register(fastifyRedis, {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
  });

  await app.register(fastifyCaching, {
    ttl: 5 * 60 * 1000, // 5 minutes
    storage: () => app.redis,
  });
}

// Usage in controllers
@Get()
@Cache({ ttl: 60000 }) // 1 minute
async findMany(): Promise<Listing[]> {
  return this.listingsService.findMany();
}
```

## Security

### Rate Limiting
```typescript
// plugins/rate-limit.ts
import rateLimit from '@fastify/rate-limit';

export async function registerRateLimit(app: FastifyInstance) {
  await app.register(rateLimit, {
    max: 100, // 100 requests per window
    timeWindow: '1 minute',
    keyGenerator: (req) => req.user?.id || req.ip,
    errorResponseBuilder: (req, context) => ({
      error: 'Too many requests',
      retryAfter: context.ttl,
    }),
  });
}
```

### Input Validation
```typescript
// dto/create-listing.dto.ts
import { z } from 'zod';

export const createListingSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  location: z.object({
    address: z.string().min(1),
    city: z.string().min(1),
    postalCode: z.string().regex(/^\d{4}$/),
    country: z.string().min(1),
  }),
  capacity: z.number().min(1).max(1000),
  amenities: z.array(z.string()).optional(),
  pricing: z.object({
    hourlyRate: z.number().min(0),
    dailyRate: z.number().min(0).optional(),
  }).optional(),
});

export type CreateListingDTO = z.infer<typeof createListingSchema>;
```

## Deployment

### Docker Configuration
```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM node:20-alpine AS runtime
RUN addgroup -g 1001 -S nodejs
RUN adduser -S diglist -u 1001

WORKDIR /app
COPY --from=builder --chown=diglist:nodejs /app/dist ./dist
COPY --from=builder --chown=diglist:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=diglist:nodejs /app/package.json ./package.json

USER diglist

EXPOSE 3002

ENV NODE_ENV=production

CMD ["node", "dist/main.js"]
```

### Environment Configuration
```typescript
// config/index.ts
export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3002'),
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  IDPORTEN_CLIENT_ID: process.env.IDPORTEN_CLIENT_ID,
  IDPORTEN_CLIENT_SECRET: process.env.IDPORTEN_CLIENT_SECRET,
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};
```

## Best Practices

### 1. Code Organization
- Use dependency injection
- Separate concerns (controllers, services, repositories)
- Implement proper error handling
- Use TypeScript strictly

### 2. Database
- Use transactions for complex operations
- Implement proper indexing
- Use connection pooling
- Optimize queries

### 3. Security
- Validate all inputs
- Implement rate limiting
- Use HTTPS everywhere
- Log security events

### 4. Performance
- Implement caching
- Use pagination
- Optimize database queries
- Monitor performance metrics

## Related Documentation

- [Client SDK](../packages/01-client-sdk.md)
- [Application Architecture](../architecture/03-applications.md)
- [Security Architecture](../architecture/05-security.md)
- [Contract-First Guide](../guides/01-contract-first.md)
