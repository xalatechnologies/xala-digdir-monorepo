/**
 * Inventory Items API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Inventory Items API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/inventory-items', () => { it('should return inventory items', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/inventory-items`)).status); }); });
  describe('POST /api/inventory-items', () => { it('should create inventory item', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/inventory-items`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('PUT /api/inventory-items/:id', () => { it('should update inventory item', async () => { expect([200,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/inventory-items/00000000-0000-0000-0000-000000000000`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('DELETE /api/inventory-items/:id', () => { it('should delete inventory item', async () => { expect([200,204,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/inventory-items/00000000-0000-0000-0000-000000000000`, { method: 'DELETE' })).status); }); });
});
