import { pgTable, uuid, text, timestamp, jsonb, integer } from 'drizzle-orm/pg-core';
import { platformSchema } from './schemas';

/**
 * Files Table
 * Stores metadata for all uploaded files
 * 
 * Schema: platform (cross-tenant infrastructure)
 * Relationships:
 * - tenantId -> platform.tenants.id
 * - entityId -> Polymorphic (rental_objects, organizations, users, etc.)
 */
export const files = platformSchema.table('files', {
  // Primary Key
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Multi-tenant
  tenantId: uuid('tenant_id').notNull(),
  
  // File Information
  filename: text('filename').notNull(), // Stored filename (unique)
  originalFilename: text('original_filename').notNull(), // User's original filename
  mimetype: text('mimetype').notNull(), // e.g., 'image/png'
  sizeBytes: integer('size_bytes').notNull(),
  
  // Storage Information
  storageProvider: text('storage_provider').notNull().default('local'), // 'local' | 's3' | 'spaces'
  storagePath: text('storage_path').notNull(), // Relative path: /tenant-id/category/filename
  storageUrl: text('storage_url').notNull(), // Full URL for access
  
  // File Categorization
  category: text('category').notNull(), // 'rental-object-image' | 'rental-object-document' | etc.
  
  // Polymorphic Association (optional - links file to specific entity)
  entityType: text('entity_type'), // 'rental_object' | 'organization' | 'user' | 'booking'
  entityId: uuid('entity_id'),
  
  // Metadata
  altText: text('alt_text'), // For images (accessibility)
  caption: text('caption'), // For images (display)
  metadata: jsonb('metadata'), // Additional metadata (dimensions, EXIF, etc.)
  
  // Who uploaded it
  uploadedBy: uuid('uploaded_by
').notNull(),
  
  // Lifecycle
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'), // Soft delete
});

// Indexes for performance
export const filesIndexes = {
  // Lookup files by tenant
  tenantIdx: 'idx_files_tenant_id',
  // Lookup files for a specific entity
  entityIdx: 'idx_files_entity',
  // Lookup files by category
  categoryIdx: 'idx_files_category',
  // Lookup by uploader
  uploaderIdx: 'idx_files_uploaded_by',
};
