/**
 * Configuration Seed Data
 * Initial data for schema-driven configuration tables
 * 
 * Run with: npx tsx src/database/seeds/configuration.seed.ts
 */
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import {
  rentalObjectCategories,
  rentalObjectSubcategories,
  bookingTimeModes,
  pricingUnits,
  rentalObjectStatuses,
  bookingStatuses,
} from '../schema';

export async function seedConfigurationData(db: PostgresJsDatabase): Promise<void> {
  console.log('Seeding configuration data...');

  // ==========================================================================
  // Rental Object Categories
  // ==========================================================================
  
  const categories = await db.insert(rentalObjectCategories).values([
    {
      code: 'LOKALER_OG_BANER',
      name: 'Lokaler og baner',
      nameEn: 'Locations and Venues',
      description: 'Fysiske lokaler, idrettsanlegg, møterom og utendørs baner',
      descriptionEn: 'Physical premises, sports facilities, meeting rooms and outdoor courts',
      icon: 'building',
      examples: ['Idrettshall', 'Møterom', 'Grendehus', 'Fotballbane', 'Gymsal', 'Klasserom'],
      sortOrder: 1,
      enabled: true,
    },
    {
      code: 'UTSTYR_OG_INVENTAR',
      name: 'Utstyr og inventar',
      nameEn: 'Equipment and Inventory',
      description: 'Utlånbart utstyr, verktøy og inventar',
      descriptionEn: 'Loanable equipment, tools and inventory',
      icon: 'tool',
      examples: ['Grillhenger', 'Lydanlegg', 'Bord og stoler', 'Sportsutstyr', 'Partytelt'],
      sortOrder: 2,
      enabled: true,
    },
    {
      code: 'KJORETOY_OG_TRANSPORT',
      name: 'Kjøretøy og transport',
      nameEn: 'Vehicles and Transport',
      description: 'Kjøretøy, tilhengere og transportmidler',
      descriptionEn: 'Vehicles, trailers and means of transport',
      icon: 'car',
      examples: ['Minibuss', 'El-bil', 'Tilhenger', 'Sykkel', 'Varebil'],
      sortOrder: 3,
      enabled: true,
    },
    {
      code: 'OPPLEVELSER_OG_ARRANGEMENT',
      name: 'Opplevelser og arrangement',
      nameEn: 'Experiences and Events',
      description: 'Tidsbundne arrangementer, kurs og aktiviteter',
      descriptionEn: 'Time-bound events, courses and activities',
      icon: 'calendar',
      examples: ['Konsert', 'Workshop', 'Guidet tur', 'Kurs', 'Teater', 'Utstilling'],
      sortOrder: 4,
      enabled: true,
    },
  ]).returning();

  console.log(`Created ${categories.length} categories`);

  // Map category codes to IDs for subcategory insertion
  const categoryMap = new Map(categories.map(c => [c.code, c.id]));

  // ==========================================================================
  // Subcategories
  // ==========================================================================

  const subcategoriesData = [
    // LOKALER_OG_BANER subcategories
    { categoryId: categoryMap.get('LOKALER_OG_BANER')!, code: 'gymsal', name: 'Gymsal', nameEn: 'Gymnasium', sortOrder: 1 },
    { categoryId: categoryMap.get('LOKALER_OG_BANER')!, code: 'klasserom', name: 'Klasserom', nameEn: 'Classroom', sortOrder: 2 },
    { categoryId: categoryMap.get('LOKALER_OG_BANER')!, code: 'moterom', name: 'Møterom', nameEn: 'Meeting Room', sortOrder: 3 },
    { categoryId: categoryMap.get('LOKALER_OG_BANER')!, code: 'grendehus', name: 'Grendehus', nameEn: 'Community Hall', sortOrder: 4 },
    { categoryId: categoryMap.get('LOKALER_OG_BANER')!, code: 'idrettsbane', name: 'Idrettsbane', nameEn: 'Sports Field', sortOrder: 5 },
    { categoryId: categoryMap.get('LOKALER_OG_BANER')!, code: 'padel', name: 'Padelbane', nameEn: 'Padel Court', sortOrder: 6 },
    { categoryId: categoryMap.get('LOKALER_OG_BANER')!, code: 'tennis', name: 'Tennisbane', nameEn: 'Tennis Court', sortOrder: 7 },
    { categoryId: categoryMap.get('LOKALER_OG_BANER')!, code: 'cageball', name: 'Cageball', nameEn: 'Cageball', sortOrder: 8 },
    { categoryId: categoryMap.get('LOKALER_OG_BANER')!, code: 'hallflate', name: 'Hallflate', nameEn: 'Hall Floor', sortOrder: 9 },
    
    // UTSTYR_OG_INVENTAR subcategories
    { categoryId: categoryMap.get('UTSTYR_OG_INVENTAR')!, code: 'partytelt', name: 'Partytelt', nameEn: 'Party Tent', sortOrder: 1 },
    { categoryId: categoryMap.get('UTSTYR_OG_INVENTAR')!, code: 'stoler', name: 'Stoler', nameEn: 'Chairs', sortOrder: 2 },
    { categoryId: categoryMap.get('UTSTYR_OG_INVENTAR')!, code: 'bord', name: 'Bord', nameEn: 'Tables', sortOrder: 3 },
    { categoryId: categoryMap.get('UTSTYR_OG_INVENTAR')!, code: 'ski', name: 'Skiutstyr', nameEn: 'Ski Equipment', sortOrder: 4 },
    { categoryId: categoryMap.get('UTSTYR_OG_INVENTAR')!, code: 'lyd_lys', name: 'Lyd/lys', nameEn: 'Audio/Lighting', sortOrder: 5 },
    { categoryId: categoryMap.get('UTSTYR_OG_INVENTAR')!, code: 'kano_kajakk', name: 'Kano/kajakk', nameEn: 'Canoe/Kayak', sortOrder: 6 },
    
    // KJORETOY_OG_TRANSPORT subcategories
    { categoryId: categoryMap.get('KJORETOY_OG_TRANSPORT')!, code: 'minibuss', name: 'Minibuss', nameEn: 'Minibus', sortOrder: 1 },
    { categoryId: categoryMap.get('KJORETOY_OG_TRANSPORT')!, code: 'varebil', name: 'Varebil', nameEn: 'Van', sortOrder: 2 },
    { categoryId: categoryMap.get('KJORETOY_OG_TRANSPORT')!, code: 'sykkel', name: 'Sykkel', nameEn: 'Bicycle', sortOrder: 3 },
    { categoryId: categoryMap.get('KJORETOY_OG_TRANSPORT')!, code: 'tilhenger', name: 'Tilhenger', nameEn: 'Trailer', sortOrder: 4 },
    { categoryId: categoryMap.get('KJORETOY_OG_TRANSPORT')!, code: 'elbil', name: 'El-bil', nameEn: 'Electric Car', sortOrder: 5 },
    
    // OPPLEVELSER_OG_ARRANGEMENT subcategories
    { categoryId: categoryMap.get('OPPLEVELSER_OG_ARRANGEMENT')!, code: 'kurs', name: 'Kurs', nameEn: 'Course', sortOrder: 1 },
    { categoryId: categoryMap.get('OPPLEVELSER_OG_ARRANGEMENT')!, code: 'konsert', name: 'Konsert', nameEn: 'Concert', sortOrder: 2 },
    { categoryId: categoryMap.get('OPPLEVELSER_OG_ARRANGEMENT')!, code: 'teater', name: 'Teater', nameEn: 'Theater', sortOrder: 3 },
    { categoryId: categoryMap.get('OPPLEVELSER_OG_ARRANGEMENT')!, code: 'utstilling', name: 'Utstilling', nameEn: 'Exhibition', sortOrder: 4 },
    { categoryId: categoryMap.get('OPPLEVELSER_OG_ARRANGEMENT')!, code: 'workshop', name: 'Workshop', nameEn: 'Workshop', sortOrder: 5 },
    { categoryId: categoryMap.get('OPPLEVELSER_OG_ARRANGEMENT')!, code: 'guidet_tur', name: 'Guidet tur', nameEn: 'Guided Tour', sortOrder: 6 },
  ];

  const subcategories = await db.insert(rentalObjectSubcategories).values(subcategoriesData).returning();
  console.log(`Created ${subcategories.length} subcategories`);

  // ==========================================================================
  // Booking Time Modes
  // ==========================================================================

  const timeModes = await db.insert(bookingTimeModes).values([
    {
      code: 'PERIOD',
      name: 'Tidsperiode',
      nameEn: 'Time Period',
      description: 'Velg start- og sluttidspunkt for booking',
      descriptionEn: 'Select start and end time for booking',
      calendarBehavior: 'drag-select',
      icon: 'clock',
      sortOrder: 1,
      enabled: true,
    },
    {
      code: 'SLOT',
      name: 'Tidsluke',
      nameEn: 'Time Slot',
      description: 'Velg fra forhåndsdefinerte tidsluker',
      descriptionEn: 'Select from predefined time slots',
      calendarBehavior: 'slot-grid',
      icon: 'grid',
      sortOrder: 2,
      enabled: true,
    },
    {
      code: 'ALL_DAY',
      name: 'Heldags',
      nameEn: 'All Day',
      description: 'Book hele dager eller flere dager',
      descriptionEn: 'Book full days or multiple days',
      calendarBehavior: 'date-picker',
      icon: 'calendar',
      sortOrder: 3,
      enabled: true,
    },
  ]).returning();

  console.log(`Created ${timeModes.length} time modes`);

  // ==========================================================================
  // Pricing Units
  // ==========================================================================

  const pricingUnitsData = await db.insert(pricingUnits).values([
    {
      code: 'hour',
      name: 'Time',
      nameEn: 'Hour',
      description: 'Pris per time',
      durationMinutes: 60,
      sortOrder: 1,
      enabled: true,
    },
    {
      code: 'day',
      name: 'Dag',
      nameEn: 'Day',
      description: 'Pris per dag',
      durationMinutes: 1440, // 24 hours
      sortOrder: 2,
      enabled: true,
    },
    {
      code: 'booking',
      name: 'Per booking',
      nameEn: 'Per Booking',
      description: 'Fast pris per booking',
      durationMinutes: null,
      sortOrder: 3,
      enabled: true,
    },
    {
      code: 'week',
      name: 'Uke',
      nameEn: 'Week',
      description: 'Pris per uke',
      durationMinutes: 10080, // 7 days
      sortOrder: 4,
      enabled: true,
    },
    {
      code: 'month',
      name: 'Måned',
      nameEn: 'Month',
      description: 'Pris per måned',
      durationMinutes: 43200, // 30 days
      sortOrder: 5,
      enabled: true,
    },
  ]).returning();

  console.log(`Created ${pricingUnitsData.length} pricing units`);

  // ==========================================================================
  // Rental Object Statuses
  // ==========================================================================

  const rentalStatuses = await db.insert(rentalObjectStatuses).values([
    {
      code: 'draft',
      name: 'Utkast',
      nameEn: 'Draft',
      description: 'Objektet er under arbeid og ikke synlig for brukere',
      color: 'gray',
      allowedTransitions: ['published', 'archived'],
      sortOrder: 1,
      enabled: true,
    },
    {
      code: 'published',
      name: 'Publisert',
      nameEn: 'Published',
      description: 'Objektet er aktivt og tilgjengelig for booking',
      color: 'green',
      allowedTransitions: ['draft', 'archived'],
      sortOrder: 2,
      enabled: true,
    },
    {
      code: 'archived',
      name: 'Arkivert',
      nameEn: 'Archived',
      description: 'Objektet er deaktivert og ikke lenger tilgjengelig',
      color: 'red',
      allowedTransitions: ['draft'],
      sortOrder: 3,
      enabled: true,
    },
  ]).returning();

  console.log(`Created ${rentalStatuses.length} rental object statuses`);

  // ==========================================================================
  // Booking Statuses
  // ==========================================================================

  const bookingStatusesData = await db.insert(bookingStatuses).values([
    {
      code: 'pending',
      name: 'Venter',
      nameEn: 'Pending',
      description: 'Bookingen venter på godkjenning',
      color: 'yellow',
      allowedTransitions: ['confirmed', 'cancelled', 'rejected'],
      isFinal: false,
      sortOrder: 1,
      enabled: true,
    },
    {
      code: 'confirmed',
      name: 'Bekreftet',
      nameEn: 'Confirmed',
      description: 'Bookingen er godkjent og bekreftet',
      color: 'green',
      allowedTransitions: ['cancelled', 'completed', 'no_show'],
      isFinal: false,
      sortOrder: 2,
      enabled: true,
    },
    {
      code: 'cancelled',
      name: 'Kansellert',
      nameEn: 'Cancelled',
      description: 'Bookingen er kansellert',
      color: 'red',
      allowedTransitions: [],
      isFinal: true,
      sortOrder: 3,
      enabled: true,
    },
    {
      code: 'rejected',
      name: 'Avslått',
      nameEn: 'Rejected',
      description: 'Bookingen ble avslått av administrator',
      color: 'red',
      allowedTransitions: [],
      isFinal: true,
      sortOrder: 4,
      enabled: true,
    },
    {
      code: 'completed',
      name: 'Fullført',
      nameEn: 'Completed',
      description: 'Bookingen er fullført',
      color: 'blue',
      allowedTransitions: [],
      isFinal: true,
      sortOrder: 5,
      enabled: true,
    },
    {
      code: 'no_show',
      name: 'Ikke møtt',
      nameEn: 'No Show',
      description: 'Brukeren møtte ikke opp',
      color: 'orange',
      allowedTransitions: [],
      isFinal: true,
      sortOrder: 6,
      enabled: true,
    },
  ]).returning();

  console.log(`Created ${bookingStatusesData.length} booking statuses`);

  console.log('Configuration seed completed successfully!');
}

// Export seed data for programmatic use
export const SEED_CATEGORIES = [
  'LOKALER_OG_BANER',
  'UTSTYR_OG_INVENTAR',
  'KJORETOY_OG_TRANSPORT',
  'OPPLEVELSER_OG_ARRANGEMENT',
] as const;

export const SEED_TIME_MODES = ['PERIOD', 'SLOT', 'ALL_DAY'] as const;

export const SEED_PRICING_UNITS = ['hour', 'day', 'booking', 'week', 'month'] as const;

export const SEED_RENTAL_STATUSES = ['draft', 'published', 'archived'] as const;

export const SEED_BOOKING_STATUSES = ['pending', 'confirmed', 'cancelled', 'rejected', 'completed', 'no_show'] as const;
