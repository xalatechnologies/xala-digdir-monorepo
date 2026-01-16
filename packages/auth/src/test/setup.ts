/**
 * Test setup file
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.history
if (!window.history.replaceState) {
  window.history.replaceState = vi.fn();
}

// Mock window.location
if (!window.location) {
  Object.defineProperty(window, 'location', {
    value: {
      href: 'http://localhost',
      origin: 'http://localhost',
      pathname: '/',
      search: '',
    },
    writable: true,
  });
}
