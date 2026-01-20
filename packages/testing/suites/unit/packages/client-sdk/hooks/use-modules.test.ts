/**
 * SDK Modules Tests
 * Unit tests for modules hooks and navigation utilities
 */

import { describe, it, expect } from 'vitest';
import {
  filterNavItemsByCapabilities,
  annotateNavItems,
  type NavItem,
} from '@digilist/api/use-navigation';

describe('filterNavItemsByCapabilities', () => {
  const testItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', href: '/' },
    { id: 'ratings', label: 'Ratings', href: '/ratings', requiredCapability: 'ratings' },
    { id: 'messaging', label: 'Messages', href: '/messages', requiredCapability: 'messaging' },
    { id: 'settings', label: 'Settings', href: '/settings' },
  ];

  it('should return all items when all capabilities are available', () => {
    const capabilities = { ratings: true, messaging: true };
    const filtered = filterNavItemsByCapabilities(testItems, capabilities);

    expect(filtered.length).toBe(4);
    expect(filtered.map(i => i.id)).toEqual(['dashboard', 'ratings', 'messaging', 'settings']);
  });

  it('should filter out items when capability is missing', () => {
    const capabilities = { ratings: true }; // messaging missing
    const filtered = filterNavItemsByCapabilities(testItems, capabilities);

    expect(filtered.length).toBe(3);
    expect(filtered.map(i => i.id)).toEqual(['dashboard', 'ratings', 'settings']);
  });

  it('should keep items without capability requirements', () => {
    const capabilities = {}; // no capabilities
    const filtered = filterNavItemsByCapabilities(testItems, capabilities);

    expect(filtered.length).toBe(2);
    expect(filtered.map(i => i.id)).toEqual(['dashboard', 'settings']);
  });

  it('should handle nested children', () => {
    const nestedItems: NavItem[] = [
      {
        id: 'booking',
        label: 'Booking',
        href: '/booking',
        children: [
          { id: 'calendar', label: 'Calendar', href: '/booking/calendar' },
          { id: 'ratings', label: 'Ratings', href: '/booking/ratings', requiredCapability: 'ratings' },
        ],
      },
    ];

    const capabilities = {}; // no ratings capability
    const filtered = filterNavItemsByCapabilities(nestedItems, capabilities);

    expect(filtered[0].children?.length).toBe(1);
    expect(filtered[0].children?.[0].id).toBe('calendar');
  });
});

describe('annotateNavItems', () => {
  const testItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', href: '/' },
    { id: 'ratings', label: 'Ratings', href: '/ratings', requiredModule: 'RATINGS' },
    { id: 'messaging', label: 'Messages', href: '/messages', requiredCapability: 'messaging' },
  ];

  it('should annotate items with enabled status', () => {
    const capabilities = { messaging: true };
    const enabledModules = ['RATINGS'];
    const annotated = annotateNavItems(testItems, capabilities, enabledModules);

    expect(annotated[0].isEnabled).toBe(true);
    expect(annotated[1].isEnabled).toBe(true); // RATINGS module enabled
    expect(annotated[2].isEnabled).toBe(true); // messaging capability present
  });

  it('should mark items as disabled when module is missing', () => {
    const capabilities = { messaging: true };
    const enabledModules: string[] = []; // RATINGS not enabled
    const annotated = annotateNavItems(testItems, capabilities, enabledModules);

    expect(annotated[1].isEnabled).toBe(false);
    expect(annotated[1].disabledReason).toBe('module_disabled');
  });

  it('should mark items as disabled when capability is missing', () => {
    const capabilities = {}; // no messaging capability
    const enabledModules = ['RATINGS'];
    const annotated = annotateNavItems(testItems, capabilities, enabledModules);

    expect(annotated[2].isEnabled).toBe(false);
    expect(annotated[2].disabledReason).toBe('capability_missing');
  });
});
