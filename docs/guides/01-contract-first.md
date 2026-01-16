# Contract-First Development Guide

Contract-first development is the core philosophy of the Xala Diglist Platform. This guide explains the principles, implementation, and benefits of our contract-first approach.

## Philosophy

### What is Contract-First Development?

Contract-first development means:
1. **API defines the contract** - Backend defines data structures and endpoints
2. **Frontend consumes contracts** - No transformation or mapping in frontend
3. **Shared understanding** - Single source of truth for data shapes
4. **Type safety** - End-to-end TypeScript integration

### Why Contract-First?

1. **Eliminates duplication** - No need to maintain separate frontend models
2. **Reduces bugs** - Single source of truth prevents mismatches
3. **Improves performance** - No transformation overhead
4. **Simplifies maintenance** - Changes happen in one place
5. **Enables automation** - Code generation from contracts

## Core Principles

### 1. No Transformers Rule
```typescript
// ❌ NEVER DO THIS - Don't create transformers
function toListingCard(listing: ListingDTO): ListingCardModel {
  return {
    id: listing.id,
    title: listing.title,
    subtitle: listing.description, // Renaming
    isAvailable: listing.status === 'available', // Computing
    canBook: listing.permissions.book, // Restructuring
  };
}

// ❌ NEVER DO THIS - Don't use view models
interface ListingCardModel {
  id: string;
  title: string;
  subtitle: string;
  isAvailable: boolean;
  canBook: boolean;
}
```

### 2. Direct Consumption
```typescript
// ✅ DO THIS - Use projection DTOs directly
function ListingCard({ listing }: { listing: ListingCardProjectionDTO }) {
  return (
    <Card>
      <Card.Title>{listing.title}</Card.Title>
      <Card.Subtitle>{listing.description}</Card.Subtitle>
      {listing.status === 'available' && <Badge>Available</Badge>}
      {listing.permissions.canBook && <BookButton />}
    </Card>
  );
}
```

### 3. Projection DTOs
Projection DTOs are tailored views of data for specific UI contexts:

```typescript
// API defines multiple projections for different needs
interface ListingCardProjectionDTO {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  status: ListingStatus;
  permissions: {
    canView: boolean;
    canBook: boolean;
    canEdit: boolean;
  };
}

interface ListingDetailsProjectionDTO {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  images: ImageDTO[];
  location: LocationDTO;
  availability: AvailabilityDTO;
  permissions: PermissionDTO;
  audit: AuditDTO;
}
```

## Implementation

### Backend: Define Contracts

#### 1. Create Projection DTOs
```typescript
// apps/api/src/modules/listing/dto/listing-projection.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsArray } from 'class-validator';

export class ListingCardProjectionDTO {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  imageUrl: string;

  @ApiProperty({ enum: ListingStatus })
  @IsEnum(ListingStatus)
  status: ListingStatus;

  @ApiProperty()
  permissions: {
    canView: boolean;
    canBook: boolean;
    canEdit: boolean;
  };
}
```

#### 2. Use in Controllers
```typescript
// apps/api/src/modules/listing/listing.controller.ts
@Controller('listings')
export class ListingController {
  @Get()
  @ApiOperation({ summary: 'Get listing cards' })
  public async findMany(
    @Query() filters: ListingFiltersDTO,
  ): Promise<ListingCardProjectionDTO[]> {
    return this.listingService.findManyCards(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get listing details' })
  public async getById(
    @Param('id') id: string,
  ): Promise<ListingDetailsProjectionDTO> {
    return this.listingService.findDetailsById(id);
  }
}
```

#### 3. Implement in Services
```typescript
// apps/api/src/modules/listing/listing.service.ts
@Injectable()
export class ListingService {
  async findManyCards(filters: ListingFiltersDTO): Promise<ListingCardProjectionDTO[]> {
    const listings = await this.repository.findWithFilters(filters);
    
    // Map to projection - THIS IS THE ONLY PLACE TRANSFORMATION HAPPENS
    return listings.map(listing => ({
      id: listing.id,
      title: listing.title,
      description: listing.description,
      imageUrl: listing.images[0]?.url || '/placeholder.jpg',
      status: listing.status,
      permissions: this.calculatePermissions(listing, currentUser),
    }));
  }
}
```

