/**
 * Domain Modules Index
 *
 * IMPORTANT: This API is DOMAIN-ONLY
 * Platform modules (auth, tenant, user, etc.) are in platform-api (port 4001)
 */

// Core domain modules
export * from './booking';
export * from './rental-objects';
export * from './custody';

// Domain controllers (reviews, seasons, etc.)
export * from './reviews/reviews.controller';
export * from './seasons/seasons.controller';
export * from './calendar/calendar.controller';
export * from './search/search.controller';
