#!/usr/bin/env node
/**
 * Generate comprehensive seed data matching exact Drizzle schema
 * 70 rental objects + users + roles + organizations
 * FIXED: Use working placeholder images instead of invalid Unsplash URLs
 */

const fs = require('fs');

// Norwegian cities for variety
const cities = [
  { name: 'Skien', code: '3720', lat: 59.2099, lon: 9.6089 },
  { name: 'Porsgrunn', code: '3901', lat: 59.1403, lon: 9.6561 },
  { name: 'Bamble', code: '3970', lat: 59.0167, lon: 9.6167 },
  { name: 'Notodden', code: '3674', lat: 59.5597, lon: 9.2583 },
  { name: 'Kragerø', code: '3770', lat: 58.8694, lon: 9.4128 }
];

// Local image paths - stored in apps/api/public/seed-images/
const localImages = {
  LOKALER_OG_BANER: [
    'sports-hall.png',
    'soccer-field.png',
    'tennis-court.png',
    'swimming-pool.png',
    'gymnasium.png'
  ],
  MØTEROM: ['meeting-room.png'],
  UTSTYR: ['sports-hall.png'], // Reuse sports images for equipment
  ARRANGEMENT: ['sports-hall.png'] // Reuse for arrangement venues
};

// Venue types for LOKALER_OG_BANER (40 objects)
const lokaler = [
  { type: 'Idrettshall', capacity: 300, basePrice: 850 },
  { type: 'Fotballbane', capacity: 300, basePrice: 750 },
  { type: 'Tennisbane', capacity: 50, basePrice: 350 },
  { type: 'Svømmehall', capacity: 200, basePrice: 1200 },
  { type: 'Gymnastikksal', capacity: 100, basePrice: 550 },
  { type: 'Basketballbane', capacity: 100, basePrice: 650 },
  { type: 'Volleyballbane', capacity: 80, basePrice: 500 },
  { type: 'Badmintonhall', capacity: 120, basePrice: 600 },
  { type: 'Håndballbane', capacity: 250, basePrice: 800 },
  { type: 'Ishall', capacity: 500, basePrice: 1500 }
];

/**
 * Generate local static file URL
 * Images are served from apps/api/public/seed-images/
 * API serves them at /seed-images/ route
 */
function getImageUrl(category, index, venueType = null) {
  const images = localImages[category] || localImages.LOKALER_OG_BANER;
  const fileName = images[index % images.length];
  const categoryFolder = category === 'LOKALER_OG_BANER' ? 'lokaler-og-baner' : 
                         category === 'MØTEROM' ? 'møterom' :
                         category === 'UTSTYR' ? 'utstyr' : 'arrangement';
  
  return `/seed-images/${categoryFolder}/${fileName}`;
}

function getThumbnailUrl(category, index, venueType = null) {
  // Use same image for thumbnail (will be resized by frontend if needed)
  return getImageUrl(category, index, venueType);
}