### Frontend: Consume Contracts

#### 1. Import Types from SDK
```typescript
// apps/web/src/features/listings/types.ts
import type { 
  ListingCardProjectionDTO,
  ListingDetailsProjectionDTO 
} from '@digilist/client-sdk';

// No additional types needed!
```

#### 2. Use in Components
```typescript
// apps/web/src/features/listings/components/ListingCard.tsx
import type { ListingCardProjectionDTO } from '@digilist/client-sdk';

interface ListingCardProps {
  listing: ListingCardProjectionDTO;
  onView: (id: string) => void;
}

export function ListingCard({ listing, onView }: ListingCardProps) {
  return (
    <Card onClick={() => onView(listing.id)}>
      <Card.Media>
        <img src={listing.imageUrl} alt={listing.title} />
      </Card.Media>
      <Card.Content>
        <Card.Title>{listing.title}</Card.Title>
        <Card.Text>{listing.description}</Card.Text>
        <StatusBadge status={listing.status} />
      </Card.Content>
      {listing.permissions.canBook && (
        <Card.Actions>
          <BookButton listingId={listing.id} />
        </Card.Actions>
      )}
    </Card>
  );
}
```

#### 3. Fetch with SDK
```typescript
// apps/web/src/features/listings/hooks/useListings.ts
import { useQuery } from '@tanstack/react-query';
import { sdk } from '@digilist/client-sdk';

export function useListings(filters?: ListingFilters) {
  return useQuery({
    queryKey: ['listings', filters],
    queryFn: () => sdk.listing.findMany(filters),
    select: (data) => {
      // ✅ OK to filter/sort, but NOT to transform shape
      return data.sort((a, b) => a.title.localeCompare(b.title));
    },
  });
}
```

## SDK Generation

### OpenAPI Specification
The SDK is automatically generated from the OpenAPI spec:

```yaml
# openapi.yaml
openapi: 3.0.0
info:
  title: Xala Diglist API
  version: 1.0.0
paths:
  /listings:
    get:
      operationId: findListings
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/ListingCardProjectionDTO'
components:
  schemas:
    ListingCardProjectionDTO:
      type: object
      properties:
        id:
          type: string
        title:
          type: string
        description:
          type: string
```

### Generated SDK Types
```typescript
// Generated by @digilist/client-sdk
export interface ListingCardProjectionDTO {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  status: ListingStatus;
  permissions: {
    canView: boolean;
    canBook: boolean;
    canEdit: boolean;
  };
}

export class ListingService {
  async findMany(filters?: ListingFilters): Promise<ListingCardProjectionDTO[]> {
    return this.client.get('/listings', { params: filters });
  }
}
```

## Best Practices

### 1. Design Projections for UI Needs
```typescript
// ✅ Good - Tailored for list view
interface ListingCardProjectionDTO {
  id: string;
  title: string;
  subtitle: string; // Already formatted for display
  imageUrl: string;
  status: ListingStatus;
  permissions: PermissionDTO;
}

// ✅ Good - Tailored for details view
interface ListingDetailsProjectionDTO {
  id: string;
  title: string;
  sections: {
    description: string;
    amenities: AmenityDTO[];
    location: LocationDTO;
    availability: AvailabilityDTO[];
  };
  actions: {
    canBook: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
}
```

### 2. Include Computed Values
```typescript
// ✅ Include computed values in projection
interface BookingProjectionDTO {
  id: string;
  listing: {
    id: string;
    title: string;
  };
  timeSlot: {
    start: string;
    end: string;
    duration: number; // Computed
    isPast: boolean; // Computed
  };
  status: BookingStatus;
  actions: {
    canCancel: boolean; // Based on business rules
    canModify: boolean; // Based on business rules
  };
}
```

### 3. Handle Permissions
```typescript
// ✅ Include permissions in projection
interface ResourceProjectionDTO {
  id: string;
  // ... other properties
  permissions: {
    canView: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    canExport: boolean;
    canShare: boolean;
  };
}
```

### 4. Version Contracts
```typescript
// API versioning in contracts
namespace V1 {
  export interface ListingDTO {
    id: string;
    title: string;
    // V1 properties
  }
}

namespace V2 {
  export interface ListingDTO extends V1.ListingDTO {
    description: string;
    images: ImageDTO[];
    // V2 additions
  }
}
```

