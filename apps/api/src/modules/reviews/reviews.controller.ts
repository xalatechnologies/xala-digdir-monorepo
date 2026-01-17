/**
 * Reviews Controller
 *
 * API endpoints for rental object reviews
 * - GET /api/reviews - List all reviews
 * - GET /api/reviews/rental-object/:rentalObjectId - Get reviews for a rental object (primary)
 * - GET /api/reviews/listing/:rentalObjectId - Get reviews for a listing (deprecated, backward compatibility)
 * - GET /api/reviews/:id - Get single review
 * - POST /api/reviews - Submit a new review
 * - PATCH /api/reviews/:id - Update review (admin)
 * - DELETE /api/reviews/:id - Delete review (admin)
 */
import { Controller, Get, Post, Patch, Delete } from '../../core/decorators';
import type { FastifyRequest, FastifyReply } from 'fastify';

interface TenantRequest extends FastifyRequest {
  tenantId?: string | null;
  userId?: string | null;
}

// Mock reviews data
const mockReviews = [
  {
    id: 'review-001',
    rentalObjectId: '10000012-0000-0000-0000-000000000001',
    userId: 'user-001',
    userName: 'Erik Hansen',
    rating: 5,
    title: 'Flott anlegg!',
    comment: 'Veldig bra fasiliteter og enkelt å booke. Anbefales!',
    status: 'approved',
    createdAt: '2026-01-10T14:30:00Z',
    updatedAt: '2026-01-10T14:30:00Z',
  },
  {
    id: 'review-002',
    rentalObjectId: '10000012-0000-0000-0000-000000000001',
    userId: 'user-002',
    userName: 'Kari Olsen',
    rating: 4,
    title: 'God opplevelse',
    comment: 'Fint lokale, men parkeringen kunne vært bedre.',
    status: 'approved',
    createdAt: '2026-01-08T09:00:00Z',
    updatedAt: '2026-01-08T09:00:00Z',
  },
  {
    id: 'review-003',
    rentalObjectId: '10000012-0000-0000-0000-000000000002',
    userId: 'user-003',
    userName: 'Per Nilsen',
    rating: 5,
    title: 'Perfekt for fotballtrening',
    comment: 'Gresset er i topp stand. Bookingprosessen var smidig.',
    status: 'approved',
    createdAt: '2026-01-05T16:00:00Z',
    updatedAt: '2026-01-05T16:00:00Z',
  },
  {
    id: 'review-004',
    rentalObjectId: '10000012-0000-0000-0000-000000000003',
    userId: 'user-004',
    userName: 'Lisa Berg',
    rating: 4,
    title: 'Bra svømmehall',
    comment: 'Rent og pent, men litt trangt i garderoben.',
    status: 'approved',
    createdAt: '2026-01-03T11:00:00Z',
    updatedAt: '2026-01-03T11:00:00Z',
  },
  {
    id: 'review-005',
    rentalObjectId: '10000012-0000-0000-0000-000000000005',
    userId: 'user-005',
    userName: 'Morten Stein',
    rating: 5,
    title: 'Topp fasiliteter',
    comment: 'Alt fungerte som det skulle. Kommer tilbake!',
    status: 'approved',
    createdAt: '2026-01-12T15:00:00Z',
    updatedAt: '2026-01-12T15:00:00Z',
  },
];

@Controller('/api/reviews')
export class ReviewsController {
  /**
   * GET /api/reviews - List all reviews
   */
  @Get('/')
  async listReviews(request: TenantRequest, reply: FastifyReply) {
    const { status, limit, offset } = request.query as any;

    let reviews = [...mockReviews];

    if (status) {
      reviews = reviews.filter(r => r.status === status);
    }

    const total = reviews.length;
    const start = Number(offset || 0);
    const end = limit ? start + Number(limit) : reviews.length;
    reviews = reviews.slice(start, end);

    return {
      success: true,
      data: reviews,
      meta: {
        total,
        limit: Number(limit) || total,
        offset: start,
      },
    };
  }

  /**
   * GET /api/reviews/rental-object/:rentalObjectId - Get reviews for a specific rental object
   */
  @Get('/rental-object/:rentalObjectId')
  async getRentalObjectReviews(request: TenantRequest, reply: FastifyReply) {
    const { rentalObjectId } = request.params as any;
    const { status, limit } = request.query as any;

    let reviews = mockReviews.filter(r => r.rentalObjectId === rentalObjectId);

    if (status) {
      reviews = reviews.filter(r => r.status === status);
    }

    if (limit) {
      reviews = reviews.slice(0, Number(limit));
    }

    // Calculate stats
    const stats = {
      totalReviews: reviews.length,
      averageRating: reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0,
      ratingDistribution: {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length,
      },
    };

    return {
      success: true,
      data: reviews,
      meta: {
        total: reviews.length,
        stats,
      },
    };
  }

