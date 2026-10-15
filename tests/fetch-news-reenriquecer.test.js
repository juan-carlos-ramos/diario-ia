import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { describe, it, expect } from "vitest";

import {
  esEnriquecimientoGenerico,
  fusionarEnriquecimiento,
  RE_FECHA_VALIDA,
} from "../scripts/fetch-news.mjs";

const noticiaFallback = {
  id: "x1",
  titulo: "OpenAI lanza algo",
  resumen: "Un resumen cualquiera.",
  url: "https://example.com",
  imagen: null,
  fuente: "Xataka",
  categoria: "tecnologia",
  fechaPublicacion: "2026-10-14T00:00:00.000Z",
  fechaAgregada: "2026-10-14T01:00:00.000Z",
  puntosClave: ["viejo"],
  porQueImporta:
    "Novedad relevante en el sector de la inteligencia artificial reportada por Xataka.",
  tags: ["Viejo"],
  tiempoLecturaMin: 1,
};

describe("fetch-news · detección de enriquecimiento genérico", () => {
  it("detecta el default genérico del camino IA", () => {
    expect(esEnriquecimientoGenerico(noticiaFallback)).toBe(true);
  });

  it("detecta el flag explícito enriquecidoConIA=false", () => {
    expect(
      esEnriquecimientoGenerico({ porQueImporta: "algo", enriquecidoConIA: false }),
    ).toBe(true);
  });

  it("detecta el texto del fallback local", () => {
    expect(
      esEnriquecimientoGenerico({
        porQueImporta:
          "«Título» según Xataka: análisis en profundidad pendiente de síntesis editorial.",
      }),
    ).toBe(true);
  });

  it("NO marca como genérico un enriquecimiento editorial real", () => {
    expect(
      esEnriquecimientoGenerico({
        porQueImporta: "Este avance reordena el mercado de los agentes autónomos.",
        enriquecidoConIA: true,
      }),
    ).toBe(false);
  });

  it("no marca objetos inválidos", () => {
    expect(esEnriquecimientoGenerico(null)).toBe(false);
    expect(esEnriquecimientoGenerico("texto")).toBe(false);
  });
});

describe("fetch-news · fusión preserva campos no derivados", () => {
  it("reemplaza solo los 5 campos derivados", () => {
    const original = { ...noticiaFallback, extra: "intacto" };
    const enriquecida = {
      ...original,
      puntosClave: ["n1", "n2", "n3"],
      porQueImporta: "Impacto real y específico.",
      tags: ["OpenAI", "LLMs"],
      tiempoLecturaMin: 2,
      enriquecidoConIA: true,
    };
    const r = fusionarEnriquecimiento(original, enriquecida);
    expect(r.puntosClave).toEqual(["n1", "n2", "n3"]);
    expect(r.porQueImporta).toBe("Impacto real y específico.");
    expect(r.tags).toEqual(["OpenAI", "LLMs"]);
    expect(r.tiempoLecturaMin).toBe(2);
    expect(r.enriquecidoConIA).toBe(true);
    // Campos no derivados intactos
    expect(r.id).toBe(original.id);
    expect(r.titulo).toBe(original.titulo);
    expect(r.fuente).toBe(original.fuente);
    expect(r.extra).toBe("intacto");
  });
});

describe("fetch-news · regex de fecha anti path-traversal", () => {
  it("acepta YYYY-MM-DD y rechaza rutas", () => {
    expect(RE_FECHA_VALIDA.test("2026-10-14")).toBe(true);
    expect(RE_FECHA_VALIDA.test("../../etc/passwd")).toBe(false);
    expect(RE_FECHA_VALIDA.test("2026-10-14.json")).toBe(false);
    expect(RE_FECHA_VALIDA.test("2026-1-4")).toBe(false);
  });
});

describe("fetch-news · CLI --dry-run (sin API, sin escritura)", () => {
  const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const archivo = path.join(raiz, "data", "noticias", "2026-10-14.json");
  const existe = fs.existsSync(archivo);

  it("reporta el plan de 2026-10-14 y no modifica el archivo", () => {
    if (!existe) return; // sin fixture en este entorno
    const antes = fs.readFileSync(archivo, "utf-8");
    const salida = execFileSync(
      process.execPath,
      ["scripts/fetch-news.mjs", "--reenriquecer", "2026-10-14", "--dry-run"],
      { cwd: raiz, encoding: "utf-8", env: { ...process.env, GEMINI_API_KEY: "" } },
    );
    const despues = fs.readFileSync(archivo, "utf-8");
    expect(salida).toContain("[DRY-RUN]");
    expect(salida).toContain("2026-10-14");
    expect(salida).toContain("17");
    // El archivo no debe cambiar en dry-run
    expect(despues).toBe(antes);
  });
});
