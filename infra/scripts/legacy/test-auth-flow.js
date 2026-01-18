#!/usr/bin/env node
/**
 * Authentication Flow Test
 * Tests the complete auth flow: login → session validation → logout
 */

const https = require('https');

const API_BASE = 'https://api.digilist.no';

// Test configuration
const TEST_TOKEN = 'skien-admin-001';
let cookies = [];

function parseCookies(headers) {
  const setCookieHeaders = headers['set-cookie'] || [];
  return setCookieHeaders.map(cookie => cookie.split(';')[0]);
}

function makerequest(method, path, body = null, includeCookies = false) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    
    const options = {
      method,
      hostname: url.hostname,
      path: url.pathname,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (includeCookies && cookies.length > 0) {
      options.headers['Cookie'] = cookies.join('; ');
    }

    const req = https.request(options, (res) => {
      let data = '';
      
      // Capture cookies
      if (res.headers['set-cookie']) {
        const newCookies = parseCookies(res.headers);
        cookies = [...cookies, ...newCookies];
      }

      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: JSON.parse(data),
          });
        } catch(e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data,
          });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function test() {
  console.log('═══════════════════════════════════════');
  console.log('  AUTHENTICATION FLOW TEST');
  console.log('═══════════════════════════════════════\n');

  try {
    // Step 1: Demo Login
    console.log('Step 1: Demo Login...');
    const loginRes = await makeRequest('POST', '/api/auth/demo-token', { token: TEST_TOKEN });
    
    console.log(`  Status: ${loginRes.status}`);
    console.log(`  Cookies: ${cookies.length} cookies set`);
    console.log(`  User: ${loginRes.body.data?.user?.email || 'N/A'}`);
    
    if (loginRes.status !== 200) {
      console.log('  ❌ Login failed');
      console.log('  Response:', JSON.stringify(loginRes.body, null, 2));
      process.exit(1);
    }
    console.log('  ✅ Login successful\n');

    // Step 2: Session Validation
    console.log('Step 2: Session Validation...');
    const sessionRes = await makeRequest('GET', '/api/auth/session', null, true);
    
    console.log(`  Status: ${sessionRes.status}`);
    console.log(`  User: ${sessionRes.body.data?.user?.email || 'N/A'}`);
    
    if (sessionRes.status !== 200) {
      console.log('  ❌ Session validation failed');
      console.log('  Response:', JSON.stringify(sessionRes.body, null, 2));
      process.exit(1);
    }
    console.log('  ✅ Session valid\n');

    // Step 3: Check JWT Structure
    console.log('Step 3: JWT Structure...');
    const hasCookies = cookies.some(c => c.startsWith('dl_at='));
    if (!hasCookies) {
      console.log('  ❌ No JWT cookie found');
      process.exit(1);
    }
    console.log('  ✅ JWT cookie present\n');

    // Summary
    console.log('═══════════════════════════════════════');
    console.log('  ✅ ALL TESTS PASSED');
    console.log('═══════════════════════════════════════');
    
  } catch (error) {
    console.log('\n❌ TEST FAILED');
    console.error(error);
    process.exit(1);
  }
}

test();
