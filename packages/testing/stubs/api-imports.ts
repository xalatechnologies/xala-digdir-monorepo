/**
 * Stub exports for API imports that tests depend on
 * These are minimal stubs to allow tests to compile
 */

// Projection stubs
export const RentalObjectProjection = {
  id: 'stub',
  title: 'Stub Rental Object',
};

// Schema stubs
export const CommonSchema = {
  id: { type: 'string' },
};

// Mapper stubs
export const RentalObjectMapper = {
  toDTO: (data: any) => data,
  fromDTO: (data: any) => data,
};

// Service stubs
export class CustodyService {
  async evaluate() {
    return { allowed: true };
  }
}

// Controller stubs
export class MetadataController {
  async getMetadata() {
    return { data: [] };
  }
}

// JWT Service stub
export class JwtService {
  async sign() {
    return 'stub-token';
  }
  async verify() {
    return { userId: 'stub-user' };
  }
}

// Export all as default for different import patterns
export default {
  RentalObjectProjection,
  CommonSchema,
  RentalObjectMapper,
  CustodyService,
  MetadataController,
  JwtService,
};
