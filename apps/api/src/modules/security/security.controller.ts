/**
 * Security Controller
 * Provides security metrics, GDPR compliance status, failed login tracking,
 * and data export monitoring for compliance dashboard
 */
import { Controller, Get } from '../../core/decorators';
import { container } from '../../core/container';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, sql, and, gte, lte, count, desc, or } from 'drizzle-orm';
import { auditLogs, users, bookings, listings } from '../../database/schema/index';

interface TenantRequest extends FastifyRequest {
  tenantId?: string | null;
  userId?: string | null;
}

@Controller('/api/security')
export class SecurityController {
  /**
   * GET /api/security/metrics - Get security dashboard metrics
   * Returns audit trail completeness, failed logins, data exports, and security events
   */
  @Get('/metrics')
  async getSecurityMetrics(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const tenantId = request.tenantId;

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Calculate audit trail completeness
    // For production, we expect audit logs for all critical actions
    // We'll compare total critical actions vs audit entries
    const totalBookingsResult = await db
      .select({ count: count() })
      .from(bookings)
      .where(gte(bookings.createdAt, thirtyDaysAgo));
    const totalBookings = Number(totalBookingsResult[0]?.count || 0);

    const totalListingsResult = await db
      .select({ count: count() })
      .from(listings)
      .where(gte(listings.createdAt, thirtyDaysAgo));
    const totalListings = Number(totalListingsResult[0]?.count || 0);

    // Count audit entries for bookings and listings
    const auditEntriesResult = await db
      .select({ count: count() })
      .from(auditLogs)
      .where(
        and(
          gte(auditLogs.timestamp, thirtyDaysAgo),
          or(
            eq(auditLogs.resource, 'booking'),
            eq(auditLogs.resource, 'listing')
          )
        )
      );
    const auditEntries = Number(auditEntriesResult[0]?.count || 0);

    // Calculate completeness percentage
    const expectedAuditEntries = (totalBookings + totalListings) * 2; // Create + Update events
    const auditTrailCompleteness = expectedAuditEntries > 0
      ? Math.min(100, Math.round((auditEntries / expectedAuditEntries) * 100))
      : 100;

    // Count failed login attempts
    const failedLoginsResult = await db
      .select({ count: count() })
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.action, 'login_failed'),
          gte(auditLogs.timestamp, oneDayAgo)
        )
      );
    const failedLogins24h = Number(failedLoginsResult[0]?.count || 0);

    const failedLogins7dResult = await db
      .select({ count: count() })
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.action, 'login_failed'),
          gte(auditLogs.timestamp, sevenDaysAgo)
        )
      );
    const failedLogins7d = Number(failedLogins7dResult[0]?.count || 0);

    // Count data exports
    const dataExportsResult = await db
      .select({ count: count() })
      .from(auditLogs)
      .where(
        and(
          or(
            eq(auditLogs.action, 'export_data'),
            eq(auditLogs.action, 'data_export')
          ),
          gte(auditLogs.timestamp, thirtyDaysAgo)
        )
      );
    const dataExports = Number(dataExportsResult[0]?.count || 0);

    // Get recent security events (high severity)
    const securityEventsResult = await db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        resource: auditLogs.resource,
        resourceId: auditLogs.resourceId,
        userId: auditLogs.userId,
        severity: auditLogs.severity,
        metadata: auditLogs.metadata,
        timestamp: auditLogs.timestamp,
        ipAddress: auditLogs.ipAddress,
      })
      .from(auditLogs)
      .where(
        and(
          gte(auditLogs.timestamp, sevenDaysAgo),
          or(
            eq(auditLogs.severity, 'warning'),
            eq(auditLogs.severity, 'error'),
            eq(auditLogs.severity, 'critical')
          )
        )
      )
      .orderBy(desc(auditLogs.timestamp))
      .limit(10);

    const securityEvents = securityEventsResult.map((event: any) => ({
      id: event.id,
      action: event.action,
      resource: event.resource,
      resourceId: event.resourceId,
      userId: event.userId,
      severity: event.severity,
      metadata: event.metadata,
      timestamp: event.timestamp?.toISOString() || new Date().toISOString(),
      ipAddress: event.ipAddress,
    }));

    return {
      auditTrailCompleteness,
      failedLogins: {
        last24Hours: failedLogins24h,
        last7Days: failedLogins7d,
      },
      dataExports: {
        last30Days: dataExports,
      },
      securityEvents,
      timestamp: now.toISOString(),
    };
  }

  /**
   * GET /api/security/gdpr-status - Get GDPR consent status summary
   * Returns total users, users with consent, users without consent, and percentage
   */
  @Get('/gdpr-status')
  async getGdprStatus(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const tenantId = request.tenantId;

    // Get total users count
    const totalUsersResult = await db
      .select({ count: count() })
      .from(users);
    const totalUsers = Number(totalUsersResult[0]?.count || 0);

    // Get all users to check consent in metadata
    const allUsersResult = await db
      .select({
        id: users.id,
        metadata: users.metadata,
      })
      .from(users);

    // Count users with and without consent
    // GDPR consent is typically stored in metadata.gdprConsent as boolean
    let withConsent = 0;
    let withoutConsent = 0;

    for (const user of allUsersResult) {
      const metadata = user.metadata as any;
      if (metadata?.gdprConsent === true) {
        withConsent++;
      } else {
        withoutConsent++;
      }
    }

    // Calculate percentage
    const percentage = totalUsers > 0
      ? Math.round((withConsent / totalUsers) * 100)
      : 0;

    return {
      totalUsers,
      withConsent,
      withoutConsent,
      percentage,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET /api/security/failed-logins - Get failed login attempts with filtering
   * Returns paginated list of failed login attempts from audit logs
   */
  @Get('/failed-logins')
  async getFailedLogins(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const {
      userId,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = request.query as any;

    // Build where conditions
    const conditions = [eq(auditLogs.action, 'login_failed')];

    if (userId) {
      conditions.push(eq(auditLogs.userId, userId));
    }

    if (startDate) {
      conditions.push(gte(auditLogs.timestamp, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(auditLogs.timestamp, new Date(endDate)));
    }

    const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(auditLogs)
      .where(whereClause);
    const total = Number(totalResult[0]?.count || 0);

    // Get paginated data
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const offset = (pageNum - 1) * limitNum;

    const failedLoginsResult = await db
      .select({
        id: auditLogs.id,
        userId: auditLogs.userId,
        action: auditLogs.action,
        resource: auditLogs.resource,
        resourceId: auditLogs.resourceId,
        severity: auditLogs.severity,
        metadata: auditLogs.metadata,
        timestamp: auditLogs.timestamp,
        ipAddress: auditLogs.ipAddress,
        userAgent: auditLogs.userAgent,
      })
      .from(auditLogs)
      .where(whereClause)
      .orderBy(desc(auditLogs.timestamp))
      .limit(limitNum)
      .offset(offset);

    const data = failedLoginsResult.map((event: any) => ({
      id: event.id,
      userId: event.userId,
      action: event.action,
      resource: event.resource,
      resourceId: event.resourceId,
      severity: event.severity,
      metadata: event.metadata,
      timestamp: event.timestamp?.toISOString() || new Date().toISOString(),
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
    }));

    return {
      data,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * GET /api/security/data-exports - Get data export tracking with filtering
   * Returns paginated list of data export events from audit logs with user info
   */
  @Get('/data-exports')
  async getDataExports(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const {
      userId,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = request.query as any;

    // Build where conditions for data export actions
    const conditions = [
      or(
        eq(auditLogs.action, 'export_data'),
        eq(auditLogs.action, 'data_export')
      )
    ];

    if (userId) {
      conditions.push(eq(auditLogs.userId, userId));
    }

    if (startDate) {
      conditions.push(gte(auditLogs.timestamp, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(auditLogs.timestamp, new Date(endDate)));
    }

    const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(auditLogs)
      .where(whereClause);
    const total = Number(totalResult[0]?.count || 0);

    // Get paginated data with user info
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const offset = (pageNum - 1) * limitNum;

    const dataExportsResult = await db
      .select({
        id: auditLogs.id,
        userId: auditLogs.userId,
        action: auditLogs.action,
        resource: auditLogs.resource,
        resourceId: auditLogs.resourceId,
        severity: auditLogs.severity,
        metadata: auditLogs.metadata,
        timestamp: auditLogs.timestamp,
        ipAddress: auditLogs.ipAddress,
        userAgent: auditLogs.userAgent,
        userName: users.name,
        userEmail: users.email,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .where(whereClause)
      .orderBy(desc(auditLogs.timestamp))
      .limit(limitNum)
      .offset(offset);

    const data = dataExportsResult.map((event: any) => ({
      id: event.id,
      userId: event.userId,
      userName: event.userName || 'Unknown User',
      userEmail: event.userEmail,
      action: event.action,
      resource: event.resource,
      resourceId: event.resourceId,
      severity: event.severity,
      metadata: event.metadata,
      timestamp: event.timestamp?.toISOString() || new Date().toISOString(),
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
    }));

    return {
      data,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }
}
