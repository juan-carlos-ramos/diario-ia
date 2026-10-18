/**
 * Cobertura de components/AvisoActualizacion.tsx:
 *  · Aparece si hay un SW en `waiting`.
 *  · "Ahora no" guarda la marca de 24 h y oculta el aviso.
 *  · Marca vigente al montar -> no aparece; marca expirada -> aparece.
 */
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const { serwistMock } = vi.hoisted(() => ({
  serwistMock: {
    serwist: {
      addEventListener: () => {},
      removeEventListener: () => {},
      messageSkipWaiting: () => {},
    },
  },
}));

vi.mock("@serwist/turbopack/react", () => ({
  useSerwist: () => serwistMock,
}));

import AvisoActualizacion from "@/components/AvisoActualizacion";

const CLAVE = "diarioia_aviso_sw_descartado_hasta";
const DIA_MS = 24 * 60 * 60 * 1000;

function mockServiceWorker(conWaiting: boolean) {
  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    value: {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      getRegistration: vi.fn().mockResolvedValue(conWaiting ? { waiting: {} } : undefined),
    },
  });
}

describe("AvisoActualizacion", () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockServiceWorker(true);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("aparece si hay un SW en waiting, con el texto nuevo", async () => {
    render(<AvisoActualizacion />);
    expect(await screen.findByText("Nueva versión lista")).toBeTruthy();
    expect(screen.getByText("Hay mejoras de la app disponibles.")).toBeTruthy();
  });

  it("al pulsar 'Ahora no' guarda la marca de 24 h y desaparece", async () => {
    const antes = Date.now();
    render(<AvisoActualizacion />);
    fireEvent.click(await screen.findByRole("button", { name: "Ahora no" }));

    const marca = Number(window.localStorage.getItem(CLAVE));
    expect(marca).toBeGreaterThanOrEqual(antes + DIA_MS);
    expect(marca).toBeLessThanOrEqual(Date.now() + DIA_MS);
    expect(screen.queryByText("Nueva versión lista")).toBeNull();
  });

  it("no aparece si al montar existe una marca vigente", async () => {
    window.localStorage.setItem(CLAVE, String(Date.now() + DIA_MS));
    render(<AvisoActualizacion />);
    await waitFor(() => expect(navigator.serviceWorker.getRegistration).toHaveBeenCalled());
    await new Promise((r) => setTimeout(r, 20));
    expect(screen.queryByText("Nueva versión lista")).toBeNull();
  });

  it("aparece si la marca ya expiró", async () => {
    window.localStorage.setItem(CLAVE, String(Date.now() - 1000));
    render(<AvisoActualizacion />);
    expect(await screen.findByText("Nueva versión lista")).toBeTruthy();
  });
});
