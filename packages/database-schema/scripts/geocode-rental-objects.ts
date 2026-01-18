#!/usr/bin/env tsx
/**
 * Geocode Rental Objects Script
 * 
 * Fetches all rental objects without coordinates and geocodes them using Mapbox Geocoding API.
 * Updates the database with latitude/longitude coordinates.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, isNull, or } from 'drizzle-orm';
import { rentalObjects } from '../src/domain';

const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN || process.env.VITE_MAPBOX_TOKEN;
const DATABASE_URL = process.env.DATABASE_URL;

if (!MAPBOX_TOKEN) {
  console.error('❌ MAPBOX_TOKEN environment variable is required');
  process.exit(1);
}

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

/**
 * Geocode an address using Mapbox Geocoding API
 */
async function geocodeAddress(address: string, city?: string, postalCode?: string): Promise<GeocodeResult | null> {
  try {
    // Build search query
    const searchQuery = [address, city, postalCode, 'Norway']
      .filter(Boolean)
      .join(', ');

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${MAPBOX_TOKEN}&country=NO&limit=1`;

    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`⚠️  Geocoding failed for "${searchQuery}": ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      console.warn(`⚠️  No results found for "${searchQuery}"`);
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
    console.error(`❌ Error geocoding "${address}":`, error);
    return null;
  }
}

/**
 * Main geocoding function
 */
async function geocodeRentalObjects() {
  console.log('🗺️  Starting rental object geocoding...\n');

  const client = postgres(DATABASE_URL);
  const db = drizzle(client);

  try {
    // Fetch rental objects without coordinates
    const objectsToGeocode = await db
      .select({
        id: rentalObjects.id,
        name: rentalObjects.name,
        address: rentalObjects.address,
        city: rentalObjects.city,
        postalCode: rentalObjects.postalCode,
      })
      .from(rentalObjects)
      .where(
        or(
          isNull(rentalObjects.latitude),
          isNull(rentalObjects.longitude)
        )
      );

    console.log(`📍 Found ${objectsToGeocode.length} rental objects without coordinates\n`);

    if (objectsToGeocode.length === 0) {
      console.log('✅ All rental objects already have coordinates!');
      await client.end();
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const obj of objectsToGeocode) {
      console.log(`\n🔍 Geocoding: ${obj.name}`);
      console.log(`   Address: ${obj.address}, ${obj.city} ${obj.postalCode}`);

      const result = await geocodeAddress(obj.address, obj.city, obj.postalCode);

      if (result) {
        // Update database with coordinates
        await db
          .update(rentalObjects)
          .set({
            latitude: result.latitude,
            longitude: result.longitude,
            locationFormatted: result.formattedAddress,
          })
          .where(eq(rentalObjects.id, obj.id));

        console.log(`   ✅ Success: ${result.latitude}, ${result.longitude}`);
        successCount++;
      } else {
        console.log(`   ❌ Failed to geocode`);
        failCount++;
      }

      // Rate limiting: Wait 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Geocoding complete!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Failed: ${failCount}`);
    console.log(`   Total: ${objectsToGeocode.length}`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error during geocoding:', error);
    throw error;
  } finally {
    await client.end();
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
