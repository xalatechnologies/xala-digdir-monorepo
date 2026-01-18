/**
 * Mock Playwright for tests
 */

export const mockPage = {
  goto: async () => ({ status: () => 200 }),
  waitForSelector: async () => ({}),
  click: async () => {},
  fill: async () => {},
  type: async () => {},
  evaluate: async (fn: any) => fn(),
  $: async () => null,
  $$: async () => [],
  close: async () => {},
};

export const mockBrowser = {
  newPage: async () => mockPage,
  close: async () => {},
};

export const mockBrowserType = {
  launch: async () => mockBrowser,
};

export const chromium = mockBrowserType;
export const firefox = mockBrowserType;
export const webkit = mockBrowserType;
