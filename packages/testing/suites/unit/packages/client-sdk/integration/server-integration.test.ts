/**
 * Integration Test Setup
 * 
 * Provides utilities for running integration tests against a running API server
 * These tests require: pnpm --filter @digilist/api dev
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { setupMockApi } from '@digilist/api/../mocks/api-server.mock';

// ==============================================================================
// Test Configuration
// ==============================================================================

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';
const TEST_TENANT_ID = 'test-tenant';

// ==============================================================================
// API Client for Integration Tests
// ==============================================================================

async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T; status: number }> {
  const url = `${API_BASE_URL}${path}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-ID': TEST_TENANT_ID,
      ...options.headers,
    },
  });

  const data = await response.json();
  return { data, status: response.status };
}

// ==============================================================================
// Health Check
// ==============================================================================

async function waitForServer(maxAttempts = 10): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) return true;
    } catch {
      // Server not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return false;
}

// ==============================================================================
// Integration Tests
// ==============================================================================

describe('API Integration Tests', () => {
  // Setup mock API server for all tests
  setupMockApi();

  let serverAvailable = false;

  beforeAll(async () => {
    serverAvailable = await waitForServer(3); // Quick check
