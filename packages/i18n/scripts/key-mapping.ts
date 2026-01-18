/**
 * Key mapping from old keys to new standardized keys
 * 
 * Patterns:
 * - action.* for user actions (save, delete, edit, etc.)
 * - state.* for states (loading, active, error, etc.)
 * - label.* for form labels (name, email, date, etc.)
 * - validation.* for validation messages
 * - error.* for error messages
 * - confirm.* for confirmation dialogs
 * - empty.* for empty states
 * - pagination.* for pagination
 * - aria.* for accessibility labels
 * - time.* for time-related terms
 * - day.* for day names
 * - app.* for app-wide terms
 */

export const KEY_MAPPING: Record<string, string> = {
  // === App Names ===
  'app.name': 'app.name',
  'brand.name': 'app.name',
  'common.brandName': 'app.name',
  'components.sidebar.appName': 'app.name',
  'APP.NAME': 'app.name',
  
  // === Actions ===
  'common.save': 'action.save',
  'common.lagre': 'action.save',
  'common.saveChanges': 'action.save',
  'settings.profile.saveChanges': 'action.save',
  'form.saveChanges': 'action.save',
  'blocks.form.save': 'action.save',
  
  'common.cancel': 'action.cancel',
  'common.avbryt': 'action.cancel',
  'form.cancel': 'action.cancel',
  
  'common.delete': 'action.delete',
  'common.slett': 'action.delete',
  'form.delete': 'action.delete',
  
  'common.edit': 'action.edit',
  'common.rediger': 'action.edit',
  'form.edit': 'action.edit',
  
  'common.create': 'action.create',
  'common.opprett': 'action.create',
  'form.create': 'action.create',
  
  'common.submit': 'action.submit',
  'common.send': 'action.submit',
  'form.submit': 'action.submit',
  
  'common.close': 'action.close',
  'common.lukk': 'action.close',
  
  'common.back': 'action.back',
  'common.tilbake': 'action.back',
  
  'common.next': 'action.next',
  'common.neste': 'action.next',
  
  'common.search': 'action.search',
  'common.sok': 'action.search',
  
  'common.filter': 'action.filter',
  'common.filtrer': 'action.filter',
  
  'common.clear': 'action.clear',
  'common.tøm': 'action.clear',
  
  'common.refresh': 'action.refresh',
  'common.oppdater': 'action.refresh',
  
  'common.retry': 'action.retry',
  'common.pris_igjen': 'action.retry',
  
  'common.download': 'action.download',
  'common.last_ned': 'action.download',
  
  'common.upload': 'action.upload',
  'common.last_opp': 'action.upload',
  
  'common.copy': 'action.copy',
  'common.kopier': 'action.copy',
  
  'common.select': 'action.select',
  'common.velg': 'action.select',
  
  'common.add': 'action.add',
  'common.legg_til': 'action.add',
  
  'common.remove': 'action.remove',
  'common.fjern': 'action.remove',
  
  'common.approve': 'action.approve',
  'common.godkjenn': 'action.approve',
  'bookings.action.approve': 'action.approve',
  
  'common.reject': 'action.reject',
  'common.avsla': 'action.reject',
  
  'common.login': 'action.login',
  'nav.login': 'action.login',
  'auth.login': 'action.login',
  
  'common.logout': 'action.logout',
  'auth.logout': 'action.logout',
  
  // === States ===
  'common.loading': 'state.loading',
  'common.laster': 'state.loading',
  'ui.loading': 'state.loading',
  'accessGrants.loading': 'state.loading',
  'accessGrants.loadingData': 'state.loading',
  'activityCalendar.loading': 'state.loading',
  'audit.loadingError': 'state.loading',
  'bookings.loadingBookings': 'state.loading',
  'common.laster_fakturering': 'state.loading',
  'common.laster_flags': 'state.loading',
  'common.laster_foresporsler': 'state.loading',
  'common.laster_kalender': 'state.loading',
  'common.laster_kategorier': 'state.loading',
  'common.laster_legitimasjoner': 'state.loading',
  'common.laster_opp': 'state.loading',
  'common.laster_rapporter': 'state.loading',
  'common.laster_samtaler': 'state.loading',
  'common.laster_secrets': 'state.loading',
  'common.laster_soknader': 'state.loading',
  'common.laster_tenanter': 'state.loading',
  'components.protected.loading': 'state.loading',
  'gdpr.loadingRequest': 'state.loading',
  'listings.loading': 'state.loading',
  'messages.loadingConversations': 'state.loading',
  'messages.loadingMessages': 'state.loading',
  'minside.accountSelection.loadingOrgs': 'state.loading',
  'organizations.bookings.loading': 'state.loading',
  'organizations.seasons.loading': 'state.loading',
  'recurringPreview.loading': 'state.loading',
  'reviews.loading': 'state.loading',
  'saasAdmin.featureFlagsCatalog.loading': 'state.loading',
  'seasons.loadingSeasons': 'state.loading',
  'security.loadingStats': 'state.loading',
  'settings.profile.uploading': 'state.loading',
  'timeline.loading': 'state.loading',
  
  'common.saving': 'state.saving',
  'common.lagrer': 'state.saving',
  'settings.profile.saving': 'state.saving',
  
  'common.error': 'state.error',
  'common.feil': 'state.error',
  'ui.error': 'state.error',
  
  'common.success': 'state.success',
  'common.fullfort': 'state.success',
  
  'common.active': 'state.active',
  'common.aktiv': 'state.active',
  
  'common.inactive': 'state.inactive',
  'common.inaktiv': 'state.inactive',
  
  'common.pending': 'state.pending',
  'common.venter': 'state.pending',
  
  'common.draft': 'state.draft',
  'common.utkast': 'state.draft',
  
  'common.published': 'state.published',
  'common.publisert': 'state.published',
  
  'common.archived': 'state.archived',
  'common.arkivert': 'state.archived',
  
  'common.deleted': 'state.deleted',
  'common.slettet': 'state.deleted',
  
  'common.cancelled': 'state.cancelled',
  'common.kansellert': 'state.cancelled',
  'booking.cancelled': 'state.cancelled',
  
  'common.completed': 'state.completed',
  'common.fullfort': 'state.completed',
  
  'common.approved': 'state.approved',
  'common.godkjent': 'state.approved',
  
  'common.rejected': 'state.rejected',
  'common.avslatt': 'state.rejected',
  
  'common.suspended': 'state.suspended',
  'common.suspendert': 'state.suspended',
  
  'common.expired': 'state.expired',
  'common.utlopt': 'state.expired',
  
  'common.available': 'state.available',
  'common.ledig': 'state.available',
  'status.ledig': 'state.available',
  
  'common.unavailable': 'state.unavailable',
  'common.utilgjengelig': 'state.unavailable',
  'status.utilgjengelig': 'state.unavailable',
  
  'common.busy': 'state.busy',
  'common.opptatt': 'state.busy',
  'status.opptatt': 'state.busy',
  
  'common.blocked': 'state.blocked',
  'common.blokkert': 'state.blocked',
  'status.blokkert': 'state.blocked',
  
  'common.open': 'state.open',
  'common.apen': 'state.open',
  'status.apen': 'state.open',
  
  'common.closed': 'state.closed',
  'common.stengt': 'state.closed',
  'status.stengt': 'state.closed',
  
  'common.reservert': 'state.reserved',
  'status.reservert': 'state.reserved',
  
  'common.booked': 'state.booked',
  'status.booked': 'state.booked',
  
  // === Labels ===
  'common.name': 'label.name',
  'label.name': 'label.name',
  'form.name': 'label.name',
  
  'common.title': 'label.title',
  'label.title': 'label.title',
  'form.title': 'label.title',
  
  'common.description': 'label.description',
  'label.description': 'label.description',
  'form.description': 'label.description',
  
  'common.email': 'label.email',
  'label.email': 'label.email',
  'form.email': 'label.email',
  
  'common.phone': 'label.phone',
  'label.phone': 'label.phone',
  'form.phone': 'label.phone',
  
  'common.address': 'label.address',
  'label.address': 'label.address',
  'form.address': 'label.address',
  
  'common.date': 'label.date',
  'label.date': 'label.date',
  'form.date': 'label.date',
  
  'common.time': 'label.time',
  'label.time': 'label.time',
  'form.time': 'label.time',
  
  'common.price': 'label.price',
  'label.price': 'label.price',
  'form.price': 'label.price',
  
  'common.status': 'label.status',
  'label.status': 'label.status',
  'form.status': 'label.status',
  
  'common.type': 'label.type',
  'label.type': 'label.type',
  'form.type': 'label.type',
  
  'common.category': 'label.category',
  'label.category': 'label.category',
  'form.category': 'label.category',
  
  'common.notes': 'label.notes',
  'label.notes': 'label.notes',
  'form.notes': 'label.notes',
  
  'common.message': 'label.message',
  'label.message': 'label.message',
  'form.message': 'label.message',
  
  'common.file': 'label.file',
  'label.file': 'label.file',
  'form.file': 'label.file',
  
  'common.image': 'label.image',
  'label.image': 'label.image',
  'form.image': 'label.image',
  
  'common.all': 'label.all',
  'common.alle': 'label.all',
  
  'common.none': 'label.none',
  'common.ingen': 'label.none',
  
  // === Days ===
  'days.monday': 'day.monday',
  'days.tuesday': 'day.tuesday',
  'days.wednesday': 'day.wednesday',
  'days.thursday': 'day.thursday',
  'days.friday': 'day.friday',
  'days.saturday': 'day.saturday',
  'days.sunday': 'day.sunday',
  'days.mon': 'day.mon',
  'days.tue': 'day.tue',
  'days.wed': 'day.wed',
  'days.thu': 'day.thu',
  'days.fri': 'day.fri',
  'days.sat': 'day.sat',
  'days.sun': 'day.sun',
  
  // === Time ===
  'common.today': 'time.today',
  'common.idag': 'time.today',
  'common.yesterday': 'time.yesterday',
  'common.igar': 'time.yesterday',
  'common.tomorrow': 'time.tomorrow',
  'common.imorgen': 'time.tomorrow',
  
  // === Validation ===
  'validation.required': 'validation.required',
  'common.required': 'validation.required',
  'form.required': 'validation.required',
  
  'validation.email': 'validation.email',
  'validation.invalidEmail': 'validation.email',
  
  'validation.minLength': 'validation.minLength',
  'validation.maxLength': 'validation.maxLength',
  
  // === Errors ===
  'error.generic': 'error.generic',
  'common.error': 'error.generic',
  'ui.error': 'error.generic',
  
  'error.network': 'error.network',
  'error.connection': 'error.network',
  
  'error.notFound': 'error.notFound',
  'error.404': 'error.notFound',
  
  'error.unauthorized': 'error.unauthorized',
  'error.401': 'error.unauthorized',
  
  'error.forbidden': 'error.forbidden',
  'error.403': 'error.forbidden',
  
  'error.server': 'error.server',
  'error.500': 'error.server',
  
  'error.validation': 'error.validation',
  'error.form': 'error.validation',
  
  // === Empty States ===
  'empty.default': 'empty.default',
  'common.noData': 'empty.default',
  'common.ingenData': 'empty.default',
  
  'empty.search': 'empty.search',
  'common.noResults': 'empty.search',
  'common.ingenTreff': 'empty.search',
  
  // === Pagination ===
  'pagination.next': 'pagination.next',
  'common.nextPage': 'pagination.next',
  
  'pagination.previous': 'pagination.previous',
  'common.previousPage': 'pagination.previous',
  
  'pagination.showing': 'pagination.showing',
  'common.showing': 'pagination.showing',
  
  // === ARIA ===
  'aria.close': 'aria.close',
  'aria.closeDialog': 'aria.close',
  
  'aria.open': 'aria.open',
  'aria.openMenu': 'aria.open',
  
  'aria.menu': 'aria.menu',
  'aria.navigation': 'aria.menu',
  
  'aria.search': 'aria.search',
  'aria.searchField': 'aria.search',
  
  'aria.loading': 'aria.loading',
  'aria.loadingContent': 'aria.loading',
  
  'aria.required': 'aria.required',
  'aria.requiredField': 'aria.required',
  
  // === Common Patterns ===
  // Feature titles
  'accessGrants.title': 'accessGrants.page.title',
  'accessGrants.subtitle': 'accessGrants.page.description',
  
  'activityCalendar.title': 'activityCalendar.page.title',
  'activityCalendar.subtitle': 'activityCalendar.page.description',
  
  'audit.title': 'audit.page.title',
  'audit.subtitle': 'audit.page.description',
  
  'bookings.title': 'bookings.page.list.title',
  'bookings.subtitle': 'bookings.page.list.description',
  
  'calendar.title': 'calendar.page.title',
  'calendar.subtitle': 'calendar.page.description',
  
  'dashboard.title': 'dashboard.page.title',
  'dashboard.subtitle': 'dashboard.page.description',
  
  'listings.title': 'listings.page.list.title',
  'listings.subtitle': 'listings.page.list.description',
  
  'organizations.title': 'organizations.page.list.title',
  'organizations.subtitle': 'organizations.page.list.description',
  
  'reviews.title': 'reviews.page.title',
  'reviews.subtitle': 'reviews.page.description',
  
  'settings.title': 'settings.page.title',
  'settings.subtitle': 'settings.page.description',
  
  'users.title': 'users.page.list.title',
  'users.subtitle': 'users.page.list.description',
  
  // Form patterns
  'form.name.placeholder': 'form.name.placeholder',
  'form.email.placeholder': 'form.email.placeholder',
  'form.phone.placeholder': 'form.phone.placeholder',
  'form.address.placeholder': 'form.address.placeholder',
  'form.description.placeholder': 'form.description.placeholder',
  'form.message.placeholder': 'form.message.placeholder',
  
  // Button labels with context
  'bookings.bulk.approve': 'action.approve',
  'bookings.bulk.cancel': 'action.cancel',
  'bookings.bulk.delete': 'action.delete',
  'bookings.bulk.select': 'action.selectAll',
  
  'form.save': 'action.save',
  'form.cancel': 'action.cancel',
  'form.delete': 'action.delete',
  'form.submit': 'action.submit',
  
  'settings.save': 'action.save',
  'settings.cancel': 'action.cancel',
  'settings.delete': 'action.delete',
  'settings.submit': 'action.submit',
  
  // Keep feature-specific keys that are truly unique
  // These will be preserved as-is
  'auth.idporten': 'auth.idporten',
  'auth.microsoft': 'auth.microsoft',
  'auth.demo': 'auth.demo',
  
  'saasAdmin.features': 'saasAdmin.features',
  'saasAdmin.tenants': 'saasAdmin.tenants',
  'saasAdmin.billing': 'saasAdmin.billing',
  
  'rentalObjects.capacity': 'rentalObjects.capacity',
  'rentalObjects.equipment': 'rentalObjects.equipment',
  'rentalObjects.availability': 'rentalObjects.availability',
  
  'seasons.application': 'seasons.application',
  'seasons.allocation': 'seasons.allocation',
  'seasons.priority': 'seasons.priority',
  
  'gdpr.request': 'gdpr.request',
  'gdpr.export': 'gdpr.export',
  'gdpr.delete': 'gdpr.delete',
  
  'notifications.email': 'notifications.email',
  'notifications.sms': 'notifications.sms',
  'notifications.push': 'notifications.push',
  
  'reports.booking': 'reports.booking',
  'reports.revenue': 'reports.revenue',
  'reports.utilization': 'reports.utilization',
  
  'integrations.vipps': 'integrations.vipps',
  'integrations.visma': 'integrations.visma',
  'integrations.outlook': 'integrations.outlook',
  'integrations.azure': 'integrations.azure',
};

