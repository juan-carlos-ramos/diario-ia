import { describe, it, expect } from "vitest";
import { leerArchivoPorFecha, listarFechasDisponibles } from "@/lib/noticias";

describe("lib/noticias", () => {
  it("retorna null si no existe el archivo de esa fecha", () => {
    const resultado = leerArchivoPorFecha("1900-01-01");
    expect(resultado).toBeNull();
  });

  it("listarFechasDisponibles retorna un array", () => {
    const fechas = listarFechasDisponibles();
    expect(Array.isArray(fechas)).toBe(true);
  });
});
