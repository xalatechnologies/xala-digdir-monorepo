/**
 * CONTRACT-FIRST DTOs
 * 
 * Three layers:
 * A) Core DTOs (stable, minimal)
 * B) Feature DTOs (new modules)
 * C) Read Models (frontend projections)
 * 
 * Rules:
 * - NO transformers in UI (server computes everything)
 * - Additive only (never remove/rename fields)
 * - Norwegian money format (kr 1.234,56)
 * - RFC 7807 errors everywhere
 */

// ========================================================================
// A) CORE DTOS (STABLE)
// ========================================================================

export interface RentalObjectDTO {
  id: string;
  tenantId: string;
  
  // Identity
  categoryKey: string;
  categoryName: string; // Localized
  typeCode: string;
  timeMode: 'PERIOD' | 'HOURLY' | 'DAILY';
  
  // Content
  title: string;
  slug: string;
  description?: string;
  
  // Location
  address?: string;
  postalCode?: string;
  city?: string;
  
  // Capacity
  capacity?: number;
  
  // Images
  images: ImageDTO[];
  
  // Status
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface BookingDTO {
  id: string;
  tenantId: string;
  rentalObjectId: string;
  userId: string;
  organizationId?: string;
  
  // Time
  startTime: string; // ISO 8601
  endTime: string;
  
  // Status
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  requiresApproval: boolean;
  
  // Pricing (summary)
  totalPrice: MoneyDTO;
  
  // Metadata
  notes?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface TimeBlockDTO {
  id: string;
  tenantId: string;
  rentalObjectId: string;
  
  blockType: 'MAINTENANCE' | 'PRIVATE_EVENT' | 'ADMIN_HOLD' | 'OTHER';
  
  // Time
  startAt: string;
  endAt: string;
  
  // Details
  reason?: string;
  
  // Ownership
  createdBy: string; // User ID
  
  createdAt: string;
}

// ========================================================================
// B) FEATURE DTOS (NEW MODULES)
// ========================================================================

// -----------------------------
// Amenities
// -----------------------------

export interface AmenityDTO {
  id: string;
  tenantId: string;
  
  code: string;
  name: string; // Localized
  description?: string;
  
  groupCode?: string;
  groupName?: string; // Localized
  
  iconKey?: string; // For UI rendering
  
  isActive: boolean;
}

export interface AmenityGroupDTO {
  code: string;
  name: string; // Localized
  amenities: AmenityDTO[];
}

// -----------------------------
// Add-ons
// -----------------------------

export interface AddOnDTO {
  id: string;
  tenantId: string;
  
  code: string;
  name: string; // Localized
  description?: string;
  
  pricingModel: 'PER_BOOKING' | 'PER_HOUR' | 'PER_DAY' | 'PER_UNIT';
  basePrice: MoneyDTO;
  
  isRequired: boolean;
  maxUnits?: number;
  
  isActive: boolean;
}

export interface AddOnLineItemDTO {
  addOnId: string;
  addOnName: string;
  quantity: number;
  unitPrice: MoneyDTO;
  totalPrice: MoneyDTO;
}

// -----------------------------
// Pricing
// -----------------------------

export interface PricingGroupDTO {
  id: string;
  tenantId: string;
  
  code: string;
  name: string; // Localized
  description?: string;
  
  memberCount?: number;
  
  isActive: boolean;
}

export interface RentalObjectPricingDTO {
  rentalObjectId: string;
  pricingGroupId?: string;
  pricingGroupName?: string;
  
  basePriceCents: number;
  basePrice: MoneyDTO;
  
  // Discounts/markup
  discountPercentage?: number;
  
  // Deposits
  requiresDeposit: boolean;
  depositAmount?: MoneyDTO;
  
  // Taxes
  taxRate: number; // 0.25 = 25% MVA
}

export interface PriceRuleDTO {
  id: string;
  rentalObjectId: string;
  
  ruleType: 'DISCOUNT' | 'MARKUP' | 'MINIMUM' | 'MAXIMUM';
  
  // Conditions
  minDuration?: number; // minutes
  maxDuration?: number;
  validFrom?: string;
  validTo?: string;
  
  // Discount/markup
  percentage?: number;
  fixedAmount?: MoneyDTO;
}

// -----------------------------
// Availability
// -----------------------------

export interface OpeningHoursDTO {
  rentalObjectId: string;
  
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
  openTime: string; // "09:00"
  closeTime: string; // "17:00"
  
  isClosed: boolean;
}

export interface ExceptionDayDTO {
  id: string;
  rentalObjectId: string;
  
  date: string; // YYYY-MM-DD
  reason: string;
  
  isClosed: boolean;
  
  // Override hours
  openTime?: string;
  closeTime?: string;
}

// -----------------------------
// Metadata
// -----------------------------

export interface MetadataDefinitionDTO {
  id: string;
  tenantId: string;
  
  code: string;
  name: string; // Localized
  
  valueType: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'SELECT';
  unit?: string;
  
  // For SELECT type
  selectOptions?: string[];
  
  categoryKeys?: string[]; // Which categories use this
  
  isRequired: boolean;
 isActive: boolean;
}

export interface MetadataValueDTO {
  definitionCode: string;
  definitionName: string;
  value: string | number | boolean | Date;
  valueType: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'DATE';
  unit?: string;
}

// -----------------------------
// Conversations
// -----------------------------

export interface ConversationDTO {
  id: string;
  tenantId: string;
  
  subject?: string;
  
  participants: UserBaseDTO[];
  
  lastMessage?: MessagePreviewDTO;
  unreadCount: number;
  
  status: 'ACTIVE' | 'ARCHIVED';
  
  createdAt: string;
  updatedAt: string;
}

export interface MessageDTO {
  id: string;
  conversationId: string;
  
  senderId: string;
  senderName: string;
  
  content: string;
  attachments?: AttachmentDTO[];
  
  visibility: 'PUBLIC' | 'INTERNAL'; // INTERNAL = backoffice only
  
  readAt?: string;
  createdAt: string;
}

export interface MessagePreviewDTO {
  content: string; // Truncated
  senderName: string;
  createdAt: string;
}

// -----------------------------
// Notifications
// -----------------------------

export interface NotificationDTO {
  id: string;
  userId: string;
  
  type: string;
  title: string;
  message: string;
  
  data?: Record<string, unknown>;
  
  read: boolean;
  readAt?: string;
  
  createdAt: string;
}

export interface NotificationPreferencesDTO {
  userId: string;
  
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  
  // Per-category
  bookingReminders: boolean;
  caseUpdates: boolean;
  systemAnnouncements: boolean;
}

// ========================================================================
// C) READ MODELS (FRONTEND PROJECTIONS)
// ========================================================================

/**
 * Unified rental object details (replaces 10+ API calls)
 */
export interface RentalObjectDetailsDTO {
  // Core (always included)
  core: RentalObjectDTO;
  
  // Expanded sections (opt-in via ?expand= query param)
  pricing?: {
    groups: RentalObjectPricingDTO[];
    rules: PriceRuleDTO[];
    deposits?: DepositDTO[];
  };
  
  addons?: AddOnDTO[];
  
  amenities?: {
    grouped: Record<string, AmenityDTO[]>;
    flat: AmenityDTO[];
  };
  
  metadata?: Record<string, MetadataValueDTO>;
  
  availability?: {
    openingHours: OpeningHoursDTO[];
    exceptions: ExceptionDayDTO[];
    nextAvailable?: string;
  };
  
  seo?: SeoMetadataDTO;
  
  geo?: {
    area?: GeoAreaDTO;
    coordinates?: GeoCoordinatesDTO;
  };
  
  // Meta
  _expanded: string[]; // ['pricing', 'amenities']
}

/**
 * Optimized for search results (grid/list view)
 */
export interface RentalObjectSearchCardDTO {
  id: string;
  title: string;
  slug: string;
  
  category: CategoryDTO;
  
  // Location
  city?: string;
  distance?: DistanceDTO;
  
  // Image
  primaryImage?: ImageDTO;
  
  // Capacity
  capacity?: number;
  
  // Pricing (summary)
  priceFrom?: MoneyDTO;
  priceTo?: MoneyDTO;
  
  // Ratings
  ratingAvg?: number; // 0.00 to 5.00
  ratingCount?: number;
  
  // User state
  isFavorite: boolean;
}

/**
 * Calendar projection for availability view
 */
export interface AvailabilityCalendarDTO {
  rentalObjectId: string;
  month: string; // '2026-01'
  
  days: AvailabilityDayDTO[];
  blocks: TimeBlockDTO[];
  bookings: BookingSlotDTO[];
}

export interface AvailabilityDayDTO {
  date: string; // '2026-01-15'
  
  status: 'available' | 'partial' | 'booked' | 'blocked';
  
  openingHours?: { start: string; end: string }[];
  availableSlots?: number;
  
  // Server-calculated eligibility
  isBookable: boolean;
  reason?: string; // "Outside opening hours", "Fully booked", etc.
}

export interface BookingSlotDTO {
  bookingId: string;
  startTime: string;
  endTime: string;
  status: string;
  userName?: string; // If permitted
}

/**
 * Booking quote (pricing calculation)
 */
export interface BookingQuoteDTO {
  rentalObjectId: string;
  userId: string;
  
  // Time
  startTime: string;
  endTime: string;
  durationMinutes: number;
  
  // Pricing group resolution
  pricingGroup?: PricingGroupDTO;
  
  // Line items
  basePrice: MoneyDTO;
  addons: AddOnLineItemDTO[];
  discounts: DiscountLineItemDTO[];
  taxes: TaxLineItemDTO[];
  deposit?: MoneyDTO;
  
  // Total
  subtotal: MoneyDTO;
  total: MoneyDTO;
  
  // Breakdown
  breakdown: PriceBreakdownDTO[];
  
  // Currency
  currency: string; // 'NOK'
}

export interface DiscountLineItemDTO {
  name: string;
  percentage?: number;
  amount: MoneyDTO;
}

export interface TaxLineItemDTO {
  name: string; // "MVA 25%"
  rate: number; // 0.25
  amount: MoneyDTO;
}

export interface PriceBreakdownDTO {
  label: string;
  amount: MoneyDTO;
  isDiscount: boolean;
}

/**
 * User dashboard (Minside)
 */
export interface UserDashboardDTO {
  upcomingBookings: BookingDTO[];
  recentActivity: ActivityDTO[];
  notifications: NotificationDTO[];
  favorites: RentalObjectSearchCardDTO[];
  recommendations?: RentalObjectSearchCardDTO[];
}

/**
 * Organization dashboard (Backoffice)
 */
export interface OrgDashboardDTO {
  stats: {
    totalBookings: number;
    pendingApprovals: number;
    revenue: MoneyDTO;
    occupancyRate: number; // 0.00 to 1.00
  };
  
  recentBookings: BookingDTO[];
  rentalObjects: RentalObjectSearchCardDTO[];
  pendingApprovals: BookingDTO[];
}

/**
 * Search results with facets
 */
export interface SearchResultsDTO {
  results: RentalObjectSearchCardDTO[];
  facets: SearchFacetsDTO;
  pagination: PaginationDTO;
}

export interface SearchFacetsDTO {
  categories: FacetDTO[];
  cities: FacetDTO[];
  amenities: FacetDTO[];
  priceRanges: FacetDTO[];
}

export interface FacetDTO {
  value: string;
  label: string;
  count: number;
}

export interface PaginationDTO {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ========================================================================
// SUPPORTING DTOS
// ========================================================================

export interface MoneyDTO {
  amount: number; // In minor units (øre): 123456 = 1234.56 kr
  currency: string; // 'NOK'
  formatted: string; // 'kr 1.234,56' (Norwegian format)
}

export interface ImageDTO {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  sortOrder: number;
}

export interface CategoryDTO {
  key: string;
  name: string; // Localized
  description?: string;
}

export interface UserBaseDTO {
  id: string;
  name: string;
  email?: string; // Optional for privacy
  avatar?: string;
}

export interface AttachmentDTO {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
}

export interface DistanceDTO {
  meters: number;
  formatted: string; // '2,5 km' (Norwegian format)
}

export interface ActivityDTO {
  id: string;
  type: string;
  description: string;
  entityType?: string;
  entityId?: string;
  timestamp: string;
}

export interface SeoMetadataDTO {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  ogImage?: string;
}

export interface GeoAreaDTO {
  id: string;
  name: string;
  type: 'FYLKE' | 'KOMMUNE' | 'BYDEL';
}

export interface GeoCoordinatesDTO {
  latitude: number;
  longitude: number;
}

export interface DepositDTO {
  amount: MoneyDTO;
  dueDate?: string;
  refundable: boolean;
}

// ========================================================================
// RFC 7807 ERROR DTO
// ========================================================================

export interface ProblemDetailsDTO {
  type: string; // URI reference
  title: string;
  status: number; // HTTP status
  detail?: string;
  instance?: string; // URI to this error occurrence
  
  // Extensions
  traceId?: string;
  errors?: Record<string, string[]>; // Validation errors
}
