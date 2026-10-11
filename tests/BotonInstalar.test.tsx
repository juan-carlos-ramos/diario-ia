/**
 * Cobertura permanente de components/BotonInstalar.tsx
 *
 * Verifica el contrato Poka-Yoke del botón de instalación PWA:
 *  · Nunca renderiza un botón muerto (sin vía de instalación → null).
 *  · Android/desktop: botón tras `beforeinstallprompt`, con nombre accesible.
 *  · iOS: guía manual disclosure con `role="dialog"`, aria-haspopup/expanded,
 *    cierre con Escape o con ✕ devolviendo el foco al botón.
 *  · Modo standalone (display-mode o navigator.standalone) → null.
 *
 * Los casos replican el comportamiento real del componente (leído íntegro antes
 * de escribirlos). Mocks deterministas: sin red, sin timers reales.
 */
import { render, screen, fireEvent, cleanup, waitFor, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import BotonInstalar from "@/components/BotonInstalar";

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

/** Sustituye los campos de navigator que el componente consulta. */
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

/** Mock determinista de matchMedia (solo se usa con queries de display-mode). */
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

/** Dispara `beforeinstallprompt` con un prompt/usuario simulados. */
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
  setNavigator();
  mockMatchMedia(false);
});

afterEach(() => {
  cleanup();
  setNavigator();
  mockMatchMedia(false);
});

