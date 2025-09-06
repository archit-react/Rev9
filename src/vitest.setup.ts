// vitest.setup.ts
import "@testing-library/jest-dom/vitest";
import * as matchers from "jest-extended";
import { expect, vi } from "vitest";

// Extend expect with jest-extended matchers
expect.extend(matchers);

// Mock matchMedia for Vitest (jsdom doesn't support it natively)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});
