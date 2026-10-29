import { execFileSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import {
  enriquecerNoticias,
  ErrorCuotaAgotada,
  UMBRAL_429_CONSECUTIVOS,
  debeOmitirEdicionDeHoy,
  MAX_NOTICIAS_DIARIAS,
  aplicarTopeEditorial,
} from "../scripts/fetch-news.mjs";

// ─────────────────────────────────────────────────────────────
// Utilidades de mock: NUNCA se llama a la API real.
// ─────────────────────────────────────────────────────────────
function respuesta429() {
  return {
    ok: false,
    status: 429,
    headers: { get: () => null },
    text: async () => "",
    json: async () => ({}),
  };
}

function respuestaOk() {
  return {
    ok: true,
    status: 200,
    headers: { get: () => null },
    text: async () => "",
    json: async () => ({
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  puntosClave: ["Uno", "Dos", "Tres"],
                  porQueImporta:
                    "Impacto real y específico en el mercado de los agentes autónomos.",
                  tags: ["OpenAI", "LLMs"],
                }),
              },
            ],
          },
        },
      ],
    }),
  };
}

// Mock que decide por el contenido del prompt (el título va embebido).
// Las noticias cuyo título contiene el marcador de éxito devuelven 200; el resto 429.
function montarFetch({ marcadorExito = "__EXITO__" } = {}) {
  return vi.fn(async (_url, init) => {
    const body = JSON.parse(init.body);
    const texto = body.contents[0].parts[0].text;
    return texto.includes(marcadorExito) ? respuestaOk() : respuesta429();
  });
}

function noticia(i, marcador = "") {
  return {
    id: `n-${i}`,
    titulo: `${marcador} Noticia de IA número ${i}`,
    resumen: "Resumen de prueba sobre inteligencia artificial y OpenAI.",
    url: `https://example.com/${i}`,
    imagen: null,
    fuente: "Xataka",
    categoria: "tecnologia",
    fechaPublicacion: "2026-10-15T00:00:00.000Z",
    fechaAgregada: "2026-10-15T01:00:00.000Z",
  };
}

// Opciones rápidas: sin pacing ni backoff real (0ms) para no ralentizar los tests.
const opcionesRapidas = {
  pausaMs: 0,
  calcularEsperaBackoff: () => 0,
};

