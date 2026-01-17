#!/usr/bin/env node
/**
 * Generate bookings and calendar seed data
 * Creates realistic booking patterns for the next 30 days
 */

const fs = require('fs');

// Get rental object IDs (first 20 for variety)
const rentalObjectIds = Array.from({ length: 20 }, (_, i) => 
  `d${String(i + 1).padStart(7, '0')}-0000-0000-0000-000000000000`
);

const userIds = [
  '00000000-0000-0000-0000-000000000001', // admin
  '00000000-0000-0000-0000-000000000002', // case_handler
  '00000000-0000-0000-0000-000000000003', // member
];

const tenantId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function generateBooking(index, date, rentalObjectId, userId) {
  const startHour = 8 + (index % 12);
  const duration = [1, 2, 3, 4][index % 4];
  
  const startDate = new Date(date);
  startDate.setHours(startHour, 0, 0, 0);
  
  const endDate = new Date(startDate);
  endDate.setHours(startHour + duration, 0, 0, 0);
  
  const statuses = ['confirmed', 'pending', 'completed', 'cancelled'];
  const status = index < 40 ? 'confirmed' : statuses[index % 4];
  
  return {
    id: `b${String(index).padStart(7, '0')}-0000-0000-0000-000000000000`,
    tenant_id: tenantId,
    rental_object_id: rentalObjectId,
    user_id: userId,
    start_time: startDate.toISOString(),
    end_time: endDate.toISOString(),
    status,
    total_price: 500 + (index % 10) * 100,
    currency: 'NOK',
    notes: `Generated booking ${index + 1}`,
    created_at: addDays(startDate, -7).toISOString(),
    updated_at: addDays(startDate, -1).toISOString(),
  };
}

const bookings = [];
const today = new Date();

// Generate 50 bookings over next 30 days
for (let i = 0; i < 50; i++) {
  const dayOffset = i % 30;
  const date = addDays(today, dayOffset);
  const rentalObjId = rentalObjectIds[i % rentalObjectIds.length];
  const userId = userIds[i % userIds.length];
  
  bookings.push(generateBooking(i, date, rentalObjId, userId));
}

const seedData = {
  meta: {
    version: '1.0.0',
    created: new Date().toISOString(),
    description: 'Booking and calendar seed data for Digilist Platform',
    total_bookings: bookings.length,
  },
  bookings,
};

const outputPath = './bookings-calendar.json';
fs.writeFileSync(outputPath, JSON.stringify(seedData, null, 2));
console.log(`✅ Generated ${bookings.length} bookings`);
console.log(`   - Saved to: ${outputPath}`);
