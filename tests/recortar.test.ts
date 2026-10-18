import { describe, it, expect } from "vitest";
import { recortarPorPalabra } from "../scripts/lib/recortar.mjs";

describe("recortarPorPalabra", () => {
  it("devuelve intacto un texto corto", () => {
    expect(recortarPorPalabra("Hola mundo.", 300)).toBe("Hola mundo.");
  });

  it("maneja cadena vacía y nulos", () => {
    expect(recortarPorPalabra("")).toBe("");
    expect(recortarPorPalabra(undefined)).toBe("");
  });

  it("normaliza espacios múltiples y saltos de línea", () => {
    expect(recortarPorPalabra("  uno   dos\n\ttres  ", 300)).toBe("uno dos tres");
  });

  it("no parte palabras al cortar un texto largo", () => {
    const texto = "Te hablaremos de la nueva arquitectura de modelos que cambia todo el sector";
    const r = recortarPorPalabra(texto, 40);
    expect(r.endsWith("…")).toBe(true);
    expect(r.length).toBeLessThanOrEqual(41);
    const palabras = r.slice(0, -1).split(" ");
    for (const p of palabras) expect(texto.split(" ")).toContain(p);
  });

  it("retrocede a la última oración completa si está en >= 50% del límite", () => {
    const texto = "Primera oración completa aquí. Segunda oración también completa. Tercera sin terminar del todo";
    const r = recortarPorPalabra(texto, 70);
    expect(r).toBe("Primera oración completa aquí. Segunda oración también completa.");
  });

  it("ignora oraciones demasiado tempranas (< 50%) y corta por palabra", () => {
    const texto = "Hola. " + "palabra ".repeat(30);
    const r = recortarPorPalabra(texto, 60);
    expect(r.endsWith("…")).toBe(true);
    expect(r.endsWith("palabra…")).toBe(true);
  });

  it("quita signos finales sueltos antes de la elipsis", () => {
    const r = recortarPorPalabra("alfa beta gamma, delta epsilon zeta eta", 17);
    expect(r).toBe("alfa beta gamma…");
  });

  it("texto sin espacios: corta en el máximo con elipsis", () => {
    const r = recortarPorPalabra("a".repeat(50), 20);
    expect(r).toBe("a".repeat(20) + "…");
  });

  it("retira conectores, preposiciones y artículos huérfanos antes de la elipsis", () => {
    // Caso explícito: si queda "tres cosas importantes, y", debe quedar "tres cosas importantes…"
    const r1 = recortarPorPalabra("tres cosas importantes, y más detalles en camino", 25);
    expect(r1).toBe("tres cosas importantes…");

    const r2 = recortarPorPalabra("tres cosas importantes, y novedades en camino", 28);
    expect(r2).toBe("tres cosas importantes…");

    const r3 = recortarPorPalabra("noticia clave para la inteligencia artificial", 20);
    expect(r3).toBe("noticia clave…");

    const r4 = recortarPorPalabra("un avance con el nuevo algoritmo de búsqueda", 16);
    expect(r4).toBe("un avance…");
  });
});
