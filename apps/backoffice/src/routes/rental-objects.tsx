/**
 * Rental Objects Routes
 * Page components for the rental objects (utleieobjekter) module
 */

import { useParams } from 'react-router-dom';
import { RentalObjectsListView } from '../features/rental-objects/components/RentalObjectsListView';
import { RentalObjectWizard } from '../features/rental-objects/components/wizard';
import { RentalObjectDetailView } from '../features/rental-objects/components/detail';

/**
 * Rental Objects Page - Main list view with category tabs and filtering
 */
export function RentalObjectsPage(): React.ReactElement {
  return <RentalObjectsListView />;
}

/**
 * Rental Object Edit Page - Multi-step wizard for create/edit
 */
export function RentalObjectEditPage(): React.ReactElement {
  const { slug } = useParams<{ slug: string }>();

  return <RentalObjectWizard slug={slug} />;
}

/**
 * Rental Object Detail Page - Comprehensive view with tabs
 */
export function RentalObjectDetailPage(): React.ReactElement {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return <div>Not found</div>;
  }

  return <RentalObjectDetailView slug={slug} />;
}
