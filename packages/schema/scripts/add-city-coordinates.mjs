#!/usr/bin/env node
/**
 * Add City Coordinates to Rental Objects
 * Uses hardcoded coordinates for Norwegian cities (no API required)
 */

import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://digilist_dev:dev_password_2026@localhost:5433/digilist_dev';

// Coordinates for Norwegian cities in Telemark region
const CITY_COORDINATES = {
  'Kragerø': { latitude: 58.8697, longitude: 9.4167 },
  'Notodden': { latitude: 59.5594, longitude: 9.2583 },
  'Skien': { latitude: 59.2099, longitude: 9.6089 },
  'Porsgrunn': { latitude: 59.1403, longitude: 9.6561 },
  'Bamble': { latitude: 59.0167, longitude: 9.6167 },
};

console.log('📍 Adding city coordinates to rental objects...\n');

const sql = postgres(DATABASE_URL);

try {
  const objects = await sql`
    SELECT id, name, metadata
    FROM domain.rental_objects
    WHERE status != 'deleted'
  `;

  console.log(`Found ${objects.length} rental objects\n`);

  let successCount = 0;
  let skipCount = 0;

  for (const obj of objects) {
    // Check if already has coordinates
    const metadata = obj.metadata || {};
    const location = metadata.location || {};
    const coords = location.coordinates || {};
    
    if (coords.latitude && coords.longitude) {
      console.log(`⏭️  ${obj.name} - Already has coordinates`);
      skipCount++;
      continue;
    }

    // Extract city from name
    let city = '';
    let cityCoords = null;
    
    for (const [cityName, coordinates] of Object.entries(CITY_COORDINATES)) {
      if (obj.name.includes(cityName)) {
        city = cityName;
        cityCoords = coordinates;
        break;
      }
    }

    if (!cityCoords) {
      console.log(`⚠️  ${obj.name} - No city found`);
      skipCount++;
      continue;
    }

    // Update metadata with coordinates
    const updatedMetadata = {
      ...metadata,
      location: {
        ...location,
        formatted: `${obj.name}, ${city}, Norway`,
        city: city,
        coordinates: {
          latitude: cityCoords.latitude,
          longitude: cityCoords.longitude,
        },
      },
      address: {
        ...(metadata.address || {}),
        city: city,
        coordinates: {
          latitude: cityCoords.latitude,
          longitude: cityCoords.longitude,
        },
      },
    };

    await sql`
      UPDATE domain.rental_objects
      SET metadata = ${JSON.stringify(updatedMetadata)}
      WHERE id = ${obj.id}
    `;

    console.log(`✅ ${obj.name} → ${city} (${cityCoords.latitude}, ${cityCoords.longitude})`);
    successCount++;
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Complete!`);
  console.log(`   Updated: ${successCount}`);
  console.log(`   Skipped: ${skipCount}`);
  console.log(`   Total: ${objects.length}`);
  console.log('='.repeat(60) + '\n');

} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
} finally {
  await sql.end();
}
