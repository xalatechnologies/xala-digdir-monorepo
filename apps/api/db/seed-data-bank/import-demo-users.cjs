#!/usr/bin/env node
/**
 * Import Demo Users
 * Imports demo users with tokens from demo-users.json into the database
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function importDemoUsers() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/digilist_prod'
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Read demo users file
    const usersFile = path.join(__dirname, 'demo-users.json');
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    console.log(`📄 Loaded ${users.length} demo users from demo-users.json`);

    // Get the first tenant ID
    const tenantResult = await client.query('SELECT id FROM public.tenants LIMIT 1');
    if (tenantResult.rows.length === 0) {
      throw new Error('No tenants found in database. Please create a tenant first.');
    }
    const tenantId = tenantResult.rows[0].id;
    console.log(`🏢 Using tenant ID: ${tenantId}`);

    // Insert or update each user
    let inserted = 0;
    let updated = 0;

    for (const user of users) {
      try {
        // Check if user exists
        const existingUser = await client.query(
          'SELECT id FROM public.users WHERE email = $1',
          [user.email]
        );

        if (existingUser.rows.length > 0) {
          // Update existing user (including tenant_id if missing)
          await client.query(
            `UPDATE public.users
             SET name = $1, role = $2, demo_token = $3, status = $4, national_id = $5, metadata = $6, tenant_id = COALESCE(tenant_id, $8)
             WHERE email = $7`,
            [
              user.name,
              user.role,
              user.demo_token || null,
              user.status,
              user.national_id || null,
              JSON.stringify(user.metadata || {}),
              user.email,
              tenantId
            ]
          );
          updated++;
          const identifier = user.demo_token || user.national_id || user.email;
          console.log(`  ✏️  Updated: ${user.email} (${identifier})`);
        } else {
          // Insert new user
          await client.query(
            `INSERT INTO public.users (id, email, name, role, tenant_id, status, demo_token, national_id, metadata, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
            [
              user.id,
              user.email,
              user.name,
              user.role,
              tenantId,
              user.status,
              user.demo_token || null,
              user.national_id || null,
              JSON.stringify(user.metadata || {})
            ]
          );
          inserted++;
          const identifier = user.demo_token || user.national_id || user.email;
          console.log(`  ➕ Inserted: ${user.email} (${identifier})`);
        }
      } catch (error) {
        console.error(`  ❌ Error processing ${user.email}:`, error.message);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`  • Inserted: ${inserted} users`);
    console.log(`  • Updated: ${updated} users`);
    console.log(`  • Total: ${inserted + updated} users`);

    // Show final list of demo users
    const finalUsers = await client.query(
      'SELECT email, name, role, demo_token FROM public.users WHERE demo_token IS NOT NULL ORDER BY email'
    );
    console.log('\n✅ Current demo users in database:');
    for (const row of finalUsers.rows) {
      console.log(`  • ${row.email} (${row.role}): ${row.demo_token}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the import
importDemoUsers();
