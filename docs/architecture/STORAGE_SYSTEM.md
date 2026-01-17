# Storage System Architecture

**Version:** 1.0
**Date:** 2026-01-17
**Status:** ✅ Production Ready

---

## Overview

The Digilist platform includes a built-in file storage system for handling images and attachments on the VPS. The system is designed for multi-tenant isolation, security, and scalability.

---

## Architecture

### Storage Service

**Location:** `apps/api/src/modules/storage/storage.service.ts`

**Features:**
- Multi-tenant file isolation
- Category-based organization
- File size limits (10MB per file)
- Mimetype validation (JPEG, PNG, WebP, PDF)
- Unique filename generation (prevents overwrites)
- Metadata tracking

### Storage Controller

**Location:** `apps/api/src/modules/storage/storage.controller.ts`

**Endpoints:**
- `POST /api/storage/upload` - Upload single file
- `POST /api/storage/upload-multiple` - Upload multiple files
- `GET /api/storage/files` - List files with filters
- `DELETE /api/storage/files/:id` - Delete file
- `PATCH /api/storage/files/:id` - Update file metadata

### Static File Serving

**Location:** `apps/api/src/adapters/fastify.adapter.ts` (lines 123-130)

Uses `@fastify/static` to serve files:
- **Storage directory:** `/var/www/digilist-api/storage/`
- **URL prefix:** `/storage/`
- **Example URL:** `https://api.digilist.no/storage/tenant-id/rental-objects/image-abc123.jpg`

---

## Directory Structure

```
/var/www/digilist-api/storage/
├── {tenant-id-1}/
│   ├── rental-objects/          # Rental object images
│   │   ├── image-1-abc123.jpg
│   │   ├── image-2-def456.png
│   │   └── image-3-ghi789.webp
│   ├── users/                   # User avatars
│   │   └── avatar-xyz.jpg
│   └── organizations/           # Organization logos
│       └── logo-org.png
├── {tenant-id-2}/
│   └── rental-objects/
│       └── ...
└── seed-images/                 # Static seed images
    ├── lokaler-og-baner/
    ├── møterom/
    ├── utstyr/
    └── arrangement/
```

---

## Configuration

### Environment Variables

**In `ecosystem.config.cjs`:**
```javascript
env_production: {
  STORAGE_BASE_URL: '/storage',  // URL prefix for file serving
}
```

**Purpose:**
- `STORAGE_BASE_URL` - Base URL for generating file URLs (default: `/storage`)

### Nginx Configuration (Production)

**File:** `/etc/nginx/sites-available/digilist-api`

```nginx
server {
    listen 443 ssl;
    server_name api.digilist.no;

    # API proxy
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Storage files (served directly by Node.js)
    location /storage/ {
        proxy_pass http://localhost:4000/storage/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;

        # Optional: Add caching headers
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/api.digilist.no/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.digilist.no/privkey.pem;
}
```

**Note:** Fastify serves the files, Nginx proxies to Fastify.

---

## Upload Flow

### Single File Upload

**Request:**
```bash
curl -X POST https://api.digilist.no/api/storage/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@image.jpg" \
  -F "category=rental-objects" \
  -F "entityType=rental_object" \
  -F "entityId=uuid-here" \
  -F "altText=Beautiful venue" \
  -F "caption=Main hall"
```

**Response:**
```json
{
  "id": "abc123",
  "url": "/storage/f47ac10b-58cc-4372-a567-0e02b2c3d479/rental-objects/image-abc123.jpg",
  "filename": "image-abc123.jpg",
  "originalFilename": "image.jpg",
  "mimetype": "image/jpeg",
  "sizeBytes": 245678,
  "category": "rental-objects",
  "entityType": "rental_object",
  "entityId": "uuid-here",
  "altText": "Beautiful venue",
  "caption": "Main hall",
  "createdAt": "2026-01-17T12:00:00.000Z"
}
```

### Multiple File Upload

**Request:**
```bash
curl -X POST https://api.digilist.no/api/storage/upload-multiple \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@image1.jpg" \
  -F "files=@image2.png" \
  -F "files=@image3.webp"
```

**Response:**
```json
{
  "files": [
    { "id": "abc123", "url": "/storage/.../image1-abc123.jpg", ... },
    { "id": "def456", "url": "/storage/.../image2-def456.png", ... },
    { "id": "ghi789", "url": "/storage/.../image3-ghi789.webp", ... }
  ],
  "totalUploaded": 3,
  "totalFailed": 0
}
```

---

## Security

### Multi-Tenant Isolation

Files are stored in tenant-specific directories:
```
storage/
├── tenant-1/      # Only accessible by tenant-1 users
├── tenant-2/      # Only accessible by tenant-2 users
└── tenant-3/      # Only accessible by tenant-3 users
```

