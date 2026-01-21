#!/usr/bin/env node
/**
 * Geocode Rental Objects Script
 * Uses Mapbox Geocoding API to populate coordinates in metadata
 */

import postgres from 'postgres';

const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN || process.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoieGFsYXRlY2hub2xvZ2llcyIsImEiOiJjbTVqZWt5a2cwMHFsMmtzNWdtMnNtcGNxIn0.vPBPJDEYd0cWfhDnJqQJmA';
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://digilist_dev:dev_password_2026@localhost:5433/digilist_dev';

console.log('🗺️  Starting rental object geocoding...\n');

const sql = postgres(DATABASE_URL);

try {
  const objects = await sql`
    SELECT id, name, metadata
    FROM domain.rental_objects
    WHERE status != 'deleted'
  `;

  console.log(`📍 Found ${objects.length} rental objects\n`);

  let successCount = 0;
  let failCount = 0;
  let skippedCount = 0;

  for (const obj of objects) {
    const metadata = obj.metadata || {};
    const location = metadata.location || {};
    const address = metadata.address || {};
    
    const hasCoords = location.coordinates?.latitude && location.coordinates?.longitude;
    
    if (hasCoords) {
      console.log(`⏭️  ${obj.name} - Already has coordinates`);
      skippedCount++;
      continue;
    }

    const locationFormatted = location.formatted || 
                              `${address.street || ''} ${address.streetNumber || ''}, ${address.city || ''}`.trim();

    if (!locationFormatted || locationFormatted === ',') {
      console.log(`⚠️  ${obj.name} - No address`);
      skippedCount++;
      continue;
    }

    console.log(`\n🔍 ${obj.name}`);
    console.log(`   ${locationFormatted}`);

    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationFormatted)}.json?access_token=${MAPBOX_TOKEN}&country=NO&limit=1`;
      const response = await fetch(url);
      
      if (!response.ok) {
        console.log(`   ❌ API error: ${response.status}`);
        failCount++;
        continue;
      }

      const data = await response.json();

      if (!data.features || data.features.length === 0) {
        console.log(`   ❌ No results`);
        failCount++;
        continue;
      }

      const feature = data.features[0];
      const [longitude, latitude] = feature.center;

      const updatedMetadata = {
        ...metadata,
        location: {
          ...location,
          coordinates: { latitude, longitude },
          formatted: feature.place_name,
        },
        address: {
          ...address,
          coordinates: { latitude, longitude },
        },
      };

      await sql`
        UPDATE domain.rental_objects
        SET metadata = ${JSON.stringify(updatedMetadata)}
        WHERE id = ${obj.id}
      `;

      console.log(`   ✅ ${latitude}, ${longitude}`);
      successCount++;

      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Geocoding complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Failed: ${failCount}`);
  console.log(`   Skipped: ${skippedCount}`);
  console.log(`   Total: ${objects.length}`);
  console.log('='.repeat(60) + '\n');

} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
} finally {
  await sql.end();
}