// Keys that should be preserved as-is (truly unique)
export const PRESERVE_KEYS = new Set([
  // Auth providers
  'auth.idporten',
  'auth.microsoft',
  'auth.demo',
  
  // Feature-specific domain terms
  'rentalObjects.capacity',
  'rentalObjects.equipment',
  'rentalObjects.availability',
  'seasons.application',
  'seasons.allocation',
  'seasons.priority',
  'gdpr.request',
  'gdpr.export',
  'gdpr.delete',
  'notifications.email',
  'notifications.sms',
  'notifications.push',
  'reports.booking',
  'reports.revenue',
  'reports.utilization',
  'integrations.vipps',
  'integrations.visma',
  'integrations.outlook',
  'integrations.azure',
  
  // Legal/compliance
  'privacy.policy',
  'terms.of.service',
  'cookies.policy',
  
  // Help/support
  'help.faq',
  'help.contact',
  'help.documentation',
  
  // Status codes that are business-specific
  'booking.status.confirmed',
  'booking.status.pending',
  'booking.status.cancelled',
  'booking.status.completed',
  
  'application.status.submitted',
  'application.status.processed',
  'application.status.approved',
  'application.status.rejected',
  
  // Payment specific
  'payment.status.pending',
  'payment.status.completed',
  'payment.status.failed',
  'payment.status.refunded',
  
  // Role-specific
  'role.admin',
  'role.casehandler',
  'role.user',
  'role.viewer',
  
  // Feature flags
  'feature.seasonal',
  'feature.payments',
  'feature.reports',
  'feature.integrations',
]);

