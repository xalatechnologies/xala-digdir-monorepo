/**
 * Rental Objects Routes
 * Page components for the rental-objects module
 *
 * NOTE: Rental objects use rental_object terminology throughout.
 * These are equipment and resources that citizens can book.
 */

import { useParams, useSearchParams } from 'react-router-dom';
import { RentalObjectsListView } from '../features/rental-objects/components/RentalObjectsListView';
import { RentalObjectWizard } from '../features/rental-objects/components/wizard/RentalObjectWizard';
import { RentalObjectDetailView } from '../features/rental-objects/components/detail/RentalObjectDetailView';

/**
 * Rental Objects Page - Main list view with filtering and search
 */
export function RentalObjectsPage() {
  return <RentalObjectsListView />;
}

/**
 * Rental Object Edit Page - Multi-step wizard for create/edit
 */
export function RentalObjectEditPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const cloneFromId = searchParams.get('cloneFrom');

  return <RentalObjectWizard slug={slug} cloneFromId={cloneFromId || undefined} />;
}

/**
 * Rental Object Detail Page - Comprehensive view with tabs for overview, bookings, availability, and audit
 */
export function RentalObjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return null;
  }

  return <RentalObjectDetailView slug={slug} />;
}
