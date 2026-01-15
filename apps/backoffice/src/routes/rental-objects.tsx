/**
 * Rental Objects Routes
 * Page components for the rental objects (utleieobjekter) module
 */

import { useParams } from 'react-router-dom';
import { RentalObjectsListView } from '../features/rental-objects/components/RentalObjectsListView';
import { ListingWizard } from '../features/listings/components/wizard';
import { ListingDetailView } from '../features/listings/components/detail';

/**
 * Rental Objects Page - Main list view with category tabs and filtering
 */
export function RentalObjectsPage(): React.ReactElement {
  return <RentalObjectsListView />;
}

/**
 * Rental Object Edit Page - Multi-step wizard for create/edit
 * Note: Temporarily uses the existing ListingWizard until RentalObjectWizard is ready
 */
export function RentalObjectEditPage(): React.ReactElement {
  const { slug } = useParams<{ slug: string }>();

  // TODO: Replace with RentalObjectWizard when category-specific wizard is ready
  return <ListingWizard slug={slug} />;
}

/**
 * Rental Object Detail Page - Comprehensive view with tabs
 * Note: Temporarily uses the existing ListingDetailView until RentalObjectDetailView is ready
 */
export function RentalObjectDetailPage(): React.ReactElement {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return <div>Not found</div>;
  }

  // TODO: Replace with RentalObjectDetailView when ready
  return <ListingDetailView slug={slug} />;
}
