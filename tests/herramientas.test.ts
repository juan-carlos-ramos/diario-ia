import { describe, it, expect } from "vitest";
import {
  obtenerTodasHerramientas,
  obtenerHerramientasPorCategoria,
  obtenerHerramientaDelDia,
} from "@/lib/herramientas";

describe("lib/herramientas", () => {
  it("obtiene la lista completa de herramientas de IA", () => {
    const herramientas = obtenerTodasHerramientas();
    expect(Array.isArray(herramientas)).toBe(true);
    expect(herramientas.length).toBeGreaterThan(5);
  });

  it("filtra correctamente por categoría", () => {
    const vibeCoding = obtenerHerramientasPorCategoria("vibe-coding");
    expect(vibeCoding.length).toBeGreaterThan(0);
    expect(vibeCoding.every((h) => h.categoria === "vibe-coding")).toBe(true);

    const todas = obtenerHerramientasPorCategoria("todos");
    expect(todas.length).toBe(obtenerTodasHerramientas().length);
  });

  it("selecciona determinísticamente la herramienta del día para una fecha", () => {
    const herramienta1 = obtenerHerramientaDelDia("2026-08-21");
    const herramienta2 = obtenerHerramientaDelDia("2026-08-21");
    expect(herramienta1.id).toBe(herramienta2.id);

    const herramientaOtroDia = obtenerHerramientaDelDia("2026-08-22");
    expect(herramienta1).toBeDefined();
    expect(herramientaOtroDia).toBeDefined();
  });
});
