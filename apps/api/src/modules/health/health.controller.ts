/**
 * Health Controller - Extended
 * Health checks with readiness and liveness probes
 */
import { Controller, Get } from '../../core/decorators';
import { container } from '../../core/container';
import type { FastifyRequest, FastifyReply } from 'fastify';

@Controller('/health')
export class HealthController {
  /**
   * GET /health - Basic health check
   */
  @Get()
  async check(request: FastifyRequest, reply: FastifyReply) {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  /**
   * GET /health/ready - Readiness probe
   */
  @Get('/ready')
  async readiness(request: FastifyRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    
    try {
      // Test database connection
      await db.execute('SELECT 1');
      
      return {
        status: 'ready',
        checks: {
          database: 'ok',
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      reply.code(503);
      return {
        status: 'not_ready',
        checks: {
          database: 'error',
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * GET /health/live - Liveness probe
   */
  @Get('/live')
  async liveness(request: FastifyRequest, reply: FastifyReply) {
    return {
      status: 'alive',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET /health/db - Database diagnostics
   */
  @Get('/db')
  async databaseDiagnostics(request: FastifyRequest, reply: FastifyReply) {
    try {
      const db = container.resolve<any>('Database');

      // Get current database info
      const dbInfo = await db.execute('SELECT NOW() as current_time, current_database() as db_name, current_schema() as schema_name');

      // Check schemas
      const schemas = await db.execute(`
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name IN ('platform', 'domain', 'compliance', 'public')
        ORDER BY schema_name
      `);

      // Check rental_objects table
      const tableCheck = await db.execute(`
        SELECT
          schemaname,
          tablename
        FROM pg_tables
        WHERE tablename = 'rental_objects'
      `);

      // Count rental objects
      let counts = { total: 0, published: 0, error: null };
      try {
        if (tableCheck.length > 0) {
          const schema = tableCheck[0].schemaname;
          const countResult = await db.execute(`
            SELECT
              COUNT(*) as total,
              COUNT(*) FILTER (WHERE status = 'published') as published
            FROM ${schema}.rental_objects
          `);
          counts = {
            total: Number(countResult[0]?.total || 0),
            published: Number(countResult[0]?.published || 0),
            error: null,
          };
        }
      } catch (e) {
        counts.error = e instanceof Error ? e.message : 'Unknown error';
      }

      return {
        status: 'ok',
        database: {
          connected: true,
          currentTime: dbInfo[0]?.current_time,
          databaseName: dbInfo[0]?.db_name,
          currentSchema: dbInfo[0]?.schema_name,
          availableSchemas: schemas.map((s: any) => s.schema_name),
          rentalObjectsTable: tableCheck.length > 0 ? tableCheck[0] : null,
          rentalObjectsCounts: counts,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      request.log.error({ error }, 'Database diagnostics failed');
      return reply.status(500).send({
        status: 'error',
        database: {
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * GET /health/env - Environment diagnostics (sanitized)
   */
  @Get('/env')
  async envDiagnostics(request: FastifyRequest, reply: FastifyReply) {
    const dbUrl = process.env.DATABASE_URL || '';

    // Parse and sanitize DATABASE_URL
    let dbInfo = { host: 'not set', database: 'not set', user: 'not set', ssl: false };

    if (dbUrl) {
      try {
        const url = new URL(dbUrl);
        dbInfo = {
          host: url.hostname,
          database: url.pathname.slice(1),
          user: url.username,
          ssl: url.searchParams.get('sslmode') === 'require',
        };
      } catch (e) {
        dbInfo = { host: 'invalid URL', database: 'invalid URL', user: 'invalid URL', ssl: false };
      }
    }

    return {
      status: 'ok',
      environment: {
        nodeEnv: process.env.NODE_ENV || 'not set',
        port: process.env.PORT || 'not set',
        host: process.env.HOST || 'not set',
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseInfo: dbInfo,
        corsOrigins: process.env.CORS_ORIGIN?.split(',') || [],
        cookieDomain: process.env.COOKIE_DOMAIN || 'not set',
        jwtConfigured: !!process.env.JWT_SECRET,
        idportenConfigured: !!(process.env.IDPORTEN_CLIENT_ID && process.env.IDPORTEN_CLIENT_SECRET),
      },
      timestamp: new Date().toISOString(),
    };
  }
}
