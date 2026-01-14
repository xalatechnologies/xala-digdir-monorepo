# Backend API Requirements for Multipart Image Upload

## Overview

This document outlines the backend API requirements to support the new multipart/form-data image upload functionality implemented in the client-sdk. The frontend has been updated to send proper multipart/form-data requests instead of base64-encoded data URLs.

## Context

**Client-SDK Version:** Latest (with multipart/form-data support)
**Frontend Apps:** backoffice, minside
**Coordination Required:** YES - Backend API changes are required for full functionality

### Previous Implementation

- **Method:** JSON POST with base64-encoded data URLs
- **Endpoint:** POST `/api/listings/:id/media` with `{ urls: string[] }`
- **Limitations:**
  - No progress tracking
  - 33% size overhead from base64 encoding
  - Memory inefficient for large files
  - No streaming support

### New Implementation

- **Method:** Multipart/form-data POST
- **Progress Tracking:** Real-time upload progress with speed and ETA
- **Image Compression:** Client-side compression before upload (default: 1MB max)
- **Multiple Files:** Support for batch uploads

---

## Required API Endpoints

The following endpoints must be implemented or updated to accept `multipart/form-data` requests:

### 1. Listing Media Upload

**Endpoint:** `POST /api/listings/:id/media`

**Purpose:** Upload one or more images to a facility listing

**Request:**
- **Content-Type:** `multipart/form-data`
- **Path Parameters:**
  - `id` (string, required): Listing ID
- **Form Fields:**
  - `files` (File[], required): One or more image files to upload
  - Custom fields may be included via `UploadOptions.fields`

**Response:** `200 OK`
```typescript
{
  "id": "string",               // Media record ID (UUID)
  "entityId": "string",          // Listing ID
  "entityType": "listing",       // Always "listing" for this endpoint
  "urls": string[],              // Array of public URLs to uploaded files
  "files": [                     // Detailed file metadata
    {
      "originalName": "string",  // Original filename
      "filename": "string",      // Stored filename (may differ)
      "url": "string",           // Public URL to access the file
      "size": number,            // File size in bytes
      "mimeType": "string",      // MIME type (e.g., "image/jpeg")
      "width": number,           // Image width in pixels (optional)
      "height": number           // Image height in pixels (optional)
    }
  ],
  "createdAt": "ISO8601",        // Timestamp when uploaded
  "updatedAt": "ISO8601",        // Timestamp when last modified
  "createdBy": "string",         // User ID who uploaded
  "updatedBy": "string"          // User ID who last modified
}
```

---

### 2. Organization Logo Upload

**Endpoint:** `POST /api/organizations/:id/logo`

**Purpose:** Upload organization logo (single file)

**Request:**
- **Content-Type:** `multipart/form-data`
- **Path Parameters:**
  - `id` (string, required): Organization ID
- **Form Fields:**
  - `files` (File[], required): Logo image file (typically single file, but SDK supports array)

**Response:** `200 OK`
```typescript
{
  "id": "string",
  "entityId": "string",          // Organization ID
  "entityType": "organization",  // Always "organization"
  "urls": string[],
  "files": [
    {
      "originalName": "string",
      "filename": "string",
      "url": "string",
      "size": number,
      "mimeType": "string",
      "width": number,
      "height": number
    }
  ],
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601",
  "createdBy": "string",
  "updatedBy": "string"
}
```

---

### 3. User Avatar Upload

**Endpoint:** `POST /api/users/:id/avatar`

**Purpose:** Upload user profile avatar (single file)

**Request:**
- **Content-Type:** `multipart/form-data`
- **Path Parameters:**
  - `id` (string, required): User ID
- **Form Fields:**
  - `files` (File[], required): Avatar image file (typically single file)

**Response:** `200 OK`
```typescript
{
  "id": "string",
  "entityId": "string",          // User ID
  "entityType": "user",          // Always "user"
  "urls": string[],
  "files": [
    {
      "originalName": "string",
      "filename": "string",
      "url": "string",
      "size": number,
      "mimeType": "string",
      "width": number,
      "height": number
    }
  ],
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601",
  "createdBy": "string",
  "updatedBy": "string"
}
```

---

## Error Handling

All errors MUST conform to **RFC 7807 Problem Details** format:

```typescript
{
  "type": "string",     // URI identifying error type (e.g., "https://xala.no/errors/file-too-large")
  "title": "string",    // Human-readable summary (e.g., "File Too Large")
  "status": number,     // HTTP status code (e.g., 413)
  "detail": "string"    // Human-readable explanation (e.g., "File size exceeds 10MB limit")
}
```

### Common Error Scenarios

| Error Type | HTTP Status | Description |
|------------|-------------|-------------|
| `FILE_TOO_LARGE` | 413 Payload Too Large | Uploaded file exceeds size limit |
| `INVALID_FILE_TYPE` | 415 Unsupported Media Type | File type not allowed (must be image/jpeg, image/png, etc.) |
| `UPLOAD_FAILED` | 500 Internal Server Error | Upload failed due to server error |
| `VALIDATION_ERROR` | 400 Bad Request | Invalid request parameters |
| `UNAUTHORIZED` | 401 Unauthorized | User not authenticated |
| `FORBIDDEN` | 403 Forbidden | User lacks permission to upload to this entity |
| `NOT_FOUND` | 404 Not Found | Entity (listing/org/user) not found |