// Function to map old key to new key
export function mapKey(oldKey: string): string {
  // If key should be preserved, return as-is
  if (PRESERVE_KEYS.has(oldKey)) {
    return oldKey;
  }
  
  // Check direct mapping
  if (KEY_MAPPING[oldKey]) {
    return KEY_MAPPING[oldKey];
  }
  
  // Pattern-based mapping for common patterns
  if (oldKey.endsWith('.title')) {
    const feature = oldKey.replace('.title', '');
    return `${feature}.page.title`;
  }
  
  if (oldKey.endsWith('.subtitle')) {
    const feature = oldKey.replace('.subtitle', '');
    return `${feature}.page.description`;
  }
  
  if (oldKey.endsWith('.loading')) {
    return 'state.loading';
  }
  
  if (oldKey.endsWith('.error')) {
    return 'error.generic';
  }
  
  if (oldKey.endsWith('.required')) {
    return 'validation.required';
  }
  
  if (oldKey.endsWith('.placeholder')) {
    const field = oldKey.replace('.placeholder', '');
    return `form.${field}.placeholder`;
  }
  
  // More pattern-based mappings
  const parts = oldKey.split('.');
  
  // Common prefixes that should map to core
  if (parts[0] === 'common' || parts[0] === 'ui' || parts[0] === 'form') {
    const suffix = parts.slice(1).join('.');
    
    // Check if it's a known core key
    const coreKey = `core.${suffix}`;
    if (suffix === 'loading' || suffix === 'laster') return 'state.loading';
    if (suffix === 'saving' || suffix === 'lagrer') return 'state.saving';
    if (suffix === 'error' || suffix === 'feil') return 'error.generic';
    if (suffix === 'success' || suffix === 'fullfort') return 'state.success';
    if (suffix === 'active' || suffix === 'aktiv') return 'state.active';
    if (suffix === 'inactive' || suffix === 'inaktiv') return 'state.inactive';
    if (suffix === 'pending' || suffix === 'venter') return 'state.pending';
    if (suffix === 'draft' || suffix === 'utkast') return 'state.draft';
    if (suffix === 'published' || suffix === 'publisert') return 'state.published';
    if (suffix === 'archived' || suffix === 'arkivert') return 'state.archived';
    if (suffix === 'deleted' || suffix === 'slettet') return 'state.deleted';
    if (suffix === 'cancelled' || suffix === 'kansellert') return 'state.cancelled';
    if (suffix === 'completed' || suffix === 'fullfort') return 'state.completed';
    if (suffix === 'approved' || suffix === 'godkjent') return 'state.approved';
    if (suffix === 'rejected' || suffix === 'avslatt') return 'state.rejected';
    if (suffix === 'suspended' || suffix === 'suspendert') return 'state.suspended';
    if (suffix === 'expired' || suffix === 'utlopt') return 'state.expired';
    if (suffix === 'available' || suffix === 'ledig') return 'state.available';
    if (suffix === 'unavailable' || suffix === 'utilgjengelig') return 'state.unavailable';
    if (suffix === 'busy' || suffix === 'opptatt') return 'state.busy';
    if (suffix === 'blocked' || suffix === 'blokkert') return 'state.blocked';
    if (suffix === 'open' || suffix === 'apen') return 'state.open';
    if (suffix === 'closed' || suffix === 'stengt') return 'state.closed';
    
    // Actions
    if (suffix === 'save' || suffix === 'lagre') return 'action.save';
    if (suffix === 'cancel' || suffix === 'avbryt') return 'action.cancel';
    if (suffix === 'delete' || suffix === 'slett') return 'action.delete';
    if (suffix === 'edit' || suffix === 'rediger') return 'action.edit';
    if (suffix === 'create' || suffix === 'opprett') return 'action.create';
    if (suffix === 'submit' || suffix === 'send') return 'action.submit';
    if (suffix === 'close' || suffix === 'lukk') return 'action.close';
    if (suffix === 'back' || suffix === 'tilbake') return 'action.back';
    if (suffix === 'next' || suffix === 'neste') return 'action.next';
    if (suffix === 'search' || suffix === 'sok') return 'action.search';
    if (suffix === 'filter' || suffix === 'filtrer') return 'action.filter';
    if (suffix === 'clear' || suffix === 'tom') return 'action.clear';
    if (suffix === 'refresh' || suffix === 'oppdater') return 'action.refresh';
    if (suffix === 'retry' || suffix === 'prøv_igjen') return 'action.retry';
    if (suffix === 'download' || suffix === 'last_ned') return 'action.download';
    if (suffix === 'upload' || suffix === 'last_opp') return 'action.upload';
    if (suffix === 'copy' || suffix === 'kopier') return 'action.copy';
    if (suffix === 'select' || suffix === 'velg') return 'action.select';
    if (suffix === 'add' || suffix === 'legg_til') return 'action.add';
    if (suffix === 'remove' || suffix === 'fjern') return 'action.remove';
    if (suffix === 'approve' || suffix === 'godkjenn') return 'action.approve';
    if (suffix === 'reject' || suffix === 'avsla') return 'action.reject';
    if (suffix === 'login') return 'action.login';
    if (suffix === 'logout') return 'action.logout';
    
    // Labels
    if (suffix === 'name' || suffix === 'navn') return 'label.name';
    if (suffix === 'title' || suffix === 'tittel') return 'label.title';
    if (suffix === 'description' || suffix === 'beskrivelse') return 'label.description';
    if (suffix === 'email' || suffix === 'epost') return 'label.email';
    if (suffix === 'phone' || suffix === 'telefon') return 'label.phone';
    if (suffix === 'address' || suffix === 'adresse') return 'label.address';
    if (suffix === 'date' || suffix === 'dato') return 'label.date';
    if (suffix === 'time' || suffix === 'tid') return 'label.time';
    if (suffix === 'price' || suffix === 'pris') return 'label.price';
    if (suffix === 'status' || suffix === 'status') return 'label.status';
    if (suffix === 'type' || suffix === 'type') return 'label.type';
    if (suffix === 'category' || suffix === 'kategori') return 'label.category';
    if (suffix === 'notes' || suffix === 'notater') return 'label.notes';
    if (suffix === 'message' || suffix === 'melding') return 'label.message';
    if (suffix === 'file' || suffix === 'fil') return 'label.file';
    if (suffix === 'image' || suffix === 'bilde') return 'label.image';
    if (suffix === 'all' || suffix === 'alle') return 'label.all';
    if (suffix === 'none' || suffix === 'ingen') return 'label.none';
  }
  
  // Feature-specific patterns
  if (parts[0] === 'bookings' && parts[1] === 'action') {
    if (parts[2] === 'approve') return 'action.approve';
    if (parts[2] === 'cancel') return 'action.cancel';
    if (parts[2] === 'delete') return 'action.delete';
    if (parts[2] === 'edit') return 'action.edit';
  }
  
  if (parts[0] === 'settings' && parts[1] === 'profile') {
    if (parts[2] === 'saveChanges') return 'action.save';
    if (parts[2] === 'uploading') return 'state.loading';
  }
  
  // Default: keep as-is (will need manual review)
  return oldKey;
}

// Get statistics about mapping
export function getMappingStats(allKeys: string[]) {
  const stats = {
    total: allKeys.length,
    mapped: 0,
    preserved: 0,
    unmapped: 0,
    categories: {} as Record<string, number>,
  };
  
  for (const key of allKeys) {
    if (PRESERVE_KEYS.has(key)) {
      stats.preserved++;
      stats.categories.preserved = (stats.categories.preserved || 0) + 1;
    } else if (KEY_MAPPING[key] || mapKey(key) !== key) {
      stats.mapped++;
      const category = key.split('.')[0];
      stats.categories[category] = (stats.categories[category] || 0) + 1;
    } else {
      stats.unmapped++;
      stats.categories.unmapped = (stats.categories.unmapped || 0) + 1;
    }
  }
  
  return stats;
}
