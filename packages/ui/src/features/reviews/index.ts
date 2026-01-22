/**
 * @digilist/ui - Reviews Feature Kit
 *
 * Reusable components for displaying and managing reviews.
 *
 * ## Usage
 *
 * ```tsx
 * import {
 *   ReviewCard,
 *   mapReviewDTOToCardProps,
 * } from '@digilist/ui/features/reviews';
 * import { useListingReviews } from '@digilist/client-sdk';
 *
 * function ReviewsSection({ rentalObjectId }) {
 *   const { data } = useListingReviews(rentalObjectId);
 *   const reviews = data?.data || [];
 *
 *   return (
 *     <>
 *       {reviews.map((review) => (
 *         <ReviewCard
 *           key={review.id}
 *           review={mapReviewDTOToCardProps(review)}
 *           showHelpfulCount
 *         />
 *       ))}
 *     </>
 *   );
 * }
 * ```
 *
 * ## Components
 *
 * - `ReviewCard` - Displays a single review with rating, comment, and metadata
 *
 * ## Mappers
 *
 * - `mapReviewDTOToCardProps` - Maps SDK Review DTO to ReviewCard props
 */

// Components
export { ReviewCard, type ReviewCardProps, type ReviewData, type ReviewStatus } from './components';

// Mappers
export { mapReviewDTOToCardProps, type ReviewDTO } from './mappers';