describe("fetch-news · guardián de cuota (429 persistente)", () => {
  const keyOriginal = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    process.env.GEMINI_API_KEY = "clave-de-prueba";
  });

  afterEach(() => {
    if (keyOriginal === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = keyOriginal;
    vi.unstubAllGlobals();
  });

  it("aborta con ErrorCuotaAgotada tras N fallos 429 consecutivos", async () => {
    vi.stubGlobal("fetch", montarFetch());
    const noticias = [
      noticia(1),
      noticia(2),
      noticia(3),
      noticia(4),
      noticia(5),
    ];

    await expect(
      enriquecerNoticias(noticias, opcionesRapidas),
    ).rejects.toThrow(ErrorCuotaAgotada);

    // El mensaje de aborto es el contrato visible en el log del workflow.
    await expect(
      enriquecerNoticias(
        [noticia(11), noticia(12), noticia(13)],
        opcionesRapidas,
      ),
    ).rejects.toThrow(/Cuota de Gemini agotada/);

    expect(UMBRAL_429_CONSECUTIVOS).toBeGreaterThanOrEqual(2);
  });

  it("un 429 aislado (por debajo del umbral) NO aborta", async () => {
    vi.stubGlobal("fetch", montarFetch());
    const r = await enriquecerNoticias([noticia(1)], opcionesRapidas);
    expect(r).toHaveLength(1);
    // Sin éxito real → cae al fallback local, pero el proceso termina sin throw.
    expect(r[0].enriquecidoConIA).toBe(false);
  });

  it("un éxito intermedio RESETEA el contador de consecutivas", async () => {
    vi.stubGlobal("fetch", montarFetch());
    // fallo, fallo, éxito(reset), fallo, fallo → nunca llega a 3 consecutivos.
    const noticias = [
      noticia(1),
      noticia(2),
      noticia(3, "__EXITO__"),
      noticia(4),
      noticia(5),
    ];

    const r = await enriquecerNoticias(noticias, opcionesRapidas);

    expect(r).toHaveLength(5);
    expect(r[2].enriquecidoConIA).toBe(true);
    expect(r[2].porQueImporta).toContain("agentes autónomos");
    expect(r[0].enriquecidoConIA).toBe(false);
    expect(r[4].enriquecidoConIA).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────
// Idempotencia del flujo diario.
// ─────────────────────────────────────────────────────────────
describe("fetch-news · idempotencia de la edición de hoy", () => {
  let dir;
  const hoy = new Date().toISOString().split("T")[0];

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "diarioia-idem-"));
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  function escribirEdicion(enriquecidasConIA) {
    fs.writeFileSync(
      path.join(dir, `${hoy}.json`),
      JSON.stringify({ fecha: hoy, enriquecidasConIA, noticias: [] }, null, 2),
      "utf-8",
    );
  }

  it("NO omite si no existe la edición de hoy", () => {
    expect(debeOmitirEdicionDeHoy(hoy, { carpeta: dir })).toBe(false);
  });

  it("omite cuando existe y enriquecidasConIA > 0", () => {
    escribirEdicion(5);
    expect(debeOmitirEdicionDeHoy(hoy, { carpeta: dir })).toBe(true);
  });

  it("NO omite cuando existe pero enriquecidasConIA es 0", () => {
    escribirEdicion(0);
    expect(debeOmitirEdicionDeHoy(hoy, { carpeta: dir })).toBe(false);
  });

  it("--force anula la omisión aunque exista y esté enriquecida", () => {
    escribirEdicion(7);
    expect(debeOmitirEdicionDeHoy(hoy, { carpeta: dir, force: true })).toBe(
      false,
    );
  });

  it("un JSON ilegible no provoca omisión (no rompe el flujo)", () => {
    fs.writeFileSync(path.join(dir, `${hoy}.json`), "{ roto", "utf-8");
    expect(debeOmitirEdicionDeHoy(hoy, { carpeta: dir })).toBe(false);
  });
});

describe("fetch-news · CLI idempotente (sin red, sin API)", () => {
  const raiz = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
  );
  const script = path.join(raiz, "scripts", "fetch-news.mjs");
  let dir;
  const hoy = new Date().toISOString().split("T")[0];

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "diarioia-cli-"));
    fs.mkdirSync(path.join(dir, "data", "noticias"), { recursive: true });
    fs.writeFileSync(
      path.join(dir, "data", "noticias", `${hoy}.json`),
      JSON.stringify(
        { fecha: hoy, enriquecidasConIA: 4, noticias: [] },
        null,
        2,
      ),
      "utf-8",
    );
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("omite y sale con código 0 sin llamar a la API cuando la edición de hoy ya está enriquecida", () => {
    const salida = execFileSync(
      process.execPath,
      [script, "--fetch-only"],
      {
        cwd: dir,
        encoding: "utf-8",
        env: { ...process.env, GEMINI_API_KEY: "" },
      },
    );
    expect(salida).toMatch(/omit(iendo|iendo)/i);
    expect(salida).toMatch(/idempotente/i);
  });
});

describe("fetch-news · tope editorial inteligente", () => {
  it("define MAX_NOTICIAS_DIARIAS en 14 para blindar tiempo y rate limit", () => {
    expect(MAX_NOTICIAS_DIARIAS).toBe(14);
  });

  it("mantiene intacta la lista si hay menos o igual de 14 noticias", () => {
    const noticias = Array.from({ length: 8 }, (_, i) => ({
      id: `id-${i}`,
      titulo: `Noticia ${i}`,
      fechaPublicacion: `2026-10-28T10:0${i}:00Z`,
    }));
    const resultado = aplicarTopeEditorial(noticias);
    expect(resultado).toHaveLength(8);
    expect(resultado[0].titulo).toBe("Noticia 0");
  });

  it("aplica el tope de 14 cuando se detectan más noticias, preservando el orden de frescura", () => {
    const noticias = Array.from({ length: 22 }, (_, i) => ({
      id: `id-${i}`,
      titulo: `Noticia ${i}`,
      fechaPublicacion: `2026-10-28T10:${i.toString().padStart(2, "0")}:00Z`,
    }));
    const resultado = aplicarTopeEditorial(noticias);
    expect(resultado).toHaveLength(14);
    expect(resultado[0].titulo).toBe("Noticia 0");
    expect(resultado[13].titulo).toBe("Noticia 13");
  });

  it("emite logs informativos con el prefijo [Editorial]", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    const muchas = Array.from({ length: 16 }, (_, i) => ({ id: `${i}` }));
    aplicarTopeEditorial(muchas);
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("[Editorial] Detectadas 16 noticias. Aplicando tope editorial"),
    );

    const pocas = Array.from({ length: 5 }, (_, i) => ({ id: `${i}` }));
    aplicarTopeEditorial(pocas);
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("[Editorial] Seleccionadas las 5 noticias más relevantes"),
    );
    spy.mockRestore();
  });

  it("maneja entradas no válidas devolviendo array vacío", () => {
    expect(aplicarTopeEditorial(null)).toEqual([]);
    expect(aplicarTopeEditorial(undefined)).toEqual([]);
    expect(aplicarTopeEditorial("invalido")).toEqual([]);
  });
});
