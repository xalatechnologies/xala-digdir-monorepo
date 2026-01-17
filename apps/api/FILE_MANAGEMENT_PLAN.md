# 📦 Comprehensive File Management System Implementation Plan

## 🎯 Overview
Enterprise-grade file management system for the Digilist Platform. Handles images, documents, and attachments with full backoffice integration and database tracking.

---

## 📋 Phase 1: Immediate Fix (CURRENT)
**Goal**: Get rental object images displaying on frontend

### Tasks Completed ✅
- [x] Generated 6 professional Norwegian venue images
- [x] Created storage directory structure
- [x] Updated seed generator to use local images
- [x] Created StorageService class

### Remaining Immediate Tasks
- [ ] Install and configure @fastify/static
- [ ] Register static file serving in main.ts
- [ ] Regenerate seeds with local image paths
- [ ] Re-import to database
- [ ] Verify frontend displays images
- [ ] Deploy to VPS with seed images

---

## 📋 Phase 2: Database Schema for File Metadata
**Goal**: Track all uploaded files in PostgreSQL

### Schema Design
```sql
-- Platform schema: files table
CREATE TABLE platform.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES platform.tenants(id),
  
  -- File metadata
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  mimetype VARCHAR(100) NOT NULL,
  size_bytes INTEGER NOT NULL,
  
  -- Storage location
  storage_path TEXT NOT NULL,
  storage_url TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,  -- 'rental-object-image', 'document', 'attachment', etc.
  
  -- Association (polymorphic)
  entity_type VARCHAR(50),  -- 'rental_object', 'organization', 'user', etc.
  entity_id UUID,
  
  -- Security
  uploaded_by UUID REFERENCES platform.users(id),
  access_level VARCHAR(20) DEFAULT 'private',  -- 'public', 'private', 'authenticated'
  
  -- Metadata
  alt_text TEXT,
  caption TEXT,
  metadata JSONB DEFAULT '{}',  -- { width, height, exif, etc. }
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  -- Indexes
  INDEX idx_files_tenant (tenant_id),
  INDEX idx_files_entity (entity_type, entity_id),
  INDEX idx_files_category (category),
  INDEX idx_files_uploaded_by (uploaded_by)
);

-- Row Level Security
ALTER TABLE platform.files ENABLE ROW LEVEL SECURITY;

CREATE POLICY files_tenant_isolation ON platform.files
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

### Migration File
**Location**: `apps/api/db/migrations/0030_create_files_table.sql`

---

## 📋 Phase 3: Storage Module Enhancement

### 1. Storage Service (Enhanced)
**Location**: `apps/api/src/modules/storage/storage.service.ts`

**Features**:
- Multi-format support (images, PDFs, Office docs)
- Image resizing/optimization (sharp library)
- Virus scanning integration
- Cloud storage adapter (S3-compatible)
- Thumbnail generation
- Duplicate detection (hash-based)

### 2. Storage Controller
**Location**: `apps/api/src/modules/storage/storage.controller.ts`

**Endpoints**:
```typescript
POST   /api/storage/upload              - Upload single file
POST   /api/storage/upload-multiple     - Upload multiple files
GET    /api/storage/files               - List files
GET    /api/storage/files/:id           - Get file metadata
DELETE /api/storage/files/:id           - Delete file
PATCH  /api/storage/files/:id           - Update file metadata
GET    /storage/{tenant}/{category}/{file} - Serve file (static)
```

### 3. Storage Repository
**Location**: `apps/api/src/modules/storage/storage.repository.ts`

**Methods**:
- `createFileRecord()` - Insert file metadata to DB
- `getFileById()` - Retrieve file metadata
- `listFiles()` - List files with filters
- `deleteFile()` - Soft delete file
- `associateWithEntity()` - Link file to rental object/etc

---

## 📋 Phase 4: Backoffice Integration

### 1. Rental Object Image Upload
**Component**: `apps/backoffice/src/features/rental-objects/components/ImageUpload.tsx`

**Features**:
- Drag-and-drop interface
- Multiple file selection
- Image preview before upload
- Progress indicators
- Reordering (drag to reorder primary image)
- Alt text / caption editing

### 2. API Integration
**Hook**: `@digilist/client-sdk/hooks/use-upload-file.ts`

```typescript
export function useUploadRentalObjectImages(rentalObjectId: string) {
  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('entity_type', 'rental_object');
      formData.append('entity_id', rentalObjectId);
      formData.append('category', 'rental-object-image');
      
      return storageService.uploadMultiple(formData);
    },
  });
  
  return uploadMutation;
}
```

### 3. Rental Object Schema Update
**Update**: `apps/api/src/database/schema/rental-objects.ts`

```typescript
// Change `images` from JSONB to relation
export const rentalObjectImages = platformSchema.table('rental_object_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  rentalObjectId: uuid('rental_object_id').notNull().references(() => rentalObjects.id),
  fileId: uuid('file_id').notNull().references(() => files.id),
  isPrimary: boolean('is_primary').default(false),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});
