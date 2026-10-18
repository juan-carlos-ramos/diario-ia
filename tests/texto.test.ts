import { describe, it, expect } from "vitest";

import { recortarResumenLimpio } from "@/lib/texto";

describe("recortarResumenLimpio", () => {
  it("recorta a la última palabra completa si está cortado a mitad de palabra", () => {
    expect(recortarResumenLimpio("Hoy Google presentó novedades. Te hablaremos de l")).toBe(
      "Hoy Google presentó novedades."
    );
    expect(recortarResumenLimpio("Te hablaremos de la nueva func")).toBe("Te hablaremos de la nueva…");
  });

  it("devuelve intacto un texto que termina en punto", () => {
    expect(recortarResumenLimpio("Una noticia completa.")).toBe("Una noticia completa.");
    expect(recortarResumenLimpio("¿Qué pasó?")).toBe("¿Qué pasó?");
    expect(recortarResumenLimpio("Dijo «listo»")).toBe("Dijo «listo»");
  });

  it("con varias oraciones cortadas en la última, conserva solo las completas", () => {
    expect(recortarResumenLimpio("Primera frase. Segunda frase! Tercera que se cor")).toBe(
      "Primera frase. Segunda frase!"
    );
  });

  it("devuelve cadena vacía para vacío o solo espacios", () => {
    expect(recortarResumenLimpio("")).toBe("");
    expect(recortarResumenLimpio("   ")).toBe("");
  });

  it("sin puntuación: última palabra completa, sin signos sueltos y con elipsis", () => {
    expect(recortarResumenLimpio("modelo nuevo de lenguaje para desarr")).toBe(
      "modelo nuevo de lenguaje…"
    );
    expect(recortarResumenLimpio("tres cosas importantes, lu")).toBe("tres cosas importantes…");
    expect(recortarResumenLimpio("Atención: qu")).toBe("Atención…");
  });

  it("retira conectores, preposiciones y artículos huérfanos antes de la elipsis", () => {
    expect(recortarResumenLimpio("tres cosas importantes, y")).toBe("tres cosas importantes…");
    expect(recortarResumenLimpio("tres cosas importantes, y más")).toBe("tres cosas importantes…");
    expect(recortarResumenLimpio("tres cosas importantes, y de")).toBe("tres cosas importantes…");
    expect(recortarResumenLimpio("tres cosas importantes, y dem")).toBe("tres cosas importantes…");
    expect(recortarResumenLimpio("anuncio clave para la com")).toBe("anuncio clave…");
    expect(recortarResumenLimpio("detalles sobre un nuevo mod")).toBe("detalles sobre un nuevo…");
  });
});