**Access Control:**
- Upload endpoint requires authentication (JWT token)
- Files are scoped to `tenantId` from JWT
- Delete/update operations verify tenant ownership

### File Validation

**Size Limits:**
- Max file size: 10MB per file
- Enforced in both Fastify multipart config and StorageService

**Mimetype Whitelist:**
- `image/jpeg` - JPEG images
- `image/png` - PNG images
- `image/webp` - WebP images
- `application/pdf` - PDF documents

**Filename Sanitization:**
- Original filename preserved
- Unique hash appended: `image-abc123.jpg`
- Prevents overwrites and filename collisions

### URL Generation

**Pattern:** `/storage/{tenantId}/{category}/{filename}`

**Example:**
```
/storage/f47ac10b-58cc-4372-a567-0e02b2c3d479/rental-objects/venue-123abc.jpg
```

**Security Notes:**
- URL does not expose internal file paths
- Tenant ID is part of URL (allows CDN caching per tenant)
- Filename includes random hash (prevents guessing)

---

## Integration with Rental Objects

### Seed Data Images

**Current Implementation:**
Seed data in `apps/api/db/seed-data-bank/rental-objects-comprehensive.json` references image URLs:

```json
{
  "images": [
    {
      "url": "/storage/seed-images/lokaler-og-baner/venue-1.jpg",
      "alt": "Main hall",
      "isPrimary": true
    },
    {
      "url": "/storage/seed-images/lokaler-og-baner/venue-2.jpg",
      "alt": "Side room",
      "isPrimary": false
    }
  ]
}
```

**Storage Location:** `/var/www/digilist-api/storage/seed-images/`

**Categories:**
- `lokaler-og-baner/` - Venues & courts
- `møterom/` - Meeting rooms (deprecated category)
- `utstyr/` - Equipment
- `arrangement/` - Events

### Frontend Image Display

**Web Application** (`apps/web`):
```tsx
import { Image } from '@xala/ds';

function RentalObjectCard({ rentalObject }) {
  const primaryImage = rentalObject.images.find(img => img.isPrimary);

  return (
    <Image
      src={`https://api.digilist.no${primaryImage.url}`}
      alt={primaryImage.alt}
    />
  );
}
```

**Backoffice** (`apps/backoffice`):
```tsx
import { useUploadImages } from '@digilist/client-sdk/hooks';

function ImageUploader({ rentalObjectId }) {
  const { upload, isUploading } = useUploadImages();

  const handleUpload = async (files: File[]) => {
    const result = await upload({
      files,
      category: 'rental-objects',
      entityType: 'rental_object',
      entityId: rentalObjectId,
    });
    console.log('Uploaded:', result.files);
  };

  return <FileDropzone onDrop={handleUpload} />;
}
```

---

## Deployment Checklist

### Initial Setup

1. **Create storage directory on server:**
   ```bash
   ssh root@159.223.21.252 "mkdir -p /var/www/digilist-api/storage"
   ssh root@159.223.21.252 "chmod 755 /var/www/digilist-api/storage"
   ```

2. **Upload seed images (if needed):**
   ```bash
   scp -r apps/api/storage/seed-images root@159.223.21.252:/var/www/digilist-api/storage/
   ```

3. **Verify PM2 config includes STORAGE_BASE_URL:**
   ```bash
   cat ecosystem.config.cjs | grep STORAGE_BASE_URL
   # Should output: STORAGE_BASE_URL: '/storage',
   ```

4. **Restart API server:**
   ```bash
   ssh root@159.223.21.252 "cd /var/www/digilist-api && pm2 restart digilist-api"
   ```

### Verification

1. **Check storage directory exists:**
   ```bash
   ssh root@159.223.21.252 "ls -la /var/www/digilist-api/storage/"
   ```

2. **Test file upload:**
   ```bash
   curl -X POST https://api.digilist.no/api/storage/upload \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "file=@test.jpg" \
     -F "category=rental-objects"
   ```

3. **Test file serving:**
   ```bash
   curl -I https://api.digilist.no/storage/tenant-id/rental-objects/test.jpg
   # Should return: HTTP/2 200
   ```

4. **Verify in browser:**
   - Open: `https://web-test.digilist.no`
   - Check rental object images load
   - Check browser console for 404 errors

---

## Troubleshooting

### Issue: 404 Not Found on /storage/ URLs

**Cause:** Storage directory doesn't exist or has wrong permissions

**Solution:**
```bash
ssh root@159.223.21.252 "mkdir -p /var/www/digilist-api/storage && chmod 755 /var/www/digilist-api/storage"
ssh root@159.223.21.252 "pm2 restart digilist-api"
```

