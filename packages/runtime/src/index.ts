/**
 * @digilist/runtime
 *
 * Domain-specific runtime providers for the Digilist rental booking platform.
 *
 * This package extends @xala/runtime with Digilist-specific contexts like
 * AccountContextProvider, BookingContextProvider, and RentalObjectContextProvider.
 *
 * ## Quick Start
 *
 * ```tsx
 * import { DigilistProvider } from '@digilist/runtime';
 *
 * function App() {
 *   return (
 *     <DigilistProvider
 *       config={{
 *         appType: 'backoffice',
 *         apiUrl: 'https://api.digilist.no',
 *         tenantId: 'oslo-kommune',
 *         locale: 'nb',
 *         theme: 'digilist',
 *         colorScheme: 'auto',
 *       }}
 *       storageKeyPrefix="backoffice"
 *     >
 *       <BrowserRouter>
 *         <Routes />
 *       </BrowserRouter>
 *     </DigilistProvider>
 *   );
 * }
 * ```
 *
 * ## Usage with Account Context
 *
 * ```tsx
 * import { useAccountContext, useDigilistRuntime } from '@digilist/runtime';
 *
 * function Dashboard() {
 *   const { accountType, selectedOrganization } = useAccountContext();
 *   // Or use the unified hook:
 *   const { account, isOrganizationMode } = useDigilistRuntime();
 *
 *   return (
 *     <div>
 *       Mode: {isOrganizationMode ? 'Organization' : 'Personal'}
 *     </div>
 *   );
 * }
 * ```
 *
 * ## Usage with Booking Context
 *
 * ```tsx
 * import { BookingContextProvider, useBookingContext } from '@digilist/runtime';
 *
 * function BookingPage() {
 *   return (
 *     <BookingContextProvider initialRentalObjectId="venue-123">
 *       <BookingWizard />
 *     </BookingContextProvider>
 *   );
 * }
 *
 * function BookingWizard() {
 *   const { flowState, nextStep, completeBooking } = useBookingContext();
 *   return <div>Step: {flowState.currentStep}</div>;
 * }
 * ```
 *
 * ## Usage with Rental Object Context
 *
 * ```tsx
 * import { RentalObjectContextProvider, useRentalObjectContext } from '@digilist/runtime';
 *
 * function DiscoveryPage() {
 *   return (
 *     <RentalObjectContextProvider loadFeatured>
 *       <FilterBar />
 *       <RentalObjectGrid />
 *     </RentalObjectContextProvider>
 *   );
 * }
 *
 * function RentalObjectGrid() {
 *   const { uiRentalObjects, isLoading, setFilters } = useRentalObjectContext();
 *   if (isLoading) return <Spinner />;
 *   return <Grid items={uiRentalObjects} />;
 * }
 * ```
 *
 * ## Auto Profile Registration
 *
 * Importing this package automatically registers Digilist app profiles:
 *
 * ```typescript
 * import '@digilist/runtime'; // Registers profiles
 * import { getAppProfile } from '@digilist/runtime';
 *
 * const profile = getAppProfile('backoffice'); // Now works!
 * ```
 */

// =============================================================================
// Side-Effect: Register Digilist App Profiles
// =============================================================================

// Import config module to trigger profile registration
import './config';

// =============================================================================
// Re-export Config Types and Utilities
// =============================================================================

// Core config utilities
export {
  validateEnv,
  createAppConfig,
  getAppProfile,
  getAllProfiles,
  registerAppProfiles,
} from './config';

// Config types
export type {
  ValidatedEnv,
  SDKConfig,
  RuntimeConfig,
  AppConfig,
  AppProfile,
  AuthConfig,
  DigilistAppType,
  DigilistThemeId,
} from './config';

// Type guards
export { isDigilistAppType, isDigilistThemeId } from './config';

// Profile definitions
export {
  webProfile,
  minsideProfile,
  backofficeProfile,
  saasAdminProfile,
  monitoringProfile,
  docsLearningProfile,
  digilistProfiles,
  digilistProfilesRecord,
} from './config';

// =============================================================================
// Re-export Providers
// =============================================================================

export * from './providers';

// =============================================================================
// Re-export Hooks
// =============================================================================

export * from './hooks';
