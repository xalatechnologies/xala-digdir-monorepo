/**
 * Season Applications Controller
 * Manages seasonal facility applications from sports clubs
 */
import { Controller, Get, Post, Put, Delete } from '../../core/decorators';
import { container } from '../../core/container';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, sql, count } from 'drizzle-orm';
import { seasonApplications, seasons, listings, organizations, bookings } from '../../database/schema/index';

/**
 * Helper to create notification for application status changes
 * TODO: Replace with real notification service when available
 *
 * Exported for use in batch operations (e.g., season finalization)
 */
export function createApplicationNotification(data: {
  type: 'application_approved' | 'application_rejected' | 'application_allocated';
  applicationId: string;
  applicantEmail: string;
  applicantName: string;
  seasonName: string;
  listingName: string;
  weekday: number;
  startTime: string;
  endTime: string;
  rejectionReason?: string | null;
  bookingsCreated?: number;
}) {
  const weekdays = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
  const weekdayName = weekdays[data.weekday] || 'Ukjent';

  let title = '';
  let message = '';

  switch (data.type) {
    case 'application_approved':
      title = 'Søknad godkjent';
      message = `Din søknad for ${data.listingName} (${weekdayName} ${data.startTime}-${data.endTime}) i sesong ${data.seasonName} er godkjent.`;
      break;
    case 'application_rejected':
      title = 'Søknad avvist';
      message = `Din søknad for ${data.listingName} (${weekdayName} ${data.startTime}-${data.endTime}) i sesong ${data.seasonName} er avvist.`;
      if (data.rejectionReason) {
        message += ` Årsak: ${data.rejectionReason}`;
      }
      break;
    case 'application_allocated':
      title = 'Sesongallokering bekreftet';
      message = `Din godkjente søknad for ${data.listingName} (${weekdayName} ${data.startTime}-${data.endTime}) i sesong ${data.seasonName} er nå allokert.`;
      if (data.bookingsCreated) {
        message += ` ${data.bookingsCreated} bookinger er opprettet.`;
      }
      break;
  }

  const notification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: data.type,
    title,
    message,
    read: false,
    createdAt: new Date().toISOString(),
    data: {
      applicationId: data.applicationId,
      applicantEmail: data.applicantEmail,
      applicantName: data.applicantName,
      seasonName: data.seasonName,
      listingName: data.listingName,
      weekday: data.weekday,
      startTime: data.startTime,
      endTime: data.endTime,
      rejectionReason: data.rejectionReason,
      bookingsCreated: data.bookingsCreated,
    },
  };

  // TODO: Send notification via notification service
  // For now, log the notification
  console.log('[NOTIFICATION]', notification.type, '-', notification.title, 'to', data.applicantEmail);

  return notification;
}

/**
 * Helper to send batch notifications for season finalization
 * Sends allocation notifications to all approved applicants
 *
 * @param applications - Array of applications with required notification data
 * @returns Array of created notifications
 */
export function sendBatchAllocationNotifications(applications: Array<{
  id: string;
  applicantEmail: string;
  applicantName: string;
  seasonName: string;
  listingName: string;
  weekday: number;
  startTime: string;
  endTime: string;
  bookingsCreated?: number;
}>): Array<any> {
  const notifications = [];

  for (const app of applications) {
    const notification = createApplicationNotification({
      type: 'application_allocated',
      applicationId: app.id,
      applicantEmail: app.applicantEmail,
      applicantName: app.applicantName,
      seasonName: app.seasonName,
      listingName: app.listingName,
      weekday: app.weekday,
      startTime: app.startTime,
      endTime: app.endTime,
      bookingsCreated: app.bookingsCreated,
    });

    notifications.push(notification);
  }

  // Log batch summary
  console.log(`[BATCH NOTIFICATION] Sent ${notifications.length} allocation notifications`);

  return notifications;
}

interface TenantRequest extends FastifyRequest {
  tenantId?: string | null;
  userId?: string | null;
}

