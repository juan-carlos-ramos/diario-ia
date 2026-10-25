// @vitest-environment node
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { GET as serwistGET } from "@/app/serwist/[path]/route";

/**
 * Cobertura de actualización silenciosa del Service Worker (PWA):
 *  · app/sw.ts configura skipWaiting: true y clientsClaim: true para activación
 *    inmediata en segundo plano sin interrumpir al lector con alertas.
 *  · app/layout.tsx no incluye componentes intrusivos de aviso de actualización.
 *  · El Route Handler /serwist/sw.js compila el Service Worker con la directiva
 *    skipWaiting activa.
 */
describe("Service Worker — Actualización silenciosa en segundo plano", () => {
  it("app/sw.ts declara skipWaiting: true y clientsClaim: true", () => {
    const swPath = path.resolve(process.cwd(), "app/sw.ts");
    const content = fs.readFileSync(swPath, "utf-8");

    expect(content).toMatch(/skipWaiting:\s*true/);
    expect(content).toMatch(/clientsClaim:\s*true/);
    expect(content).not.toMatch(/skipWaiting:\s*false/);
  });

  it("app/layout.tsx no monta componentes de aviso intrusivo de actualización", () => {
    const layoutPath = path.resolve(process.cwd(), "app/layout.tsx");
    const content = fs.readFileSync(layoutPath, "utf-8");

    expect(content).not.toContain("AvisoActualizacion");
    expect(content).not.toContain("<AvisoActualizacion");
  });

  it("el Route Handler /serwist/sw.js compila el SW con skipWaiting activo", async () => {
    const req = new Request("https://localhost/serwist/sw.js");
    const response = await serwistGET(req, {
      params: Promise.resolve({ path: "sw.js" }),
    });

    expect(response.status).toBe(200);
    const code = await response.text();
    // Serwist emite la invocación o listener de skipWaiting cuando skipWaiting: true
    expect(code).toMatch(/skipWaiting/);
  });
});