```

---

## 📋 Phase 5: Document Management

### Supported Document Types
- **Images**: JPEG, PNG, WebP, GIF
- **Documents**: PDF, DOCX, XLSX, PPTX
- **Archives**: ZIP (for bulk uploads)

### Features
- Document preview generation (PDF thumbnails)
- Text extraction for search
- Version control
- Access control per document

---

## 📋 Phase 6: Cloud Storage Integration

### S3-Compatible Storage
**Service**: `apps/api/src/modules/storage/adapters/s3-storage.adapter.ts`

```typescript
export class S3StorageAdapter implements StorageAdapter {
  async store(file: Buffer, path: string): Promise<string> {
    // Upload to S3/DigitalOcean Spaces/Backblaze B2
  }
  
  async retrieve(path: string): Promise<Buffer> {
    // Download from S3
  }
  
  async delete(path: string): Promise<void> {
    // Delete from S3
  }
}
```

**Benefits**:
- Scalable storage
- CDN integration
- Geographic distribution
- Automatic backups

---

## 📋 Phase 7: Security & Compliance

### Security Features
1. **File Validation**:
   - Mimetype verification (magic bytes)
   - File extension whitelisting
   - Size limits (configurable per tenant)
   - Antivirus scanning (ClamAV integration)

2. **Access Control**:
   - Signed URLs for private files
   - Time-limited access tokens
   - IP-based restrictions
   - RBAC integration

3. **GDPR Compliance**:
   - File deletion on data erasure requests
   - Audit logging for all file operations
   - Data portability (export all files)

---

## 🗂️ Directory Structure

```
apps/api/
├── storage/                          # Storage root
│   ├── {tenant-id}/                 # Tenant isolation
│   │   ├── rental-object-images/
│   │   ├── documents/
│   │   ├── attachments/
│   │   └── user-avatars/
│   └── seed-images/                 # Static seed data
│       ├── lokaler-og-baner/
│       ├── møterom/
│       ├── utstyr/
│       └── arrangement/
├── src/
│   └── modules/
│       └── storage/
│           ├── storage.service.ts
│           ├── storage.controller.ts
│           ├── storage.repository.ts
│           ├── storage.schemas.ts    # Zod validation
│           ├── adapters/
│           │   ├── local-storage.adapter.ts
│           │   ├── s3-storage.adapter.ts
│           │   └── storage.interface.ts
│           └── utils/
│               ├── image-resize.util.ts
│               ├── file-validator.util.ts
│               └── thumbnail-generator.util.ts
```

---

## 📊 Implementation Priority

### P0 - Critical (This Session)
1. ✅ Create storage directory structure
2. ✅ Generate seed images
3. ⏳ Configure Fastify static file serving
4. ⏳ Get frontend images working

### P1 - High Priority (Next Session)
1. Create files migration (database schema)
2. Implement StorageController with upload endpoint
3. Create StorageRepository for DB operations
4. Build ImageUpload component for backoffice

### P2 - Medium Priority (Future)
1. Image optimization (sharp integration)
2. Thumbnail generation
3. Document preview generation
4. S3 storage adapter

### P3 - Nice to Have
1. Antivirus scanning
2. Advanced image editing (crop, filters)
3. Video/audio support
4. CDN integration

---

## 🚀 Next Immediate Actions

1. **Register @fastify/static** in main.ts
2. **Configure static routes** for `/storage` and `/seed-images`
3. **Copy seed images** to correct storage location
4. **Regenerate seeds** with local paths
5. **Test frontend** - verify images load
6. **Deploy to VPS** with storage directory

---

## 📚 Documentation

### For Developers
- API endpoint documentation (OpenAPI/Swagger)
- Storage service usage examples
- Backoffice integration guide

### For End Users
- File upload size limits
- Supported file types
- How to upload images for rental objects

---

**Status**: ⏳ Phase 1 in progress (frontend image fix)
**Next Phase**: Database schema + upload endpoints
**Timeline**: Phase 1 today, Phase 2-3 in next working session