describe("BotonInstalar — visibilidad del botón", () => {
  it("no renderiza nada sin vía de instalación (desktop sin beforeinstallprompt)", () => {
    const { container } = render(<BotonInstalar />);
    expect(container.querySelector("button")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("muestra el botón tras beforeinstallprompt con nombre accesible", () => {
    render(<BotonInstalar />);
    dispararBeforeInstallPrompt();

    const boton = screen.getByRole("button", { name: "Instalar DiarioIA como aplicación" });
    expect(boton.tagName).toBe("BUTTON");
    expect(boton.getAttribute("type")).toBe("button");
    expect(boton.getAttribute("title")).toBe("Instalar DiarioIA");
    expect(boton.textContent).toContain("Instalar");
  });

  it("el botón instalable NO expone aria-haspopup (solo aplica a la guía iOS)", () => {
    render(<BotonInstalar />);
    dispararBeforeInstallPrompt();

    const boton = screen.getByRole("button", { name: "Instalar DiarioIA como aplicación" });
    expect(boton.hasAttribute("aria-haspopup")).toBe(false);
    expect(boton.hasAttribute("aria-expanded")).toBe(false);
  });
});

describe("BotonInstalar — guía manual en iOS", () => {
  it("en iPhone muestra el botón de guía y NO renderiza el diálogo hasta abrirlo", () => {
    setNavigator({ userAgent: UA_IPHONE, platform: "iPhone", maxTouchPoints: 5 });
    render(<BotonInstalar />);

    const boton = screen.getByRole("button", {
      name: "Cómo instalar DiarioIA en el iPhone o iPad",
    });
    expect(boton.getAttribute("aria-haspopup")).toBe("dialog");
    expect(boton.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("al abrir la guía expone role=dialog con el contenido real y aria-expanded=true", () => {
    setNavigator({ userAgent: UA_IPHONE, platform: "iPhone", maxTouchPoints: 5 });
    render(<BotonInstalar />);

    const boton = screen.getByRole("button", {
      name: "Cómo instalar DiarioIA en el iPhone o iPad",
    });
    fireEvent.click(boton);

    expect(boton.getAttribute("aria-expanded")).toBe("true");
    const dialog = screen.getByRole("dialog", { name: "Cómo instalar DiarioIA en iOS" });
    expect(dialog.textContent).toContain("Compartir");
    expect(dialog.textContent).toContain("Añadir a pantalla de inicio");
  });

  it("el botón alterna el disclosure (abrir/cerrar) con aria-expanded", () => {
    setNavigator({ userAgent: UA_IPHONE, platform: "iPhone", maxTouchPoints: 5 });
    render(<BotonInstalar />);

    const boton = screen.getByRole("button", {
      name: "Cómo instalar DiarioIA en el iPhone o iPad",
    });
    fireEvent.click(boton);
    expect(boton.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(boton);
    expect(boton.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("detecta iPadOS 13+ (MacIntel + táctil) como iOS", () => {
    setNavigator({ userAgent: UA_MAC, platform: "MacIntel", maxTouchPoints: 5 });
    render(<BotonInstalar />);

    expect(
      screen.getByRole("button", { name: "Cómo instalar DiarioIA en el iPhone o iPad" })
    ).toBeTruthy();
  });

  it("cierra la guía con Escape y devuelve el foco al botón", () => {
    setNavigator({ userAgent: UA_IPHONE, platform: "iPhone", maxTouchPoints: 5 });
    render(<BotonInstalar />);

    const boton = screen.getByRole("button", {
      name: "Cómo instalar DiarioIA en el iPhone o iPad",
    });
    fireEvent.click(boton);
    expect(screen.getByRole("dialog")).toBeTruthy();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(boton.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(boton);
  });

  it("cierra la guía con el botón ✕ y devuelve el foco al botón", () => {
    setNavigator({ userAgent: UA_IPHONE, platform: "iPhone", maxTouchPoints: 5 });
    render(<BotonInstalar />);

    const boton = screen.getByRole("button", {
      name: "Cómo instalar DiarioIA en el iPhone o iPad",
    });
    fireEvent.click(boton);

    const cerrar = screen.getByRole("button", {
      name: "Cerrar instrucciones de instalación",
    });
    fireEvent.click(cerrar);

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(boton);
  });

  it("cierra la guía al pulsar fuera del contenedor (pointerdown externo)", () => {
    setNavigator({ userAgent: UA_IPHONE, platform: "iPhone", maxTouchPoints: 5 });
    render(<BotonInstalar />);

    fireEvent.click(
      screen.getByRole("button", { name: "Cómo instalar DiarioIA en el iPhone o iPad" })
    );
    expect(screen.getByRole("dialog")).toBeTruthy();

    fireEvent.pointerDown(document.body);

    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("BotonInstalar — estado instalado", () => {
  it("no renderiza nada si display-mode es standalone", () => {
    mockMatchMedia(true);
    const { container } = render(<BotonInstalar />);
    expect(container.querySelector("button")).toBeNull();
  });

  it("no renderiza nada si navigator.standalone es true (iOS legacy)", () => {
    setNavigator({ userAgent: UA_IPHONE, platform: "iPhone", standalone: true });
    const { container } = render(<BotonInstalar />);
    expect(container.querySelector("button")).toBeNull();
  });

  it("oculta el botón al recibir el evento appinstalled", () => {
    render(<BotonInstalar />);
    dispararBeforeInstallPrompt();
    expect(
      screen.getByRole("button", { name: "Instalar DiarioIA como aplicación" })
    ).toBeTruthy();

    act(() => {
      window.dispatchEvent(new Event("appinstalled"));
    });

    expect(screen.queryByRole("button")).toBeNull();
  });
});

describe("BotonInstalar — flujo de instalación", () => {
  it("al pulsar Instalar invoca prompt(); si acepta, deja de renderizar", async () => {
    render(<BotonInstalar />);
    const { prompt } = dispararBeforeInstallPrompt("accepted");

    fireEvent.click(screen.getByRole("button", { name: "Instalar DiarioIA como aplicación" }));

    await waitFor(() => {
      expect(screen.queryByRole("button")).toBeNull();
    });
    expect(prompt).toHaveBeenCalledTimes(1);
  });

  it("el evento es de un solo uso: si el usuario descarta, el botón también desaparece", async () => {
    render(<BotonInstalar />);
    const { prompt } = dispararBeforeInstallPrompt("dismissed");

    fireEvent.click(screen.getByRole("button", { name: "Instalar DiarioIA como aplicación" }));

    await waitFor(() => {
      expect(screen.queryByRole("button")).toBeNull();
    });
    expect(prompt).toHaveBeenCalledTimes(1);
  });
});
