-- Migration: Add files table for file metadata tracking
-- Schema: platform (cross-tenant infrastructure)
-- Created: 2026-01-17

CREATE TABLE IF NOT EXISTS platform.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Multi-tenant
  tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
  
  -- File Information
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mimetype TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  
  -- Storage Information
  storage_provider TEXT NOT NULL DEFAULT 'local',
  storage_path TEXT NOT NULL,
  storage_url TEXT NOT NULL,
  
  -- File Categorization
  category TEXT NOT NULL,
  
  -- Polymorphic Association
  entity_type TEXT,
  entity_id UUID,
  
  -- Metadata
  alt_text TEXT,
  caption TEXT,
  metadata JSONB,
  
  -- Audit
  uploaded_by UUID NOT NULL,
  
  -- Lifecycle
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_files_tenant_id ON platform.files(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_files_entity ON platform.files(entity_type, entity_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_files_category ON platform.files(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_files_uploaded_by ON platform.files(uploaded_by) WHERE deleted_at IS NULL;

-- Row Level Security (RLS) for tenant isolation
ALTER TABLE platform.files ENABLE ROW LEVEL SECURITY;

CREATE POLICY files_tenant_isolation ON platform.files
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Comments for documentation
COMMENT ON TABLE platform.files IS 'Stores metadata for all uploaded files across the platform';
COMMENT ON COLUMN platform.files.storage_provider IS 'Storage backend: local, s3, spaces, etc.';
COMMENT ON COLUMN platform.files.entity_type IS 'Polymorphic association: rental_object, organization, user, booking';
COMMENT ON COLUMN platform.files.metadata IS 'Additional metadata: image dimensions, EXIF data, video duration, etc.';
