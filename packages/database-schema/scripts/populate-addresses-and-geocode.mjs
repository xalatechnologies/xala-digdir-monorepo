#!/usr/bin/env node
/**
 * Populate Address Data and Geocode Script
 * 
 * 1. Extracts city names from rental object names
 * 2. Creates basic address metadata
 * 3. Geocodes using Mapbox API
 * 4. Updates database with coordinates
 */

import postgres from 'postgres';

const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN || process.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoieGFsYXRlY2hub2xvZ2llcyIsImEiOiJjbTVqZWt5a2cwMHFsMmtzNWdtMnNtcGNxIn0.vPBPJDEYd0cWfhDnJqQJmA';
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://digilist_dev:dev_password_2026@localhost:5433/digilist_dev';

// Norwegian cities in Telemark region
const CITIES = ['Kragerø', 'Notodden', 'Skien', 'Porsgrunn', 'Bamble'];

console.log('🗺️  Populating addresses and geocoding...\n');

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

  for (const obj of objects) {
    // Extract city from name (e.g., "Arrangementssted 71 - Kragerø")
    let city = '';
    for (const c of CITIES) {
      if (obj.name.includes(c)) {
        city = c;
        break;
      }
    }

    if (!city) {
      console.log(`⚠️  ${obj.name} - No city found in name`);
      failCount++;
      continue;
    }

    // Create a searchable address
    const searchAddress = `${obj.name}, ${city}, Norway`;
    
    console.log(`\n🔍 ${obj.name}`);
    console.log(`   Searching: ${searchAddress}`);

    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchAddress)}.json?access_token=${MAPBOX_TOKEN}&country=NO&limit=1`;
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

      // Create metadata with address and coordinates
      const metadata = obj.metadata || {};
      const updatedMetadata = {
        ...metadata,
        location: {
          formatted: feature.place_name,
          city: city,
          coordinates: {
            latitude,
            longitude,
          },
        },
        address: {
          city: city,
          street: obj.name,
          coordinates: {
            latitude,
            longitude,
          },
        },
      };

      await sql`
        UPDATE domain.rental_objects
        SET metadata = ${JSON.stringify(updatedMetadata)}
        WHERE id = ${obj.id}
      `;

      console.log(`   ✅ ${latitude}, ${longitude}`);
      console.log(`   📍 ${feature.place_name}`);
      successCount++;

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Failed: ${failCount}`);
  console.log(`   Total: ${objects.length}`);
  console.log('='.repeat(60) + '\n');

} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
} finally {
  await sql.end();
}
