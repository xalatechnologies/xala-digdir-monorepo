/**
 * Seed Data Management Service
 * Handles importing and managing seed data from JSON
 */

export interface SeedDataMeta {
  version: string;
  created: string;
  description: string;
  schema_version: string;
  total_objects: number;
}

export interface SeedTenant {
  id: string;
  slug: string;
  name: string;
  status: string;
}

export interface SeedOrganization {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  status: string;
}

export interface SeedUser {
  id: string;
  tenant_id: string;
  organization_id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  demo_token?: string;
}

export interface RentalObjectImage {
  url: string;
  alt: string;
  thumbnail: string;
  is_primary: boolean;
  sort_order: number;
}

export interface RentalObjectPricing {
  base_price: number;
  currency: string;
  unit: string;
  vat_rate: number;
  discounts: Array<{
    type: string;
    rate: number;
    description: string;
  }>;
}

export interface RentalObjectMetadata {
  address: {
    street: string;
    postal_code: string;
    city: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  amenities: string[];
  opening_hours: {
    [key: string]: Array<{ from: string; to: string }>;
  };
  rules: string[];
  contact: {
    email: string;
    phone: string;
  };
}

export interface SeedRentalObject {
  id: string;
  tenant_id: string;
  organization_id: string;
  name: string;
  slug: string;
  description: string;
  category_key: string;
  time_mode: string;
  features: string[];
  status: string;
  requires_approval: boolean;
  capacity: number;
  images: RentalObjectImage[];
  pricing: RentalObjectPricing;
  metadata: RentalObjectMetadata;
}

export interface SeedData {
  meta: SeedDataMeta;
  tenants: SeedTenant[];
  organizations: SeedOrganization[];
  users: SeedUser[];
  rental_objects: SeedRentalObject[];
}

export interface ImportProgress {
  stage: 'validating' | 'importing' | 'complete' | 'error';
  current: number;
  total: number;
  message: string;
}

export interface ImportResult {
  success: boolean;
  imported: {
    tenants: number;
    organizations: number;
    users: number;
    rental_objects: number;
  };
  errors: Array<{
    type: string;
    message: string;
    item?: any;
  }>;
}

/**
 * Validate seed data structure
 */
export function validateSeedData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.meta) errors.push('Missing meta information');
  if (!data.tenants || !Array.isArray(data.tenants)) errors.push('Missing or invalid tenants array');
  if (!data.organizations || !Array.isArray(data.organizations)) errors.push('Missing or invalid organizations array');
  if (!data.users || !Array.isArray(data.users)) errors.push('Missing or invalid users array');
  if (!data.rental_objects || !Array.isArray(data.rental_objects)) errors.push('Missing or invalid rental_objects array');

  // Validate rental objects structure
  if (data.rental_objects && Array.isArray(data.rental_objects)) {
  const t = useT();
    data.rental_objects.forEach((obj: any, index: number) => {
      if (!obj.id) errors.push(`Rental object ${index}: Missing ID`t('common.if_objname_errorspush')`Rental object ${index}: Missing name`t('common.if_objcategorykey_errorspush')`Rental object ${index}: Missing category_key`t('common.if_objimages_arrayisarrayobjimages_errorspush')`Rental object ${index}: Missing or invalid images`t('common.if_objpricing_errorspush')`Rental object ${index}: Missing pricing`t('common.if_objmetadata_errorspush')`Rental object ${index}: Missing metadata`t('common.return_valid_errorslength_0')`Invalid seed data: ${validation.errors.join(', ')}`));
          return;
        }
        
        resolve(data as SeedData);
      } catch (error) {
        reject(new Error(`Failed to parse JSON: ${error.message}`));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Import seed data to database via API
 */
export async function importSeedData(
  data: SeedData,
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    imported: {
      tenants: 0,
      organizations: 0,
      users: 0,
      rental_objects: 0
    },
    errors: []
  };

  try {
    // Stage 1: Validation
    onProgress?.({
      stage: 'validating',
      current: 0,
      total: 100,
      message: t('common.validating_seed_data')
    });

    const validation = validateSeedData(data);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    // Stage 2: Import (using API endpoints)
    onProgress?.({
      stage: 'importing',
      current: 0,
      total: data.rental_objects.length + data.users.length + data.organizations.length + data.tenants.length,
      message: t('common.starting_import')
    });

    let imported = 0;
    const total = data.rental_objects.length + data.users.length + data.organizations.length + data.tenants.length;

    // Import tenants
    for (const tenant of data.tenants) {
      try {
        await fetch('/api/admin/tenants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tenant)
        });
        result.imported.tenants++;
        imported++;
        onProgress?.({
          stage: 'importing',
          current: imported,
          total,
          message: `Imported tenant: ${tenant.name}`
        });
      } catch (error) {
        result.errors.push({
          type: 'tenant',
          message: error.message,
          item: tenant
        });
      }
    }

    // Import organizations
    for (const org of data.organizations) {
      try {
        await fetch('/api/admin/organizations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(org)
        });
        result.imported.organizations++;
        imported++;
        onProgress?.({
          stage: 'importing',
          current: imported,
          total,
          message: `Imported organization: ${org.name}`
        });
      } catch (error) {
        result.errors.push({
          type: 'organization',
          message: error.message,
          item: org
        });
      }
    }

    // Import users
    for (const user of data.users) {
      try {
        await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        });
        result.imported.users++;
        imported++;
        onProgress?.({
          stage: 'importing',
          current: imported,
          total,
          message: `Imported user: ${user.name}`
        });
      } catch (error) {
        result.errors.push({
          type: 'user',
          message: error.message,
          item: user
        });
      }
    }

    // Import rental objects
    for (const obj of data.rental_objects) {
      try {
        await fetch('/api/admin/rental-objects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(obj)
        });
        result.imported.rental_objects++;
        imported++;
        onProgress?.({
          stage: 'importing',
          current: imported,
          total,
          message: `Imported: ${obj.name}`
        });
      } catch (error) {
        result.errors.push({
          type: 'rental_object',
          message: error.message,
          item: obj
        });
      }
    }

    // Complete
    onProgress?.({
      stage: 'complete',
      current: total,
      total,
      message: t('common.import_complete')
    });

    result.success = result.errors.length === 0;
    return result;

  } catch (error) {
    onProgress?.({
      stage: 'error',
      current: 0,
      total: 100,
      message: error.message
    });
    
    result.errors.push({
      type: 'general',
      message: error.message
    });
    
    return result;
  }
}

/**
 * Get statistics from seed data
 */
export function getSeedDataStats(data: SeedData) {
  const categoryCount = data.rental_objects.reduce((acc, obj) => {
    acc[obj.category_key] = (acc[obj.category_key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalImages = data.rental_objects.reduce((sum, obj) => sum + obj.images.length, 0);
  const objectsWithPricing = data.rental_objects.filter(obj => obj.pricing.base_price > 0).length;

  return {
    total_objects: data.rental_objects.length,
    total_users: data.users.length,
    total_organizations: data.organizations.length,
    total_tenants: data.tenants.length,
    categories: categoryCount,
    total_images: totalImages,
    objects_with_pricing: objectsWithPricing,
    schema_version: data.meta.schema_version,
    created: data.meta.created
  };
}
