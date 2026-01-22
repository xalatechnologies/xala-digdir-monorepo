/**
 * @digilist/ui - Review Mappers
 *
 * Maps SDK Review DTOs to ReviewCard props.
 */
import type { ReviewData, ReviewStatus } from './components/ReviewCard';

/**
 * Review DTO from SDK
 * Compatible with @digilist/client-sdk Review type
 */
export interface ReviewDTO {
  id: string;
  userName?: string;
  rating: number;
  comment?: string;
  createdAt: string;
  status: string;
  metadata?: {
    helpfulCount?: number;
    moderatorNotes?: string;
  };
}

/**
 * Maps a Review DTO from SDK to ReviewCard props.
 *
 * @example
 * ```tsx
 * import { mapReviewDTOToCardProps } from '@digilist/ui/features/reviews';
 * import { useListingReviews } from '@digilist/client-sdk';
 *
 * function ReviewsSection({ rentalObjectId }) {
 *   const { data } = useListingReviews(rentalObjectId);
 *   const reviews = data?.data || [];
 *
 *   return (
 *     <>
 *       {reviews.map((review) => (
 *         <ReviewCard key={review.id} review={mapReviewDTOToCardProps(review)} />
 *       ))}
 *     </>
 *   );
 * }
 * ```
 */
export function mapReviewDTOToCardProps(dto: ReviewDTO): ReviewData {
  return {
    id: dto.id,
    userName: dto.userName,
    rating: dto.rating,
    comment: dto.comment,
    createdAt: dto.createdAt,
    status: dto.status as ReviewStatus,
    metadata: dto.metadata,
  };
}