@Controller('/api/season-applications')
export class SeasonApplicationsController {
  @Get()
  async findAll(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { seasonId, listingId, organizationId, status, page = 1, limit = 20 } = request.query as any;

    // Build conditions
    const conditions = [];
    if (seasonId) conditions.push(eq(seasonApplications.seasonId, seasonId));
    if (listingId) conditions.push(eq(seasonApplications.listingId, listingId));
    if (organizationId) conditions.push(eq(seasonApplications.organizationId, organizationId));
    if (status) conditions.push(eq(seasonApplications.status, status));

    const result = await db
      .select({
        id: seasonApplications.id,
        tenantId: seasonApplications.tenantId,
        seasonId: seasonApplications.seasonId,
        seasonName: seasons.name,
        listingId: seasonApplications.listingId,
        listingName: listings.name,
        organizationId: seasonApplications.organizationId,
        organizationName: organizations.name,
        applicantName: seasonApplications.applicantName,
        applicantEmail: seasonApplications.applicantEmail,
        applicantPhone: seasonApplications.applicantPhone,
        weekday: seasonApplications.weekday,
        startTime: seasonApplications.startTime,
        endTime: seasonApplications.endTime,
        status: seasonApplications.status,
        priority: seasonApplications.priority,
        notes: seasonApplications.notes,
        rejectionReason: seasonApplications.rejectionReason,
        metadata: seasonApplications.metadata,
        createdAt: seasonApplications.createdAt,
        updatedAt: seasonApplications.updatedAt,
      })
      .from(seasonApplications)
      .leftJoin(seasons, eq(seasonApplications.seasonId, seasons.id))
      .leftJoin(listings, eq(seasonApplications.listingId, listings.id))
      .leftJoin(organizations, eq(seasonApplications.organizationId, organizations.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(seasonApplications.createdAt)
      .limit(Number(limit))
      .offset((Number(page) - 1) * Number(limit));

    // Get total count
    const countResult = await db
      .select({ count: count() })
      .from(seasonApplications)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = Number(countResult[0]?.count || 0);

    return {
      data: result,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  @Get('/:id')
  async findOne(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { id } = request.params as any;

    const result = await db
      .select({
        id: seasonApplications.id,
        tenantId: seasonApplications.tenantId,
        seasonId: seasonApplications.seasonId,
        seasonName: seasons.name,
        listingId: seasonApplications.listingId,
        listingName: listings.name,
        organizationId: seasonApplications.organizationId,
        organizationName: organizations.name,
        applicantName: seasonApplications.applicantName,
        applicantEmail: seasonApplications.applicantEmail,
        applicantPhone: seasonApplications.applicantPhone,
        weekday: seasonApplications.weekday,
        startTime: seasonApplications.startTime,
        endTime: seasonApplications.endTime,
        status: seasonApplications.status,
        priority: seasonApplications.priority,
        notes: seasonApplications.notes,
        rejectionReason: seasonApplications.rejectionReason,
        metadata: seasonApplications.metadata,
        createdAt: seasonApplications.createdAt,
        updatedAt: seasonApplications.updatedAt,
      })
      .from(seasonApplications)
      .leftJoin(seasons, eq(seasonApplications.seasonId, seasons.id))
      .leftJoin(listings, eq(seasonApplications.listingId, listings.id))
      .leftJoin(organizations, eq(seasonApplications.organizationId, organizations.id))
      .where(eq(seasonApplications.id, id));

    if (!result.length) {
      reply.code(404);
      return { error: 'Season application not found' };
    }

    return { data: result[0] };
  }

  @Post()
  async create(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const tenantId = request.tenantId || 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const body = request.body as any;

    const result = await db
      .insert(seasonApplications)
      .values({
        tenantId,
        seasonId: body.seasonId,
        listingId: body.listingId,
        organizationId: body.organizationId,
        applicantName: body.applicantName,
        applicantEmail: body.applicantEmail,
        applicantPhone: body.applicantPhone || null,
        weekday: body.weekday,
        startTime: body.startTime,
        endTime: body.endTime,
        priority: body.priority || null,
        notes: body.notes || null,
        metadata: body.metadata || {},
      })
      .returning();

    reply.code(201);
    return { data: result[0] };
  }

  @Put('/:id')
  async update(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { id } = request.params as any;
    const body = request.body as any;

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.applicantName !== undefined) updateData.applicantName = body.applicantName;
    if (body.applicantEmail !== undefined) updateData.applicantEmail = body.applicantEmail;
    if (body.applicantPhone !== undefined) updateData.applicantPhone = body.applicantPhone;
    if (body.weekday !== undefined) updateData.weekday = body.weekday;
    if (body.startTime !== undefined) updateData.startTime = body.startTime;
    if (body.endTime !== undefined) updateData.endTime = body.endTime;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.rejectionReason !== undefined) updateData.rejectionReason = body.rejectionReason;
    if (body.metadata !== undefined) updateData.metadata = body.metadata;

    const result = await db
      .update(seasonApplications)
      .set(updateData)
      .where(eq(seasonApplications.id, id))
      .returning();

    if (!result.length) {
      reply.code(404);
      return { error: 'Season application not found' };
    }

    return { data: result[0] };
  }

  @Delete('/:id')
  async delete(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { id } = request.params as any;

    const result = await db
      .delete(seasonApplications)
      .where(eq(seasonApplications.id, id))
      .returning();

    if (!result.length) {
      reply.code(404);
      return { error: 'Season application not found' };
    }

    reply.code(204);
    return;
  }

  /**
   * PUT /api/season-applications/:id/approve - Approve application
   */
  @Put('/:id/approve')
  async approve(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { id } = request.params as any;

    // Get application details before updating
    const applicationData = await db
      .select({
        id: seasonApplications.id,
        seasonId: seasonApplications.seasonId,
        listingId: seasonApplications.listingId,
        applicantName: seasonApplications.applicantName,
        applicantEmail: seasonApplications.applicantEmail,
        weekday: seasonApplications.weekday,
        startTime: seasonApplications.startTime,
        endTime: seasonApplications.endTime,
        seasonName: seasons.name,
        listingName: listings.name,
      })
      .from(seasonApplications)
      .leftJoin(seasons, eq(seasonApplications.seasonId, seasons.id))
      .leftJoin(listings, eq(seasonApplications.listingId, listings.id))
      .where(eq(seasonApplications.id, id))
      .limit(1);

    if (!applicationData.length) {
      reply.code(404);
      return { error: 'Season application not found' };
    }

    const application = applicationData[0];

    const result = await db
      .update(seasonApplications)
      .set({
        status: 'approved',
        updatedAt: new Date(),
      })
      .where(eq(seasonApplications.id, id))
      .returning();

    if (!result.length) {
      reply.code(404);
      return { error: 'Season application not found' };
    }

    // Send notification for approval
    createApplicationNotification({
      type: 'application_approved',
      applicationId: id,
      applicantEmail: application.applicantEmail,
      applicantName: application.applicantName,
      seasonName: application.seasonName || 'Ukjent sesong',
      listingName: application.listingName || 'Ukjent lokale',
      weekday: application.weekday,
      startTime: application.startTime,
      endTime: application.endTime,
    });

    return { data: result[0] };
  }

  /**
   * PUT /api/season-applications/:id/reject - Reject application
   */
  @Put('/:id/reject')
  async reject(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { id } = request.params as any;
    const body = (request.body as any) || {};

    // Get application details before updating
    const applicationData = await db
      .select({
        id: seasonApplications.id,
        seasonId: seasonApplications.seasonId,
        listingId: seasonApplications.listingId,
        applicantName: seasonApplications.applicantName,
        applicantEmail: seasonApplications.applicantEmail,
        weekday: seasonApplications.weekday,
        startTime: seasonApplications.startTime,
        endTime: seasonApplications.endTime,
        seasonName: seasons.name,
        listingName: listings.name,
      })
      .from(seasonApplications)
      .leftJoin(seasons, eq(seasonApplications.seasonId, seasons.id))
      .leftJoin(listings, eq(seasonApplications.listingId, listings.id))
      .where(eq(seasonApplications.id, id))
      .limit(1);

    if (!applicationData.length) {
      reply.code(404);
      return { error: 'Season application not found' };
    }

    const application = applicationData[0];

    const result = await db
      .update(seasonApplications)
      .set({
        status: 'rejected',
        rejectionReason: body.rejectionReason || null,
        updatedAt: new Date(),
      })
      .where(eq(seasonApplications.id, id))
      .returning();

    if (!result.length) {
      reply.code(404);
      return { error: 'Season application not found' };
    }

    // Send notification for rejection
    createApplicationNotification({
      type: 'application_rejected',
      applicationId: id,
      applicantEmail: application.applicantEmail,
      applicantName: application.applicantName,
      seasonName: application.seasonName || 'Ukjent sesong',
      listingName: application.listingName || 'Ukjent lokale',
      weekday: application.weekday,
      startTime: application.startTime,
      endTime: application.endTime,
      rejectionReason: body.rejectionReason || null,
    });

    return { data: result[0] };
  }

  /**
   * POST /api/season-applications/:id/allocate - Generate recurring bookings from approved application
   * KRAV-ADM-07: Generere tilbakevendende bookinger fra godkjent søknad
   */
  @Post('/:id/allocate')
  async allocate(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { id } = request.params as any;
    const tenantId = request.tenantId || 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const userId = request.userId || 'f47ac10b-58cc-4372-a567-0e02b2c3d480';

    // Get the application with related data for notifications
    const applicationData = await db
      .select({
        id: seasonApplications.id,
        tenantId: seasonApplications.tenantId,
        seasonId: seasonApplications.seasonId,
        listingId: seasonApplications.listingId,
        organizationId: seasonApplications.organizationId,
        applicantName: seasonApplications.applicantName,
        applicantEmail: seasonApplications.applicantEmail,
        weekday: seasonApplications.weekday,
        startTime: seasonApplications.startTime,
        endTime: seasonApplications.endTime,
        status: seasonApplications.status,
        seasonName: seasons.name,
        listingName: listings.name,
      })
      .from(seasonApplications)
      .leftJoin(seasons, eq(seasonApplications.seasonId, seasons.id))
      .leftJoin(listings, eq(seasonApplications.listingId, listings.id))
      .where(eq(seasonApplications.id, id))
      .limit(1);

    if (!applicationData.length) {
      reply.code(404);
      return { error: 'Season application not found' };
    }

    const app = applicationData[0];

    // Verify application is approved
    if (app.status !== 'approved') {
      reply.code(400);
      return { error: 'Only approved applications can be allocated' };
    }

    // Get the season details for date range
    const season = await db
      .select()
      .from(seasons)
      .where(eq(seasons.id, app.seasonId))
      .limit(1);

    if (!season.length) {
      reply.code(404);
      return { error: 'Season not found' };
    }

    const seasonData = season[0];

    // Generate recurring booking dates
    const bookingDates = this.generateRecurringDates(
      new Date(seasonData.startDate),
      new Date(seasonData.endDate),
      app.weekday
    );

    // Create bookings for each date
    const createdBookings = [];
    for (const date of bookingDates) {
      const [startHour, startMinute] = app.startTime.split(':').map(Number);
      const [endHour, endMinute] = app.endTime.split(':').map(Number);

      const startTime = new Date(date);
      startTime.setHours(startHour, startMinute, 0, 0);

      const endTime = new Date(date);
      endTime.setHours(endHour, endMinute, 0, 0);

      const booking = await db
        .insert(bookings)
        .values({
          tenantId,
          listingId: app.listingId,
          userId,
          status: 'confirmed',
          startTime,
          endTime,
          notes: `Seasonal allocation for ${app.applicantName}`,
          metadata: {
            seasonApplicationId: app.id,
            seasonId: app.seasonId,
            organizationId: app.organizationId,
            allocationType: 'seasonal',
          },
        })
        .returning();

      createdBookings.push(booking[0]);
    }

    // Send notification for allocation
    createApplicationNotification({
      type: 'application_allocated',
      applicationId: id,
      applicantEmail: app.applicantEmail,
      applicantName: app.applicantName,
      seasonName: app.seasonName || 'Ukjent sesong',
      listingName: app.listingName || 'Ukjent lokale',
      weekday: app.weekday,
      startTime: app.startTime,
      endTime: app.endTime,
      bookingsCreated: createdBookings.length,
    });

    return {
      data: {
        applicationId: id,
        seasonId: app.seasonId,
        listingId: app.listingId,
        organizationId: app.organizationId,
        bookingsCreated: createdBookings.length,
        bookings: createdBookings,
      },
    };
  }

  /**
   * Helper method to generate recurring dates for a specific weekday
   * @param startDate - Season start date
   * @param endDate - Season end date
   * @param weekday - Day of week (0=Sunday, 1=Monday, etc.)
   */
  private generateRecurringDates(startDate: Date, endDate: Date, weekday: number): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);

    // Move to first occurrence of the weekday
    while (currentDate.getDay() !== weekday && currentDate <= endDate) {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Collect all occurrences of the weekday
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 7);
    }