### Issue: 413 Payload Too Large

**Cause:** File exceeds 10MB limit

**Solution:** Either:
1. Compress image before upload
2. Increase limit in `fastify.adapter.ts` (line 138) and `storage.service.ts` (line 33)

### Issue: 403 Forbidden

**Cause:** Tenant ID mismatch or missing authentication

**Solution:**
- Verify JWT token is valid
- Check tenant ID in token matches file path
- Ensure user has permission to upload files

### Issue: Images not displaying on frontend

**Possible Causes:**
1. **Wrong base URL** - Check `STORAGE_BASE_URL` in ecosystem.config.cjs
2. **CORS issue** - Verify CORS_ORIGIN includes frontend domain
3. **File doesn't exist** - Verify file exists on server
4. **Nginx not proxying** - Check Nginx configuration

**Debugging:**
```bash
# Check if file exists
ssh root@159.223.21.252 "ls -la /var/www/digilist-api/storage/tenant-id/rental-objects/"

# Test direct API access
curl -I https://api.digilist.no/storage/tenant-id/rental-objects/image.jpg

# Check API logs
ssh root@159.223.21.252 "pm2 logs digilist-api --lines 50"
```

---

## Performance Considerations

### CDN Integration (Future)

For production scale, consider:
1. **Upload to S3/R2** instead of local storage
2. **Serve via CDN** (CloudFlare, CloudFront)
3. **Image optimization** (resize, compress, format conversion)

**Example S3 Integration:**
```typescript
// storage.service.ts
import { S3Client } from '@aws-sdk/client-s3';

export class StorageService {
  private s3: S3Client;

  async uploadFile(options: UploadFileOptions): Promise<StoredFile> {
    // Upload to S3 bucket
    await this.s3.putObject({
      Bucket: 'digilist-storage',
      Key: `${options.tenantId}/${options.category}/${uniqueFilename}`,
      Body: options.buffer,
      ContentType: options.mimetype,
    });

    // Return CDN URL
    return {
      url: `https://cdn.digilist.no/${options.tenantId}/${options.category}/${uniqueFilename}`,
      ...
    };
  }
}
```

### Caching Strategy

**Nginx caching** (optional):
```nginx
location /storage/ {
    proxy_pass http://localhost:4000/storage/;

    # Cache for 30 days
    proxy_cache storage_cache;
    proxy_cache_valid 200 30d;
    proxy_cache_key "$scheme$request_method$host$request_uri";

    add_header X-Cache-Status $upstream_cache_status;
}
```

### Disk Space Monitoring

**Monitor storage usage:**
```bash
# Check disk usage
ssh root@159.223.21.252 "df -h /var/www/digilist-api/storage"

# Check largest files
ssh root@159.223.21.252 "du -ah /var/www/digilist-api/storage | sort -rh | head -20"

# Check total file count
ssh root@159.223.21.252 "find /var/www/digilist-api/storage -type f | wc -l"
```

---

## Future Enhancements

### Planned Features

1. **Database metadata tracking** - Store file records in PostgreSQL
2. **Thumbnail generation** - Auto-create thumbnails for images
3. **Image optimization** - Compress images on upload
4. **Bulk operations** - Batch upload/delete operations
5. **S3/R2 storage** - Cloud storage integration
6. **CDN integration** - CloudFlare R2 + CDN
7. **Audit logging** - Track file operations

### Database Schema (Planned)

```sql
CREATE TABLE platform.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES platform.tenants(id),
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  mimetype VARCHAR(100) NOT NULL,
  size_bytes INTEGER NOT NULL,
  category VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  alt_text TEXT,
  caption TEXT,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  created_by UUID REFERENCES platform.users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_files_tenant ON platform.files(tenant_id);
CREATE INDEX idx_files_entity ON platform.files(entity_type, entity_id);
CREATE INDEX idx_files_category ON platform.files(category);
```

---

## Summary

The storage system is **production-ready** with:

✅ Multi-tenant file isolation
✅ Category-based organization
✅ Size and mimetype validation
✅ Unique filename generation
✅ Static file serving via Fastify
✅ Upload/download/delete API endpoints
✅ Integration with rental objects
✅ PM2 configuration included

**Storage Location:** `/var/www/digilist-api/storage/`
**API Endpoints:** `/api/storage/*`
**File Serving:** `/storage/*`
**Max File Size:** 10MB
**Supported Formats:** JPEG, PNG, WebP, PDF

---

**Document Version:** 1.0
**Last Updated:** 2026-01-17
**Status:** ✅ Production Ready
**Next Review:** After S3/CDN integration
