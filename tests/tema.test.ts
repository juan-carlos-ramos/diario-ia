import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, it, expect, beforeEach } from "vitest";

import { COLORES_TEMA, aplicarTemaAlDOM, leerTema } from "@/lib/tema";

function crearMetasThemeColor() {
  document.head.innerHTML = "";
  for (const media of ["(prefers-color-scheme: light)", "(prefers-color-scheme: dark)"]) {
    const meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    meta.setAttribute("content", "#F7F4EF");
    meta.setAttribute("media", media);
    document.head.appendChild(meta);
  }
}

function leerMetas() {
  return Array.from(document.querySelectorAll('meta[name="theme-color"]')).map((m) => ({
    content: m.getAttribute("content"),
    media: m.getAttribute("media"),
  }));
}

describe("lib/tema — tema manual y sincronización de theme-color", () => {
  beforeEach(() => {
    localStorage.clear();
    document.head.innerHTML = "";
    document.documentElement.className = "";
    document.documentElement.removeAttribute("data-theme");
  });

  it("leerTema() devuelve 'light' por defecto", () => {
    expect(leerTema()).toBe("light");
  });

  it("aplicarTemaAlDOM('dark') fija clase, data-theme y persiste", () => {
    aplicarTemaAlDOM("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("diarioia_tema")).toBe("dark");
    expect(leerTema()).toBe("dark");
  });

  it("aplicarTemaAlDOM sincroniza theme-color y elimina el media query", () => {
    crearMetasThemeColor();

    aplicarTemaAlDOM("dark");
    expect(leerMetas()).toEqual([
      { content: COLORES_TEMA.dark, media: null },
      { content: COLORES_TEMA.dark, media: null },
    ]);

    aplicarTemaAlDOM("light");
    expect(leerMetas()).toEqual([
      { content: COLORES_TEMA.light, media: null },
      { content: COLORES_TEMA.light, media: null },
    ]);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("crea un meta theme-color si no existe ninguno", () => {
    expect(document.querySelectorAll('meta[name="theme-color"]').length).toBe(0);
    aplicarTemaAlDOM("dark");
    const metas = leerMetas();
    expect(metas.length).toBe(1);
    expect(metas[0].content).toBe(COLORES_TEMA.dark);
  });

  it("los colores coinciden con la identidad marfil del manifiesto", () => {
    expect(COLORES_TEMA.light).toBe("#F7F4EF"); // oklch(96.8% 0.007 75)
    expect(COLORES_TEMA.dark).toBe("#0C0705"); // oklch(13.5% 0.012 55)
  });
});

describe("app/layout.tsx — script inline theme-bootstrap (anti-regresión)", () => {
  const layout = readFileSync(
    path.resolve(process.cwd(), "app", "layout.tsx"),
    "utf8"
  );
  const script = layout.match(/__html:\s*`([^`]*)`/)?.[1] ?? "";

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    document.documentElement.removeAttribute("data-theme");
  });

  it("extrae el script inline del layout", () => {
    expect(script).toContain("diarioia_tema");
    expect(script).toContain("theme-color");
  });

  it("con tema oscuro guardado: aplica .dark y theme-color #0C0705", () => {
    crearMetasThemeColor();
    localStorage.setItem("diarioia_tema", "dark");
    window.eval(script);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(leerMetas().every((m) => m.content === "#0C0705" && m.media === null)).toBe(true);
  });

  it("sin preferencia guardada: aplica theme-color claro #F7F4EF", () => {
    crearMetasThemeColor();
    window.eval(script);

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(leerMetas().every((m) => m.content === "#F7F4EF" && m.media === null)).toBe(true);
  });
});