### Example Error Response

```json
{
  "type": "https://xala.no/errors/file-too-large",
  "title": "File Too Large",
  "status": 413,
  "detail": "File 'photo.jpg' exceeds the maximum allowed size of 10MB"
}
```

---

## Security Requirements

### 1. Authentication & Authorization (RBAC)

- **All upload endpoints MUST require authentication**
- **Role-based access control MUST be enforced:**
  - Listing media: User must have `write:listings` capability for the specific listing
  - Organization logo: User must be an admin/owner of the organization
  - User avatar: User must be uploading to their own profile OR have `write:users` capability

### 2. Multi-Tenant Isolation

- **All requests MUST include `X-Tenant-Id` header**
- **Backend MUST validate that:**
  - The authenticated user belongs to the specified tenant
  - The entity being uploaded to belongs to the specified tenant
  - Uploaded files are stored with tenant isolation

### 3. Audit Logging

**CRITICAL:** All upload mutations MUST be audited for compliance.

**Required Audit Fields:**
- `who`: User ID who performed the upload
- `what`: Action performed (e.g., "LISTING_MEDIA_UPLOADED", "ORG_LOGO_UPLOADED", "USER_AVATAR_UPLOADED")
- `when`: Timestamp (ISO8601)
- `tenantId`: Tenant ID
- `ip`: Client IP address
- `userAgent`: Client user agent
- `entityId`: ID of the entity (listing/org/user)
- `metadata`:
  - `fileCount`: Number of files uploaded
  - `totalSize`: Total size in bytes
  - `filenames`: Array of original filenames

### 4. File Validation

**Backend MUST validate:**
- **File size:** Maximum file size (recommend 10MB per file)
- **File type:** Only allow image files (image/jpeg, image/png, image/webp, image/gif)
- **File content:** Verify file content matches declared MIME type (prevent file type spoofing)
- **Virus scanning:** Integrate with virus scanning service for uploaded files (recommended)

### 5. Rate Limiting

- Implement rate limiting per user/tenant to prevent abuse
- Recommended: 100 upload requests per hour per user

---

## File Storage Recommendations

### Storage Options

1. **AWS S3 (Recommended for Production)**
   - Scalable, durable, cost-effective
   - Built-in CDN support (CloudFront)
   - Supports presigned URLs for direct uploads
   - Easy backup and disaster recovery

2. **Azure Blob Storage**
   - Good integration with Azure ecosystem
   - Similar features to S3

3. **Google Cloud Storage**
   - Similar features to S3
   - Good performance globally

4. **Local Filesystem (Development Only)**
   - Simple for local development
   - NOT recommended for production (no redundancy, scaling issues)

### File Organization

Recommended directory structure:
```
/{tenantId}/{entityType}/{entityId}/{timestamp}-{uuid}.{ext}

Example:
/kommune-123/listings/listing-456/1704067200000-a1b2c3d4.jpg
/kommune-123/organizations/org-789/1704067200000-e5f6g7h8.png
/kommune-123/users/user-101/1704067200000-i9j0k1l2.jpg
```

### Image Processing

**Backend SHOULD process uploaded images:**

1. **Generate Thumbnails**
   - Small: 150x150px (avatars, list views)
   - Medium: 600x400px (cards, previews)
   - Large: 1920x1080px (full-screen views)

2. **Optimize Images**
   - Convert to WebP format for better compression
   - Strip EXIF data for privacy (except orientation)
   - Maintain aspect ratio

3. **Return Multiple Variants**
   ```typescript
   {
     "files": [
       {
         "originalName": "photo.jpg",
         "filename": "1704067200000-a1b2c3d4.jpg",
         "url": "https://cdn.xala.no/..../photo.jpg",
         "size": 245000,
         "mimeType": "image/jpeg",
         "width": 1920,
         "height": 1080,
         "variants": {
           "small": "https://cdn.xala.no/..../photo-small.webp",
           "medium": "https://cdn.xala.no/..../photo-medium.webp",
           "large": "https://cdn.xala.no/..../photo-large.webp"
         }
       }
     ]
   }
   ```

---

## Implementation Checklist

### Phase 1: Core Upload Support

- [ ] Implement multipart/form-data parsing (use `@fastify/multipart` or equivalent)
- [ ] Create file storage service (S3/Azure/GCS client)
- [ ] Implement file upload handlers for all three endpoints
- [ ] Add file validation (size, type, content verification)
- [ ] Return properly formatted responses matching `MediaUploadResponse` type

### Phase 2: Security & Compliance

- [ ] Implement authentication checks (JWT/session validation)
- [ ] Implement RBAC authorization checks
- [ ] Add multi-tenant isolation validation
- [ ] Implement audit logging for all uploads
- [ ] Add rate limiting

