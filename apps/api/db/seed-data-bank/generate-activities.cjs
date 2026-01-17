#!/usr/bin/env node
/**
 * Generate activity history seed data
 * Creates activity log entries for various platform actions
 */

const fs = require('fs');

const tenantId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
const organizationId = '11111111-1111-1111-1111-111111111111';

const userIds = [
  '00000000-0000-0000-0000-000000000001', // admin
  '00000000-0000-0000-0000-000000000002', // case_handler
  '00000000-0000-0000-0000-000000000003', // member
];

const actions = [
  { action: 'rental_object.created', resource: 'rental_object' },
  { action: 'rental_object.updated', resource: 'rental_object' },
  { action: 'rental_object.published', resource: 'rental_object' },
  { action: 'booking.created', resource: 'booking' },
  { action: 'booking.confirmed', resource: 'booking' },
  { action: 'booking.cancelled', resource: 'booking' },
  { action: 'user.created', resource: 'user' },
  { action: 'organization.updated', resource: 'organization' },
];

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

function generateActivity(index, baseDate) {
  const actionData = actions[index % actions.length];
  const userId = userIds[index % userIds.length];
  const timestamp = addMinutes(baseDate, -index * 30); // 30 min intervals going back
  
  return {
    id: `a${String(index).padStart(7, '0')}-0000-0000-0000-000000000000`,
    tenant_id: tenantId,
    organization_id: organizationId,
    actor_id: userId,
    actor_type: 'user',
    action: actionData.action,
    resource_type: actionData.resource,
    resource_id: `resource-${index}`,
    metadata: {
      ip_address: `192.168.1.${index % 255}`,
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      changes: index % 3 === 0 ? { field: 'status', from: 'draft', to: 'published' } : null,
    },
    created_at: timestamp.toISOString(),
  };
}

const activities = [];
const now = new Date();

// Generate 100 activity entries
for (let i = 0; i < 100; i++) {
  activities.push(generateActivity(i, now));
}

const seedData = {
  meta: {
    version: '1.0.0',
    created: new Date().toISOString(),
    description: 'Activity history seed data for Digilist Platform',
    total_activities: activities.length,
  },
  activities,
};

const outputPath = './activities-queue.json';
fs.writeFileSync(outputPath, JSON.stringify(seedData, null, 2));
console.log(`✅ Generated ${activities.length} activity entries`);
console.log(`   - Saved to: ${outputPath}`);
