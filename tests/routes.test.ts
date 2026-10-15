// @vitest-environment node
import { describe, it, expect } from "vitest";
import { GET as buscarGET } from "@/app/api/buscar/route";
import {
  generateStaticParams as serwistStaticParams,
  GET as serwistGET,
} from "@/app/serwist/[path]/route";
import {
  generateMetadata as noticiaMetadata,
  generateStaticParams as noticiaStaticParams,
} from "@/app/noticia/[id]/page";
import { listarFechasDisponibles, leerArchivoPorFecha } from "@/lib/noticias";

describe("Route Handlers y Server Components", () => {
  describe("GET /api/buscar", () => {
    it("retorna un objeto JSON con noticias y herramientas", async () => {
      const response = await buscarGET();
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json).toHaveProperty("noticias");
      expect(json).toHaveProperty("herramientas");
      expect(Array.isArray(json.noticias)).toBe(true);
      expect(Array.isArray(json.herramientas)).toBe(true);
      expect(json.herramientas.length).toBeGreaterThan(0);
      expect(response.headers.get("Cache-Control")).toContain("s-maxage=");
    });
  });

  describe("Serwist /serwist/[path]", () => {
    it("genera static params para sw.js y sw.js.map", async () => {
      const params = await serwistStaticParams();
      const paths = params.map((p) => p.path);
      expect(paths).toContain("sw.js");
      expect(paths).toContain("sw.js.map");
    });

    it("sirve el service worker compilado con cabecera Service-Worker-Allowed", async () => {
      const req = new Request("https://localhost/serwist/sw.js");
      const response = await serwistGET(req, {
        params: Promise.resolve({ path: "sw.js" }),
      });
      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toContain("javascript");
      expect(response.headers.get("Service-Worker-Allowed")).toBe("/");
      const text = await response.text();
      expect(text).toContain("self");
    });
  });

  describe("/noticia/[id] Server Component", () => {
    it("generateStaticParams devuelve IDs de noticias existentes", async () => {
      const params = await noticiaStaticParams();
      expect(Array.isArray(params)).toBe(true);
      expect(params.length).toBeGreaterThan(0);
      expect(params[0]).toHaveProperty("id");
    });

    it("generateMetadata genera metadatos para noticia existente", async () => {
      const fechas = listarFechasDisponibles();
      const primerArchivo = leerArchivoPorFecha(fechas[0]);
      const primeraNoticia = primerArchivo?.noticias[0];
      expect(primeraNoticia).toBeDefined();

      if (primeraNoticia) {
        const metadata = await noticiaMetadata({
          params: Promise.resolve({ id: primeraNoticia.id }),
        });
        expect(metadata.title).toBe(primeraNoticia.titulo);
        expect(metadata.description).toBe(primeraNoticia.resumen);
      }
    });

    it("generateMetadata genera título de error cuando la noticia no existe", async () => {
      const metadata = await noticiaMetadata({
        params: Promise.resolve({ id: "id-inexistente-999" }),
      });
      expect(metadata.title).toContain("no encontrada");
    });
  });
});