  /**
   * GET /api/reviews/rental-object/:rentalObjectId/stats - Get review statistics for a rental object
   */
  @Get('/rental-object/:rentalObjectId/stats')
  async getRentalObjectReviewStats(request: TenantRequest, reply: FastifyReply) {
    const { rentalObjectId } = request.params as any;
    const reviews = mockReviews.filter(r => r.rentalObjectId === rentalObjectId);

    const stats = {
      totalReviews: reviews.length,
      averageRating: reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0,
      ratingDistribution: {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length,
      },
    };

    return {
      success: true,
      data: stats,
    };
  }

  /**
   * GET /api/reviews/rental-object/:rentalObjectId/summary - Get review summary for a rental object
   */
  @Get('/rental-object/:rentalObjectId/summary')
  async getRentalObjectReviewSummary(request: TenantRequest, reply: FastifyReply) {
    const { rentalObjectId } = request.params as any;
    const { limit = 5 } = request.query as any;

    const reviews = mockReviews
      .filter(r => r.rentalObjectId === rentalObjectId && r.status === 'approved')
      .slice(0, Number(limit));

    const stats = {
      totalReviews: mockReviews.filter(r => r.rentalObjectId === rentalObjectId).length,
      averageRating: mockReviews.filter(r => r.rentalObjectId === rentalObjectId).length > 0
        ? mockReviews.filter(r => r.rentalObjectId === rentalObjectId).reduce((sum, r) => sum + r.rating, 0) / mockReviews.filter(r => r.rentalObjectId === rentalObjectId).length
        : 0,
      ratingDistribution: {
        5: mockReviews.filter(r => r.rentalObjectId === rentalObjectId && r.rating === 5).length,
        4: mockReviews.filter(r => r.rentalObjectId === rentalObjectId && r.rating === 4).length,
        3: mockReviews.filter(r => r.rentalObjectId === rentalObjectId && r.rating === 3).length,
        2: mockReviews.filter(r => r.rentalObjectId === rentalObjectId && r.rating === 2).length,
        1: mockReviews.filter(r => r.rentalObjectId === rentalObjectId && r.rating === 1).length,
      },
    };

    return {
      success: true,
      data: {
        stats,
        recentReviews: reviews,
      },
    };
  }

  /**
   * GET /api/reviews/listing/:rentalObjectId - Get reviews for a specific listing (deprecated)
   * @deprecated Use /rental-object/:rentalObjectId instead
   */
  @Get('/listing/:rentalObjectId')
  async getListingReviews(request: TenantRequest, reply: FastifyReply) {
    // Forward to rental object endpoint for backward compatibility
    const { rentalObjectId } = request.params as any;
    request.params = { rentalObjectId: rentalObjectId } as any;
    return this.getRentalObjectReviews(request, reply);
  }

  /**
   * GET /api/reviews/listing/:rentalObjectId/stats - Get review statistics (deprecated)
   * @deprecated Use /rental-object/:rentalObjectId/stats instead
   */
  @Get('/listing/:rentalObjectId/stats')
  async getListingReviewStats(request: TenantRequest, reply: FastifyReply) {
    const { rentalObjectId } = request.params as any;
    request.params = { rentalObjectId: rentalObjectId } as any;
    return this.getRentalObjectReviewStats(request, reply);
  }

  /**
   * GET /api/reviews/listing/:rentalObjectId/summary - Get review summary (deprecated)
   * @deprecated Use /rental-object/:rentalObjectId/summary instead
   */
  @Get('/listing/:rentalObjectId/summary')
  async getListingReviewSummary(request: TenantRequest, reply: FastifyReply) {
    const { rentalObjectId } = request.params as any;
    request.params = { rentalObjectId: rentalObjectId } as any;
    return this.getRentalObjectReviewSummary(request, reply);
  }

  /**
   * GET /api/reviews/:id - Get single review
   */
  @Get('/:id')
  async getReview(request: TenantRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    const review = mockReviews.find(r => r.id === id);

    if (!review) {
      reply.code(404);
      return {
        success: false,
        error: {
          code: 'REVIEW_NOT_FOUND',
          message: 'Review not found',
        },
      };
    }

    return {
      success: true,
      data: review,
    };
  }

