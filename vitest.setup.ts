import "@testing-library/jest-dom";
import { AsyncLocalStorage } from "node:async_hooks";

// Polyfill de AsyncLocalStorage para módulos de servidor Next.js en entorno jsdom
if (typeof globalThis.AsyncLocalStorage === "undefined") {
  globalThis.AsyncLocalStorage = AsyncLocalStorage;
}

// Mock de localStorage para entorno jsdom / Node 22+
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, value: string) => {
    store[key] = value.toString();
  },
  removeItem: (key: string) => {
    delete store[key];
  },
  clear: () => {
    for (const key of Object.keys(store)) {
      delete store[key];
    }
  },
  key: (index: number) => Object.keys(store)[index] || null,
  get length() {
    return Object.keys(store).length;
  },
};

if (typeof window !== "undefined") {
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
    writable: true,
  });
}
