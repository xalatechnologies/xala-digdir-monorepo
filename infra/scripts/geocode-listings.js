#!/usr/bin/env node
/**
 * Geocode Rental Objects Script
 * 
 * Fetches rental objects and geocodes their addresses using Mapbox Geocoding API.
 * Updates metadata.location.coordinates with latitude/longitude.
 */

const postgres = require('postgres');

const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN || process.env.VITE_MAPBOX_TOKEN;
const DATABASE_URL = process.env.DATABASE_URL;

if (!MAPBOX_TOKEN) {
  console.error('❌ MAPBOX_TOKEN environment variable is required');
  process.exit(1);
}

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  console.error('   Example: postgresql://user:pass@host:port/database');
  process.exit(1);
}

/**
 * Geocode an address using Mapbox Geocoding API
 */
async function geocodeAddress(locationFormatted) {
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationFormatted)}.json?access_token=${MAPBOX_TOKEN}&country=NO&limit=1`;

    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`⚠️  Geocoding failed: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      console.warn(`⚠️  No results found`);
      return null;
    }

    const feature = data.features[0];
    const [longitude, latitude] = feature.center;

    return {
      latitude,
      longitude,
      formattedAddress: feature.place_name,
    };
  } catch (error) {
    console.error(`❌ Error geocoding:`, error.message);
    return null;
  }
}

/**
 * Main geocoding function
 */
async function geocodeRentalObjects() {
  console.log('🗺️  Starting rental object geocoding...\n');

  const sql = postgres(DATABASE_URL);

  try {
    // Fetch all rental objects
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
      
      // Check if already has coordinates
      const hasCoords = location.coordinates?.latitude && location.coordinates?.longitude;
      
      if (hasCoords) {
        console.log(`⏭️  ${obj.name} - Already has coordinates, skipping`);
        skippedCount++;
        continue;
      }

      // Get location formatted string
      const locationFormatted = location.formatted || 
                                `${address.street || ''} ${address.streetNumber || ''}, ${address.city || ''}`.trim();

      if (!locationFormatted || locationFormatted === ',') {
        console.log(`⚠️  ${obj.name} - No address found, skipping`);
        skippedCount++;
        continue;
      }

      console.log(`\n🔍 Geocoding: ${obj.name}`);
      console.log(`   Address: ${locationFormatted}`);

      const result = await geocodeAddress(locationFormatted);

      if (result) {
        // Update metadata with coordinates
        const updatedMetadata = {
          ...metadata,
          location: {
            ...location,
            coordinates: {
              latitude: result.latitude,
              longitude: result.longitude,
            },
            formatted: result.formattedAddress,
          },
          address: {
            ...address,
            coordinates: {
              latitude: result.latitude,
              longitude: result.longitude,
            },
          },
        };

        await sql`
          UPDATE domain.rental_objects
          SET metadata = ${JSON.stringify(updatedMetadata)}
          WHERE id = ${obj.id}
        `;

        console.log(`   ✅ Success: ${result.latitude}, ${result.longitude}`);
        successCount++;
      } else {
        console.log(`   ❌ Failed to geocode`);
        failCount++;
      }

      // Rate limiting: Wait 200ms between requests
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Geocoding complete!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Failed: ${failCount}`);
    console.log(`   Skipped: ${skippedCount}`);
    console.log(`   Total: ${objects.length}`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error during geocoding:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

// Run the script
geocodeRentalObjects()
  .then(() => {
    console.log('🎉 Geocoding script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Geocoding script failed:', error);
    process.exit(1);
  });
