import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock ResizeObserver as a class
global.ResizeObserver = class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};

// Mock document.getAnimations (needed for design system animations)
Document.prototype.getAnimations = vi.fn(() => []);

// Mock HTMLDialogElement (needed for Dialog component)
if (typeof HTMLDialogElement === 'undefined') {
  global.HTMLDialogElement = class HTMLDialogElement extends HTMLElement {
    open = false;
    returnValue = '';
    showModal = vi.fn(function (this: HTMLDialogElement) {
      this.open = true;
    });
    close = vi.fn(function (this: HTMLDialogElement) {
      this.open = false;
    });
    show = vi.fn(function (this: HTMLDialogElement) {
      this.open = true;
    });
  } as typeof HTMLDialogElement;
} else {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.open = true;
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.open = false;
  });
  HTMLDialogElement.prototype.show = vi.fn(function (this: HTMLDialogElement) {
    this.open = true;
  });
}
