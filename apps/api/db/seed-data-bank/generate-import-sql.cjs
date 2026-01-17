#!/usr/bin/env node
const fs = require('fs');

const usersFile = process.argv[2];
const tenantId = process.argv[3];

if (!usersFile || !tenantId) {
  console.error('Usage: node generate-import-sql.js <users-json-file> <tenant-id>');
  process.exit(1);
}

const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));

users.forEach(user => {
  const metadata = JSON.stringify(user.metadata || {}).replace(/'/g, "''");
  const demoToken = user.demo_token ? `'${user.demo_token}'` : 'NULL';
  const nationalId = user.national_id ? `'${user.national_id}'` : 'NULL';
  const name = user.name.replace(/'/g, "''");

  console.log(`
INSERT INTO platform.users (id, email, name, role, tenant_id, status, demo_token, national_id, metadata, created_at)
VALUES ('${user.id}', '${user.email}', '${name}', '${user.role}', '${tenantId}', '${user.status}', ${demoToken}, ${nationalId}, '${metadata}', NOW())
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    role = EXCLUDED.role,
    demo_token = EXCLUDED.demo_token,
    national_id = EXCLUDED.national_id,
    status = EXCLUDED.status,
    metadata = EXCLUDED.metadata;
`);
});