### Phase 3: Production Hardening

- [ ] Add image processing (thumbnails, optimization)
- [ ] Implement virus scanning
- [ ] Set up CDN for file delivery
- [ ] Add monitoring and alerting for upload failures
- [ ] Performance testing (concurrent uploads, large files)

### Phase 4: Error Handling

- [ ] Implement RFC 7807 error responses
- [ ] Add comprehensive error logging
- [ ] Test all error scenarios (too large, invalid type, unauthorized, etc.)
- [ ] Localize error messages (Norwegian + English)

### Phase 5: Documentation & Testing

- [ ] Write API documentation (OpenAPI/Swagger)
- [ ] Create integration tests
- [ ] Create load tests
- [ ] Document deployment/configuration
- [ ] Add runbook for operational issues

---

## Testing Recommendations

### Unit Tests

- File validation logic
- RBAC authorization rules
- Audit log generation
- Error handling

### Integration Tests

- Upload single file
- Upload multiple files
- Upload with invalid file type
- Upload with file too large
- Upload without authentication
- Upload without authorization
- Upload to non-existent entity
- Upload with wrong tenant ID

### Load Tests

- 100 concurrent uploads
- Large file uploads (5MB+)
- Sustained upload rate (100 uploads/minute)

### Security Tests

- Test file type spoofing (rename .exe to .jpg)
- Test path traversal attempts in filename
- Test CSRF protection
- Test rate limiting
- Test authorization bypass attempts

---

## Migration Strategy

### Backward Compatibility

**Option 1: Support Both Formats Temporarily**
```typescript
// Accept both old (JSON with base64) and new (multipart) formats
if (contentType === 'application/json') {
  // Handle old format: { urls: string[] }
  // Convert base64 data URLs to files
} else if (contentType === 'multipart/form-data') {
  // Handle new format: multipart files
}
```

**Option 2: Version API Endpoints**
```
POST /api/v1/listings/:id/media  // Old format (JSON)
POST /api/v2/listings/:id/media  // New format (multipart)
```

**Option 3: Hard Cutover** (NOT recommended)
- Remove old format support immediately
- Requires coordinated frontend/backend deployment

### Recommended Approach

Use **Option 1** with a deprecation timeline:
1. Deploy backend with support for both formats
2. Deploy frontend with new multipart format
3. Monitor usage of old format (should drop to zero)
4. After 2-4 weeks, log warnings for old format usage
5. After 1-2 months, remove old format support

---

## Performance Considerations

### Upload Limits

- **Max file size:** 10MB per file (configurable)
- **Max files per request:** 10 files
- **Max total request size:** 50MB

### Timeouts

- **Upload timeout:** 60 seconds
- **Processing timeout:** 30 seconds

### Concurrency

- Allow multiple simultaneous uploads per user
- Limit to 5 concurrent uploads per user to prevent abuse

---

## Monitoring & Observability

### Metrics to Track

- **Upload success rate** (target: >99%)
- **Average upload duration** (target: <5 seconds for 1MB file)
- **P95/P99 upload duration**
- **Upload volume** (files per day, bytes per day)
- **Error rate by error type**
- **Storage usage per tenant**

### Alerts

- Upload success rate drops below 95%
- Average upload duration exceeds 10 seconds
- Error rate exceeds 5%
- Storage quota exceeded for tenant
- Virus detected in uploaded file

### Logging

Log the following for each upload:
- Request ID
- User ID
- Tenant ID
- Entity ID
- File count
- Total size
- Duration
- Success/failure
- Error details (if failed)

---

## Questions & Coordination

### Backend Team Questions

1. **File Storage:** Which cloud provider are you using for file storage? (S3/Azure/GCS)
2. **CDN:** Is there a CDN configured for serving uploaded files?
3. **Image Processing:** Do you have existing image processing infrastructure?
4. **Virus Scanning:** Is virus scanning already integrated?
5. **Deployment:** Can you deploy backend changes before/with frontend deployment?

### Frontend-Backend Coordination

- **Deployment Order:** Backend MUST be deployed first to avoid upload failures
- **Feature Flag:** Consider using a feature flag to enable/disable new upload UI
- **Monitoring:** Set up shared dashboard to monitor upload success rates during rollout

---

## References

- **Client-SDK Implementation:** `packages/client-sdk/src/services/base.service.ts` (uploadMedia method)
- **TypeScript Types:** `packages/client-sdk/src/types/upload.ts`
- **React Hooks:** `packages/client-sdk/src/hooks/use-listings.ts` (useUploadListingMedia)
- **RFC 7807 Problem Details:** https://tools.ietf.org/html/rfc7807
- **OWASP File Upload Security:** https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload

---

## Contact

For questions or clarification, contact:
- **Frontend Team:** [Team contact]
- **Backend API Team:** [Team contact]
- **DevOps/Infrastructure:** [Team contact]

---

**Document Version:** 1.0
**Last Updated:** 2026-01-14
**Status:** Ready for Backend Implementation
