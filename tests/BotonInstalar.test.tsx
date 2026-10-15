/**
 * Cobertura permanente de components/BannerInstalarPWA.tsx (y retrocompatibilidad con BotonInstalar).
 *
 * Verifica el contrato de UI/UX y PWA del nuevo banner flotante inferior:
 *  · Sin vía de instalación ni evento -> no renderiza nada (null).
 *  · Android/Desktop con beforeinstallprompt -> renderiza el banner flotante con:
 *      - Emblema editorial DiarioIA.
 *      - Título "Instalar DiarioIA" y subtítulo "Acceso rápido y pantalla completa".
 *      - Botón de acción "Instalar".
 *      - Botón accesible para descartar aviso ("✕").
 *  · Descarte persistente:
 *      - Al pulsar descartar ("✕"), almacena en localStorage `diarioia_pwa_dismissed_until`
 *        con fecha de 7 días y oculta el banner inmediatamente.
 *      - Si existe una fecha de descarte futura en localStorage, no se renderiza.
 *  · iOS:
 *      - Detecta iPhone / iPad (incluso iPadOS MacIntel con touch).
 *      - Muestra el banner flotante con botón "Instalar".
 *      - Al pulsar "Instalar", despliega la guía paso a paso ("Compartir ⎋ → Añadir a pantalla de inicio ➕").
 *      - Permite cerrar la guía con Escape o con su botón de cierre.
 *  · Modo standalone (display-mode o navigator.standalone) o appinstalled -> null.
 */
