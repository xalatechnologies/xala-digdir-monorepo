-- Migration: Add translations table for i18n management
-- Enables runtime translation control via SaaS Admin

-- Create translations table in platform schema
CREATE TABLE IF NOT EXISTS platform.translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES platform.tenants(id) ON DELETE CASCADE,
  namespace VARCHAR(50) NOT NULL,
  key VARCHAR(100) NOT NULL,
  language VARCHAR(10) NOT NULL,
  value TEXT NOT NULL,
  is_system_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- Unique constraint: one value per tenant/namespace/key/language
CREATE UNIQUE INDEX translations_unique_idx 
  ON platform.translations(tenant_id, namespace, key, language);

-- Query indexes for common lookups
CREATE INDEX translations_namespace_idx ON platform.translations(namespace);
CREATE INDEX translations_language_idx ON platform.translations(language);
CREATE INDEX translations_tenant_idx ON platform.translations(tenant_id);
CREATE INDEX translations_key_idx ON platform.translations(key);
CREATE INDEX translations_lookup_idx ON platform.translations(namespace, language);

-- Add comment for documentation
COMMENT ON TABLE platform.translations IS 'i18n translations with per-tenant override support. System defaults have tenant_id=NULL.';
COMMENT ON COLUMN platform.translations.namespace IS 'Translation namespace (e.g., common, auth, payment)';
COMMENT ON COLUMN platform.translations.key IS 'Translation key within namespace (camelCase)';
COMMENT ON COLUMN platform.translations.is_system_default IS 'System defaults cannot be deleted by tenants';
