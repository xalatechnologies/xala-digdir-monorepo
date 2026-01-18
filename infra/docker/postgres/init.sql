-- ==============================================================================
-- DIGILIST PLATFORM - POSTGRESQL INITIALIZATION SCRIPT
-- ==============================================================================
-- This script runs when the PostgreSQL container is first created
-- It only sets up extensions and permissions
-- Schemas and tables are created via Drizzle migrations from @digilist/database-schema
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- Cryptographic functions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- Trigram matching for search
CREATE EXTENSION IF NOT EXISTS "btree_gist";     -- GiST index support for exclusion constraints

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions to the application user for future schemas
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO digilist_dev;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO digilist_dev;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO digilist_dev;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE '✅ Digilist Platform database initialized successfully';
    RAISE NOTICE '   - Extensions: uuid-ossp, pgcrypto, pg_trgm, btree_gist';
    RAISE NOTICE '   - Functions: update_updated_at_column()';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Next steps:';
    RAISE NOTICE '   1. Run migrations: docker-compose -f docker/docker-compose.dev.yml exec api pnpm db:migrate';
    RAISE NOTICE '   2. Seed database: docker-compose -f docker/docker-compose.dev.yml exec api pnpm db:seed';
    RAISE NOTICE '';
    RAISE NOTICE '📦 Migrations are managed by @digilist/database-schema package';
    RAISE NOTICE '   Location: packages/database-schema/migrations/';
END $$;