  /**
   * POST /api/reviews - Submit a new review
   */
  @Post('/')
  async createReview(request: TenantRequest, reply: FastifyReply) {
    const { rentalObjectId, rating, title, comment } = request.body as any;

    if (!rentalObjectId || !rating || !title) {
      reply.code(400);
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'rentalObjectId, rating, and title are required',
        },
      };
    }

    const newReview = {
      id: `review-${Date.now()}`,
      rentalObjectId,
      userId: request.userId || 'anonymous',
      userName: 'Anonym bruker',
      rating: Number(rating),
      title,
      comment: comment || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: newReview,
    };
  }

  /**
   * PATCH /api/reviews/:id - Update review (admin moderation)
   */
  @Patch('/:id')
  async updateReview(request: TenantRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    const { status, adminNote } = request.body as any;

    const review = mockReviews.find(r => r.id === id);

    if (!review) {
      reply.code(404);
      return {
        success: false,
        error: {
          code: 'REVIEW_NOT_FOUND',
          message: 'Review not found',
        },
      };
    }

    const updatedReview = {
      ...review,
      status: status || review.status,
      adminNote,
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: updatedReview,
    };
  }

  /**
   * DELETE /api/reviews/:id - Delete review
   */
  @Delete('/:id')
  async deleteReview(request: TenantRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    const review = mockReviews.find(r => r.id === id);

    if (!review) {
      reply.code(404);
      return {
        success: false,
        error: {
          code: 'REVIEW_NOT_FOUND',
          message: 'Review not found',
        },
      };
    }

    return {
      success: true,
      message: 'Review deleted successfully',
    };
  }

  // ===================================================================
  // MODERATION ENDPOINTS
  // ===================================================================

  /**
   * GET /api/reviews/moderation/pending - Get pending reviews for moderation
   */
  @Get('/moderation/pending')
  async getPendingReviews(request: TenantRequest, reply: FastifyReply) {
    const pending = mockReviews.filter(r => r.status === 'pending');
    
    return {
      data: pending,
      meta: {
        total: pending.length,
        oldest: pending.length > 0 ? pending[pending.length - 1].createdAt : null,
      },
    };
  }

  /**
   * POST /api/reviews/:id/approve - Approve a review
   */
  @Post('/:id/approve')
  async approveReview(request: TenantRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    const review = mockReviews.find(r => r.id === id);

    if (!review) {
      reply.code(404);
      return {
        type: 'https://api.digilist.no/errors/not-found',
        title: 'Review Not Found',
        status: 404,
      };
    }

    const updatedReview = {
      ...review,
      status: 'approved',
      moderatedAt: new Date().toISOString(),
      moderatedBy: request.userId || 'admin',
    };

    return { data: updatedReview };
  }

  /**
   * POST /api/reviews/:id/reject - Reject a review
   */
  @Post('/:id/reject')
  async rejectReview(request: TenantRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    const { reason } = request.body as { reason?: string };
    const review = mockReviews.find(r => r.id === id);

    if (!review) {
      reply.code(404);
      return {
        type: 'https://api.digilist.no/errors/not-found',
        title: 'Review Not Found',
        status: 404,
      };
    }

    if (!reason) {
      reply.code(400);
      return {
        type: 'https://api.digilist.no/errors/validation-error',
        title: 'Validation Error',
        status: 400,
        detail: 'Rejection reason is required',
      };
    }

    const updatedReview = {
      ...review,
      status: 'rejected',
      rejectionReason: reason,
      moderatedAt: new Date().toISOString(),
      moderatedBy: request.userId || 'admin',
    };

    return { data: updatedReview };
  }

  /**
   * POST /api/reviews/:id/flag - Flag a review for attention
   */
  @Post('/:id/flag')
  async flagReview(request: TenantRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    const { reason } = request.body as { reason?: string };
    const review = mockReviews.find(r => r.id === id);

    if (!review) {
      reply.code(404);
      return {
        type: 'https://api.digilist.no/errors/not-found',
        title: 'Review Not Found',
        status: 404,
      };
    }

    const updatedReview = {
      ...review,
      flagged: true,
      flagReason: reason,
      flaggedAt: new Date().toISOString(),
      flaggedBy: request.userId || 'anonymous',
    };

    return { data: updatedReview };
  }
}

// Backward compatibility alias (deprecated - use ReviewsController instead)
export { ReviewsController as RentalObjectReviewsController };
