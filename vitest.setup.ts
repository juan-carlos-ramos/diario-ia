import "@testing-library/jest-dom";

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

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

