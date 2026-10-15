import { describe, it, expect } from "vitest";
import {
  derivarPuntosClaveLocales,
  enriquecerFallback,
  calcularEsperaBackoff,
  MODELOS_GEMINI,
  MAX_INTENTOS_MODELO,
} from "../scripts/fetch-news.mjs";

const noticiaMuestra = {
  id: "test-1",
  titulo: "OpenAI presenta un nuevo modelo de razonamiento para agentes autónomos",
  resumen:
    "OpenAI ha presentado un nuevo modelo de razonamiento orientado a agentes autónomos. " +
    "El sistema mejora la planificación de tareas largas y reduce los errores. " +
    "La compañía lo desplegará primero en su API para desarrolladores.",
  url: "https://example.com/noticia",
  imagen: null,
  fuente: "Xataka",
  categoria: "tecnologia",
  fechaPublicacion: "2026-10-15T05:00:00.000Z",
  fechaAgregada: "2026-10-15T05:23:00.000Z",
};

describe("fetch-news · fallback local (sin API)", () => {
  it("NO duplica el resumen completo en puntosClave", () => {
    const r = enriquecerFallback(noticiaMuestra);
    expect(Array.isArray(r.puntosClave)).toBe(true);
    expect(r.puntosClave.length).toBeGreaterThanOrEqual(1);
    // Contrato con el diseñador: ningún punto puede ser el resumen completo
    for (const punto of r.puntosClave) {
      expect(punto).not.toBe(noticiaMuestra.resumen);
    }
    expect(r.puntosClave).not.toEqual([noticiaMuestra.resumen]);
  });

  it("deriva hasta 3 viñetas cortas (<= ~140 chars)", () => {
    const puntos = derivarPuntosClaveLocales(noticiaMuestra.resumen);
    expect(puntos.length).toBeGreaterThanOrEqual(1);
    expect(puntos.length).toBeLessThanOrEqual(3);
    for (const p of puntos) {
      expect(p.length).toBeLessThanOrEqual(141);
    }
  });

  it("marca enriquecidoConIA=false y aporta porQueImporta honesto con la fuente", () => {
    const r = enriquecerFallback(noticiaMuestra);
    expect(r.enriquecidoConIA).toBe(false);
    expect(typeof r.porQueImporta).toBe("string");
    expect(r.porQueImporta.length).toBeGreaterThan(20);
    expect(r.porQueImporta).toContain(noticiaMuestra.fuente);
  });

  it("caso límite: resumen de una sola oración corta no se copia literal", () => {
    const corta = { ...noticiaMuestra, resumen: "Google lanza Gemini 4 con mejoras." };
    const r = enriquecerFallback(corta);
    expect(r.puntosClave).not.toEqual([corta.resumen]);
  });

  it("resumen vacío no produce puntos vacíos", () => {
    const vacia = { ...noticiaMuestra, resumen: "" };
    const r = enriquecerFallback(vacia);
    expect(r.puntosClave.length).toBeGreaterThanOrEqual(1);
    expect(r.puntosClave[0].length).toBeGreaterThan(0);
  });

  it("configuración de modelos y backoff correcta", () => {
    expect(MODELOS_GEMINI).toEqual(["gemini-3.8-flash", "gemini-3.6-flash"]);
    expect(MODELOS_GEMINI).not.toContain("gemini-3.5-flash");
    expect(MAX_INTENTOS_MODELO).toBeGreaterThanOrEqual(3);
    // Backoff exponencial: 2s, 4s, 8s...
    expect(calcularEsperaBackoff(null, 1)).toBe(2000);
    expect(calcularEsperaBackoff(null, 2)).toBe(4000);
    // Respeta Retry-After si existe
    const resConRetry = { headers: { get: () => "10" } };
    expect(calcularEsperaBackoff(resConRetry, 1)).toBe(10000);
  });
});