## Testing

### Contract Tests
```typescript
// packages/client-sdk/src/__tests__/contract-parity.test.ts
describe('Contract Parity', () => {
  it('should have matching types between API and SDK', async () => {
    const apiSpec = await loadOpenAPISpec();
    const sdkTypes = extractSDKTypes();
    
    expect(sdkTypes).toMatchContract(apiSpec);
  });
  
  it('should validate response shapes', async () => {
    const response = await sdk.listing.getById('test-id');
    
    expect(response).toMatchSchema(ListingDetailsProjectionDTO);
  });
});
```

### Integration Tests
```typescript
// apps/web/src/__tests__/contract-integration.test.tsx
describe('Contract Integration', () => {
  it('should render with projection DTO', () => {
    const listing: ListingCardProjectionDTO = {
      id: '123',
      title: 'Test Listing',
      description: 'Test Description',
      imageUrl: '/test.jpg',
      status: 'available',
      permissions: { canView: true, canBook: true, canEdit: false },
    };
    
    render(<ListingCard listing={listing} />);
    
    expect(screen.getByText('Test Listing')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });
});
```

## Migration Guide

### From Traditional Approach
1. **Identify transformers** - Find all `toXxx`, `fromXxx`, `mapXxx` functions
2. **Create projections** - Define DTOs for each UI context
3. **Update API** - Return projections from endpoints
4. **Regenerate SDK** - Update client types
5. **Remove transformers** - Delete transformation code
6. **Update components** - Use DTOs directly

### Example Migration
```typescript
// BEFORE
interface ViewModel {
  displayName: string;
  isEditable: boolean;
}

function toViewModel(dto: DTO): ViewModel {
  return {
    displayName: `${dto.firstName} ${dto.lastName}`,
    isEditable: dto.permissions.includes('edit'),
  };
}

// AFTER
interface ProjectionDTO {
  displayName: string; // Computed on backend
  permissions: {
    canEdit: boolean;
  };
}

// No transformation needed!
```

## Benefits

### 1. Reduced Complexity
- Fewer files to maintain
- No synchronization issues
- Clear data flow

### 2. Better Performance
- No transformation overhead
- Smaller bundle sizes
- Faster execution

### 3. Improved Type Safety
- End-to-end type checking
- Compile-time error detection
- Better IDE support

### 4. Easier Maintenance
- Single source of truth
- Automated updates
- Clear contracts

## Common Pitfalls

### 1. Selective Usage
```typescript
// ❌ Don't pick and choose properties
const { id, title } = listing;
const model = { id, title, displayTitle: title.toUpperCase() };

// ✅ Use the entire projection
const model = listing; // Use as-is
```

### 2. Local Transformations
```typescript
// ❌ Don't transform in components
const formattedDate = new Date(booking.startTime).toLocaleDateString();

// ✅ Include formatted values in projection
interface BookingProjectionDTO {
  formattedDate: string; // Computed on backend
}
```

### 3. Bypassing SDK
```typescript
// ❌ Don't use fetch directly
const response = await fetch('/api/listings');
const data = await response.json();

// ✅ Always use SDK
const data = await sdk.listing.findMany();
```

## Tools & Automation

### 1. Lint Rules
```typescript
// eslint-config/rules/no-transformers.js
module.exports = {
  meta: {
    type: 'problem',
  },
  create(context) {
    return {
      FunctionDeclaration(node) {
        const name = node.id.name;
        if (/^(to|from|map|adapt)/.test(name)) {
          context.report({
            node,
            message: 'Transformer functions are not allowed',
          });
        }
      },
    };
  },
};
```

### 2. Type Generation
```bash
# Generate SDK from OpenAPI
pnpm generate:sdk

# Check contract compliance
pnpm test:contracts
```

### 3. Documentation Generation
```bash
# Generate contract docs
pnpm docs:contracts
```

## Related Documentation

- [Client SDK](../packages/01-client-sdk.md)
- [API Documentation](../apps/04-api.md)
- [Testing Strategy](../guides/02-testing.md)
- [Architecture Overview](../architecture/01-overview.md)
