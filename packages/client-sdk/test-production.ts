/**
 * SDK Integration Test against Production API
 * Tests the client-sdk against https://api.digilist.no
 */
import { FetchHttpClient } from './src/core/fetch-client';
import { PublicListingService } from './src/services/listing.service';
import { AuthService } from './src/services/auth.service';
import { SettingsService, BrregService, VippsService } from './src/services/integration.service';

const BASE_URL = 'https://api.digilist.no';
const TEST_TENANT_ID = 'a1b2c3d4-1234-5678-9abc-def012345678';

async function runTests() {
  console.log('🚀 Testing Client SDK against Production API\n');
  console.log(`   Base URL: ${BASE_URL}\n`);

  const results: { name: string; status: 'PASS' | 'FAIL'; details?: string }[] = [];

  // Create HTTP client
  const client = new FetchHttpClient({
    baseUrl: BASE_URL,
    tenantId: TEST_TENANT_ID,
  });

  // ========== PUBLIC ENDPOINTS ==========
  console.log('📦 Testing Public Endpoints...\n');

  // Test: Get Categories
  try {
    const categories = await client.get<{ data: any[] }>('/api/public/categories');
    if (categories.data && categories.data.length > 0) {
      results.push({ name: 'GET /api/public/categories', status: 'PASS', details: `${categories.data.length} categories` });
      console.log(`   ✅ Categories: ${categories.data.length} found`);
    } else {
      results.push({ name: 'GET /api/public/categories', status: 'FAIL', details: 'No categories returned' });
    }
  } catch (error: any) {
    results.push({ name: 'GET /api/public/categories', status: 'FAIL', details: error.message });
    console.log(`   ❌ Categories: ${error.message}`);
  }

  // Test: Get Listings
  try {
    const listings = await client.get<{ data: any[]; meta: any }>('/api/public/listings');
    if (listings.data) {
      results.push({ name: 'GET /api/public/listings', status: 'PASS', details: `${listings.data.length} listings` });
      console.log(`   ✅ Listings: ${listings.data.length} found`);
    } else {
      results.push({ name: 'GET /api/public/listings', status: 'FAIL', details: 'No data returned' });
    }
  } catch (error: any) {
    results.push({ name: 'GET /api/public/listings', status: 'FAIL', details: error.message });
    console.log(`   ❌ Listings: ${error.message}`);
  }

  // Test: Get Cities
  try {
    const cities = await client.get<{ data: any[] }>('/api/public/cities');
    if (cities.data) {
      results.push({ name: 'GET /api/public/cities', status: 'PASS', details: `${cities.data.length} cities` });
      console.log(`   ✅ Cities: ${cities.data.length} found`);
    } else {
      results.push({ name: 'GET /api/public/cities', status: 'FAIL', details: 'No data returned' });
    }
  } catch (error: any) {
    results.push({ name: 'GET /api/public/cities', status: 'FAIL', details: error.message });
    console.log(`   ❌ Cities: ${error.message}`);
  }

  // Test: Get Featured Listings
  try {
    const featured = await client.get<{ data: any[] }>('/api/public/featured');
    if (featured.data) {
      results.push({ name: 'GET /api/public/featured', status: 'PASS', details: `${featured.data.length} featured` });
      console.log(`   ✅ Featured: ${featured.data.length} found`);
    } else {
      results.push({ name: 'GET /api/public/featured', status: 'FAIL', details: 'No data returned' });
    }
  } catch (error: any) {
    results.push({ name: 'GET /api/public/featured', status: 'FAIL', details: error.message });
    console.log(`   ❌ Featured: ${error.message}`);
  }

  // ========== AUTH ENDPOINTS ==========
  console.log('\n🔐 Testing Auth Endpoints...\n');

  // Test: Get Auth Providers
  try {
    const providers = await client.get<{ data: any[] }>('/api/auth/providers');
    if (providers.data) {
      results.push({ name: 'GET /api/auth/providers', status: 'PASS', details: `${providers.data.length} providers` });
      console.log(`   ✅ Providers: ${providers.data.map(p => p.name).join(', ')}`);
    } else {
      results.push({ name: 'GET /api/auth/providers', status: 'FAIL', details: 'No data returned' });
    }
  } catch (error: any) {
    results.push({ name: 'GET /api/auth/providers', status: 'FAIL', details: error.message });
    console.log(`   ❌ Providers: ${error.message}`);
  }

  // Test: Get CSRF Token
  try {
    const csrf = await client.get<{ data: { csrfToken: string } }>('/api/auth/csrf');
    if (csrf.data?.csrfToken) {
      results.push({ name: 'GET /api/auth/csrf', status: 'PASS', details: 'Token received' });
      console.log(`   ✅ CSRF Token: ${csrf.data.csrfToken.substring(0, 10)}...`);
    } else {
      results.push({ name: 'GET /api/auth/csrf', status: 'FAIL', details: 'No token returned' });
    }
  } catch (error: any) {
    results.push({ name: 'GET /api/auth/csrf', status: 'FAIL', details: error.message });
    console.log(`   ❌ CSRF: ${error.message}`);
  }

  // ========== HEALTH ENDPOINTS ==========
  console.log('\n💚 Testing Health Endpoints...\n');

  // Test: Health Check
  try {
    const health = await client.get<{ status: string; version: string }>('/health');
    if (health.status === 'ok') {
      results.push({ name: 'GET /health', status: 'PASS', details: `v${health.version}` });
      console.log(`   ✅ Health: ${health.status} (v${health.version})`);
    } else {
      results.push({ name: 'GET /health', status: 'FAIL', details: health.status });
    }
  } catch (error: any) {
    results.push({ name: 'GET /health', status: 'FAIL', details: error.message });
    console.log(`   ❌ Health: ${error.message}`);
  }

  // Test: Liveness
  try {
    const live = await client.get<{ status: string; uptime: number }>('/health/live');
    if (live.status === 'alive') {
      results.push({ name: 'GET /health/live', status: 'PASS', details: `Uptime: ${Math.round(live.uptime)}s` });
      console.log(`   ✅ Liveness: ${live.status} (uptime: ${Math.round(live.uptime)}s)`);
    } else {
      results.push({ name: 'GET /health/live', status: 'FAIL', details: live.status });
    }
  } catch (error: any) {
    results.push({ name: 'GET /health/live', status: 'FAIL', details: error.message });
    console.log(`   ❌ Liveness: ${error.message}`);
  }

  // ========== DISCOUNT CODES ==========
  console.log('\n🏷️ Testing Discount Codes...\n');

  // Test: List Discount Codes
  try {
    const codes = await client.get<{ data: any[]; meta: any }>('/api/discount-codes');
    if (codes.data) {
      results.push({ name: 'GET /api/discount-codes', status: 'PASS', details: `${codes.data.length} codes` });
      console.log(`   ✅ Discount Codes: ${codes.data.length} found`);
      codes.data.forEach(c => console.log(`      - ${c.code}: ${c.value}% off`));
    } else {
      results.push({ name: 'GET /api/discount-codes', status: 'FAIL', details: 'No data returned' });
    }
  } catch (error: any) {
    results.push({ name: 'GET /api/discount-codes', status: 'FAIL', details: error.message });
    console.log(`   ❌ Discount Codes: ${error.message}`);
  }

  // Test: Validate Discount Code
  try {
    const validation = await client.post<{ data: { valid: boolean; reason?: string } }>('/api/discount-codes/validate', { code: 'WELCOME10' });
    results.push({ name: 'POST /api/discount-codes/validate', status: 'PASS', details: `Valid: ${validation.data.valid}` });
    console.log(`   ✅ Validate WELCOME10: ${validation.data.valid ? '✓ Valid' : '✗ Invalid'}`);
  } catch (error: any) {
    results.push({ name: 'POST /api/discount-codes/validate', status: 'FAIL', details: error.message });
    console.log(`   ❌ Validate: ${error.message}`);
  }

  // ========== AUTHZ ENDPOINTS ==========
  console.log('\n🛡️ Testing Authorization...\n');

  // Test: Check Permission (anonymous)
  try {
    const check = await client.get<{ data: { allowed: boolean; role: string } }>('/api/authz/check?resource=bookings&action=read');
    results.push({ name: 'GET /api/authz/check', status: 'PASS', details: `Role: ${check.data.role}` });
    console.log(`   ✅ Permission Check: role=${check.data.role}, allowed=${check.data.allowed}`);
  } catch (error: any) {
    results.push({ name: 'GET /api/authz/check', status: 'FAIL', details: error.message });
    console.log(`   ❌ Permission Check: ${error.message}`);
  }

  // ========== SUMMARY ==========
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60) + '\n');

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const total = results.length;

  console.log(`   Total:  ${total}`);
  console.log(`   Passed: ${passed} ✅`);
  console.log(`   Failed: ${failed} ❌`);
  console.log(`   Rate:   ${Math.round((passed / total) * 100)}%\n`);

  if (failed > 0) {
    console.log('Failed tests:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`   ❌ ${r.name}: ${r.details}`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log(`🏁 SDK Integration Tests Complete - ${passed}/${total} passed`);
  console.log('='.repeat(60) + '\n');

  return { passed, failed, total, results };
}

runTests().catch(console.error);