    return dates;
  }

  /**
   * GET /api/season-applications/conflicts - Detect conflicts between applications
   * KRAV-ADM-04: Konfliktdeteksjon mellom søknader
   */
  @Get('/conflicts')
  async getConflicts(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { seasonId, listingId } = request.query as any;

    if (!seasonId || !listingId) {
      reply.code(400);
      return { error: 'seasonId and listingId are required' };
    }

    // Get all applications for this season and listing
    const applications = await db
      .select({
        id: seasonApplications.id,
        organizationName: organizations.name,
        weekday: seasonApplications.weekday,
        startTime: seasonApplications.startTime,
        endTime: seasonApplications.endTime,
        status: seasonApplications.status,
      })
      .from(seasonApplications)
      .leftJoin(organizations, eq(seasonApplications.organizationId, organizations.id))
      .where(
        and(
          eq(seasonApplications.seasonId, seasonId),
          eq(seasonApplications.listingId, listingId),
          eq(seasonApplications.status, 'pending')
        )
      );

    // Detect conflicts (same weekday + overlapping time)
    const conflicts = [];
    for (let i = 0; i < applications.length; i++) {
      for (let j = i + 1; j < applications.length; j++) {
        const app1 = applications[i];
        const app2 = applications[j];

        if (app1.weekday === app2.weekday) {
          // Check time overlap
          const start1 = app1.startTime;
          const end1 = app1.endTime;
          const start2 = app2.startTime;
          const end2 = app2.endTime;

          if (start1 < end2 && start2 < end1) {
            conflicts.push({
              application1: {
                id: app1.id,
                organizationName: app1.organizationName,
                weekday: app1.weekday,
                timeSlot: `${start1}-${end1}`,
              },
              application2: {
                id: app2.id,
                organizationName: app2.organizationName,
                weekday: app2.weekday,
                timeSlot: `${start2}-${end2}`,
              },
              conflictType: 'time_overlap',
              severity: 'high',
            });
          }
        }
      }
    }

    return {
      data: {
        seasonId,
        listingId,
        totalApplications: applications.length,
        conflicts,
      },
    };
  }

  /**
   * GET /api/season-applications/stats - Get application statistics
   */
  @Get('/stats')
  async getStats(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { seasonId } = request.query as any;

    const conditions = [];
    if (seasonId) conditions.push(eq(seasonApplications.seasonId, seasonId));

    // Get status breakdown
    const statusStats = await db
      .select({
        status: seasonApplications.status,
        count: count(),
      })
      .from(seasonApplications)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(seasonApplications.status);

    // Get total applications
    const totalResult = await db
      .select({ count: count() })
      .from(seasonApplications)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return {
      data: {
        seasonId: seasonId || 'all',
        total: Number(totalResult[0]?.count || 0),
        byStatus: statusStats.map((stat: any) => ({
          status: stat.status,
          count: Number(stat.count),
        })),
      },
    };
  }
}
