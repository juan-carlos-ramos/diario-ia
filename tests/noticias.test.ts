import { describe, it, expect } from "vitest";
import {
  leerArchivoPorFecha,
  listarFechasDisponibles,
  calcularTiempoLectura,
  generarSlug,
} from "@/lib/noticias";

describe("lib/noticias", () => {
  it("retorna null si no existe el archivo de esa fecha", () => {
    const resultado = leerArchivoPorFecha("1900-01-01");
    expect(resultado).toBeNull();
  });

  it("listarFechasDisponibles retorna un array", () => {
    const fechas = listarFechasDisponibles();
    expect(Array.isArray(fechas)).toBe(true);
  });

  it("calcula correctamente el tiempo de lectura en minutos", () => {
    expect(calcularTiempoLectura("")).toBe(1);
    expect(calcularTiempoLectura("Esto es una prueba corta")).toBe(1);
    const textoLargo = "palabra ".repeat(450);
    expect(calcularTiempoLectura(textoLargo)).toBe(3);
  });

  it("genera un slug limpio y amigable", () => {
    const slug = generarSlug("¡OpenAI lanza GPT-5 con nuevas capacidades en 2026!");
    expect(slug).toBe("openai-lanza-gpt-5-con-nuevas-capacidades-en-2026");
  });
});