function generateRentalObject(index, category, cityIndex) {
  const city = cities[cityIndex % cities.length];
  const id = `d${String(index).padStart(7, '0')}-0000-0000-0000-000000000000`;
  
  let basePrice, capacity, typeName;
  
  if (category === 'LOKALER_OG_BANER') {
    const venue = lokaler[index % lokaler.length];
    typeName = venue.type;
    capacity = venue.capacity;
    basePrice = venue.basePrice;
  } else if (category === 'MØTEROM') {
    typeName = `Møterom ${String.fromCharCode(65 + (index % 26))}`;
    capacity = 10 + (index % 3) * 10;
    basePrice = 250 + (index % 3) * 100;
  } else if (category === 'UTSTYR') {
    const equipment = ['Fotballutstyr', 'Duker og Stoler', 'Lydutstyr', 'Projektorer', 'Telt'][index % 5];
    typeName = equipment;
    capacity = 1;
    basePrice = 150 + (index % 5) * 50;
  } else { // ARRANGEMENT
    typeName = `Arrangementssted ${index + 1}`;
    capacity = 200 + (index % 5) * 100;
    basePrice = 2000 + (index % 5) * 500;
  }

  return {
    id,
    tenant_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    organization_id: '11111111-1111-1111-1111-111111111111',
    name: `${typeName} - ${city.name}`,
    slug: `${typeName.toLowerCase().replace(/\s+/g, '-').replace(/ø/g, 'o').replace(/å/g, 'a').replace(/æ/g, 'ae')}-${city.name.toLowerCase().replace(/ø/g, 'o')}-${index}`,
    description: `Moderne ${typeName.toLowerCase()} i ${city.name}. Perfekt for trening, events og arrangementer. Godt vedlikeholdt med moderne fasiliteter.`,
    category_key: category,
    time_mode: category === 'UTSTYR' ? 'ITEM' : 'PERIOD',
    features: category === 'UTSTYR' ? ['INVENTORY'] : ['SHARED_CAPACITY'],
    status: 'published',
    requires_approval: false,
    capacity,
    images: [
      {
        url: getImageUrl(category, index, typeName),
        alt: `${typeName} hovedbilde`,
        thumbnail: getThumbnailUrl(category, index, typeName),
        is_primary: true,
        sort_order: 1
      },
      {
        url: getImageUrl(category, index + 1, typeName),
        alt: `${typeName} interiør`,
        thumbnail: getThumbnailUrl(category, index + 1, typeName),
        is_primary: false,
        sort_order: 2
      },
      {
        url: getImageUrl(category, index + 2, typeName),
        alt: `${typeName} fasiliteter`,
        thumbnail: getThumbnailUrl(category, index + 2, typeName),
        is_primary: false,
        sort_order: 3
      }
    ],
    pricing: {
      base_price: basePrice,
      currency: 'NOK',
      unit: category === 'UTSTYR' ? 'day' : 'hour',
      vat_rate: 25,
      discounts: [
        { type: 'nonprofit', rate: 20, description: '20% rabatt for ideelle organisasjoner' },
        { type: 'off_peak', rate: 30, description: '30% rabatt utenfor peak-tid' }
      ]
    },
    metadata: {
      address: {
        street: `${typeName}veien ${index + 1}`,
        postal_code: city.code,
        city: city.name,
        country: 'Norway',
        coordinates: { latitude: city.lat, longitude: city.lon }
      },
      amenities: category === 'MØTEROM' 
        ? ['WiFi', 'Projektor', 'Whiteboard', 'Kaffe/te', 'Aircondition']
        : ['WiFi', 'Parkering', 'Garderober', 'Dusjer', 'Tilgjengelig for rullestol'],
      opening_hours: {
        monday: [{ from: '07:00', to: '23:00' }],
        tuesday: [{ from: '07:00', to: '23:00' }],
        wednesday: [{ from: '07:00', to: '23:00' }],
        thursday: [{ from: '07:00', to: '23:00' }],
        friday: [{ from: '07:00', to: '22:00' }],
        saturday: [{ from: '09:00', to: '20:00' }],
        sunday: [{ from: '09:00', to: '20:00' }]
      },
      rules: [
        'Avbestilling må gjøres minst 24 timer i forveien',
        'Maksimal kapasitet må respekteres'
      ],
      contact: {
        email: `${typeName.toLowerCase().replace(/\s+/g, '')}@${city.name.toLowerCase()}.kommune.no`,
        phone: '+47 35 58 50 00'
      }
    }
  };
}

// Generate all objects
const rentalObjects = [];
let index = 1;

// 40 LOKALER_OG_BANER
for (let i = 0; i < 40; i++) {
  rentalObjects.push(generateRentalObject(index++, 'LOKALER_OG_BANER', i));
}

// 10 MØTEROM
for (let i = 0; i < 10; i++) {
  rentalObjects.push(generateRentalObject(index++, 'MØTEROM', i));
}

// 10 UTSTYR
for (let i = 0; i < 10; i++) {
  rentalObjects.push(generateRentalObject(index++, 'UTSTYR', i));
}

// 10 ARRANGEMENT
for (let i = 0; i < 10; i++) {
  rentalObjects.push(generateRentalObject(index++, 'ARRANGEMENT', i));
}

const seedData = {
  meta: {
    version: '1.0.1',
    created: new Date().toISOString(),
    description: 'Comprehensive seed data for Digilist Platform - FIXED IMAGES',
    schema_version: 'v3',
    total_objects: 70
  },
  tenants: [
    {
      id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      slug: 'skien',
      name: 'Skien Kommune',
      status: 'active'
    }
  ],
  organizations: [
    {
      id: '11111111-1111-1111-1111-111111111111',
      tenant_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      name: 'Skien Kommune',
      slug: 'skien',
      status: 'active'
    }
  ],
  users: [
    {
      id: '00000000-0000-0000-0000-000000000001',
      tenant_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      organization_id: '11111111-1111-1111-1111-111111111111',
      email: 'admin@skien.kommune.no',
      name: 'Admin Bruker',
      role: 'admin',
      status: 'active',
      demo_token: 'demo-admin-token'
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      tenant_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      organization_id: '11111111-1111-1111-1111-111111111111',
      email: 'saksbehandler@skien.kommune.no',
      name: 'Saksbehandler Bruker',
      role: 'case_handler',
      status: 'active',
      demo_token: 'demo-case-handler-token'
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      tenant_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      organization_id: '11111111-1111-1111-1111-111111111111',
      email: 'bruker@skien.kommune.no',
      name: 'Vanlig Bruker',
      role: 'member',
      status: 'active',
      demo_token: 'demo-user-token'
    }
  ],
  rental_objects: rentalObjects
};

const outputPath = './rental-objects-comprehensive.json';
fs.writeFileSync(outputPath, JSON.stringify(seedData, null, 2));
console.log('✅ Generated comprehensive seed data with Picsum Photos placeholder images:');
console.log(`   - ${seedData.rental_objects.length} rental objects`);
console.log(`   - ${seedData.users.length} users`);
console.log(`   - ${seedData.organizations.length} organizations`);
console.log(`   - ${seedData.tenants.length} tenants`);
console.log(`   - Using Picsum Photos API (https://picsum.photos)`);
console.log(`   - Saved to: ${outputPath}`);
