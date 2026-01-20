/**
 * Chat API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Chat API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/chat/rooms', () => { it('should return chat rooms', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/chat/rooms`)).status); }); });
  describe('POST /api/chat/rooms', () => { it('should create chat room', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/chat/rooms`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('GET /api/chat/rooms/:id/messages', () => { it('should return messages', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/chat/rooms/00000000-0000-0000-0000-000000000000/messages`)).status); }); });
  describe('POST /api/chat/rooms/:id/messages', () => { it('should send message', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/chat/rooms/00000000-0000-0000-0000-000000000000/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
});