import { render, screen, fireEvent, cleanup, waitFor, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import BannerInstalarPWA from "@/components/BannerInstalarPWA";

const UA_DESKTOP =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const UA_IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const UA_MAC =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";

interface EventoInstalacion extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface OpcionesNavigator {
  userAgent?: string;
  platform?: string;
  maxTouchPoints?: number;
  standalone?: boolean;
}

function setNavigator({
  userAgent = UA_DESKTOP,
  platform = "Linux x86_64",
  maxTouchPoints = 0,
  standalone = false,
}: OpcionesNavigator = {}): void {
  Object.defineProperty(window.navigator, "userAgent", { value: userAgent, configurable: true });
  Object.defineProperty(window.navigator, "platform", { value: platform, configurable: true });
  Object.defineProperty(window.navigator, "maxTouchPoints", {
    value: maxTouchPoints,
    configurable: true,
  });
  Object.defineProperty(window.navigator, "standalone", { value: standalone, configurable: true });
}

function mockMatchMedia(standalone: boolean): void {
  window.matchMedia = ((query: string) => ({
    matches: standalone,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

function dispararBeforeInstallPrompt(outcome: "accepted" | "dismissed" = "accepted") {
  const evento = new Event("beforeinstallprompt") as EventoInstalacion;
  const prompt = vi.fn(async () => {});
  evento.prompt = prompt;
  evento.userChoice = Promise.resolve({ outcome, platform: "web" });
  act(() => {
    window.dispatchEvent(evento);
  });
  return { evento, prompt };
}

beforeEach(() => {
  localStorage.clear();
  setNavigator();
  mockMatchMedia(false);
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  setNavigator();
  mockMatchMedia(false);
});

describe("BannerInstalarPWA — Visibilidad y estructura editorial", () => {
  it("no renderiza nada sin vía de instalación (desktop sin beforeinstallprompt)", () => {
    const { container } = render(<BannerInstalarPWA />);
    expect(container.querySelector("aside")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("muestra el banner flotante tras beforeinstallprompt con textos y acciones correctas", () => {
    render(<BannerInstalarPWA />);
    dispararBeforeInstallPrompt();

    const banner = screen.getByRole("complementary", {
      name: "Aviso de instalación de DiarioIA",
    });
    expect(banner).toBeTruthy();
    expect(banner.textContent).toContain("Instalar DiarioIA");
    expect(banner.textContent).toContain("Acceso rápido y pantalla completa");

    const botonInstalar = screen.getByRole("button", { name: "Instalar" });
    expect(botonInstalar).toBeTruthy();

    const botonDescartar = screen.getByRole("button", {
      name: "Descartar aviso de instalación",
    });
    expect(botonDescartar).toBeTruthy();
  });
});

describe("BannerInstalarPWA — Descarte persistente (7 días)", () => {
  it("al pulsar el botón de descarte ✕ oculta el banner y guarda timestamp en localStorage", () => {
    const ahora = 1700000000000;
    vi.spyOn(Date, "now").mockReturnValue(ahora);

    render(<BannerInstalarPWA />);
    dispararBeforeInstallPrompt();

    const botonDescartar = screen.getByRole("button", {
      name: "Descartar aviso de instalación",
    });
    fireEvent.click(botonDescartar);

    expect(screen.queryByRole("complementary")).toBeNull();

    const guardado = localStorage.getItem("diarioia_pwa_dismissed_until");
    expect(guardado).toBe(String(ahora + 7 * 24 * 60 * 60 * 1000));

    vi.restoreAllMocks();
  });

  it("no renderiza el banner si ya está descartado con fecha en el futuro", () => {
    const ahora = 1700000000000;
    vi.spyOn(Date, "now").mockReturnValue(ahora);
    localStorage.setItem(
      "diarioia_pwa_dismissed_until",
      String(ahora + 5 * 24 * 60 * 60 * 1000)
    );

    render(<BannerInstalarPWA />);
    dispararBeforeInstallPrompt();

    expect(screen.queryByRole("complementary")).toBeNull();

    vi.restoreAllMocks();
  });

  it("renderiza el banner si el descarte previo ya expiró", () => {
    const ahora = 1700000000000;
    vi.spyOn(Date, "now").mockReturnValue(ahora);
    localStorage.setItem(
      "diarioia_pwa_dismissed_until",
      String(ahora - 1000)
    );

    render(<BannerInstalarPWA />);
    dispararBeforeInstallPrompt();

    expect(
      screen.getByRole("complementary", { name: "Aviso de instalación de DiarioIA" })
    ).toBeTruthy();

    vi.restoreAllMocks();
  });
});

describe("BannerInstalarPWA — Guía en iOS Safari", () => {
  it("en iPhone muestra el banner y abre la guía interactiva al pulsar Instalar", () => {
    setNavigator({ userAgent: UA_IPHONE, platform: "iPhone", maxTouchPoints: 5 });
    render(<BannerInstalarPWA />);

    const banner = screen.getByRole("complementary", {
      name: "Aviso de instalación de DiarioIA",
    });
    expect(banner).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();

    const botonInstalar = screen.getByRole("button", { name: "Instalar" });
    fireEvent.click(botonInstalar);

    const dialog = screen.getByRole("dialog", { name: "Cómo instalar DiarioIA en iOS" });
    expect(dialog).toBeTruthy();
    expect(dialog.textContent).toContain("Compartir");
    expect(dialog.textContent).toContain("Añadir a pantalla de inicio");
  });

  it("detecta iPadOS 13+ (MacIntel con multitouch) como iOS", () => {
    setNavigator({ userAgent: UA_MAC, platform: "MacIntel", maxTouchPoints: 5 });
    render(<BannerInstalarPWA />);

    expect(
      screen.getByRole("complementary", { name: "Aviso de instalación de DiarioIA" })
    ).toBeTruthy();
  });

  it("cierra la guía de iOS con la tecla Escape", () => {
    setNavigator({ userAgent: UA_IPHONE, platform: "iPhone", maxTouchPoints: 5 });
    render(<BannerInstalarPWA />);

    fireEvent.click(screen.getByRole("button", { name: "Instalar" }));
    expect(screen.getByRole("dialog")).toBeTruthy();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("cierra la guía de iOS al pulsar su botón de cerrar", () => {
    setNavigator({ userAgent: UA_IPHONE, platform: "iPhone", maxTouchPoints: 5 });
    render(<BannerInstalarPWA />);

    fireEvent.click(screen.getByRole("button", { name: "Instalar" }));
    expect(screen.getByRole("dialog")).toBeTruthy();

    const botonCerrarGuia = screen.getByRole("button", {
      name: "Cerrar instrucciones de instalación",
    });
    fireEvent.click(botonCerrarGuia);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("BannerInstalarPWA — Estado instalado", () => {
  it("no renderiza nada si display-mode es standalone", () => {
    mockMatchMedia(true);
    const { container } = render(<BannerInstalarPWA />);
    expect(container.querySelector("aside")).toBeNull();
  });

  it("no renderiza nada si navigator.standalone es true (iOS standalone)", () => {
    setNavigator({ userAgent: UA_IPHONE, platform: "iPhone", standalone: true });
    const { container } = render(<BannerInstalarPWA />);
    expect(container.querySelector("aside")).toBeNull();
  });

  it("oculta el banner al recibir el evento appinstalled", () => {
    render(<BannerInstalarPWA />);
    dispararBeforeInstallPrompt();
    expect(screen.getByRole("complementary")).toBeTruthy();

    act(() => {
      window.dispatchEvent(new Event("appinstalled"));
    });

    expect(screen.queryByRole("complementary")).toBeNull();
  });
});

describe("BannerInstalarPWA — Flujo de instalación", () => {
  it("al pulsar Instalar invoca prompt(); si acepta, deja de renderizar", async () => {
    render(<BannerInstalarPWA />);
    const { prompt } = dispararBeforeInstallPrompt("accepted");

    fireEvent.click(screen.getByRole("button", { name: "Instalar" }));

    await waitFor(() => {
      expect(screen.queryByRole("complementary")).toBeNull();
    });
    expect(prompt).toHaveBeenCalledTimes(1);
  });

  it("si el usuario cancela en el diálogo nativo, el banner se retira", async () => {
    render(<BannerInstalarPWA />);
    const { prompt } = dispararBeforeInstallPrompt("dismissed");

    fireEvent.click(screen.getByRole("button", { name: "Instalar" }));

    await waitFor(() => {
      expect(screen.queryByRole("complementary")).toBeNull();
    });
    expect(prompt).toHaveBeenCalledTimes(1);
  });
});
