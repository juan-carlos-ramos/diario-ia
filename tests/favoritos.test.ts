import { describe, it, expect, beforeEach } from "vitest";
import {
  obtenerFavoritos,
  guardarFavorito,
  eliminarFavorito,
  esFavorito,
  alternarFavorito,
} from "@/lib/favoritos";
import type { Noticia } from "@/lib/noticias";

const mockNoticia: Noticia = {
  id: "test-123",
  titulo: "OpenAI lanza GPT-5 con nuevas capacidades",
  resumen: "Resumen de prueba sobre el lanzamiento de inteligencia artificial.",
  url: "https://example.com/noticia",
  imagen: "https://example.com/imagen.jpg",
  fuente: "Xataka",
  categoria: "tecnologia",
  fechaPublicacion: "2026-08-21T12:00:00Z",
  fechaAgregada: "2026-08-21T12:00:00Z",
};

describe("Gestión de Favoritos en localStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("debe retornar una lista vacía inicialmente", () => {
    const favs = obtenerFavoritos();
    expect(favs).toEqual([]);
  });

  it("debe guardar una noticia en favoritos", () => {
    guardarFavorito(mockNoticia);
    const favs = obtenerFavoritos();
    expect(favs.length).toBe(1);
    expect(favs[0].id).toBe("test-123");
    expect(esFavorito("test-123")).toBe(true);
  });

  it("no debe duplicar noticias ya guardadas", () => {
    guardarFavorito(mockNoticia);
    guardarFavorito(mockNoticia);
    const favs = obtenerFavoritos();
    expect(favs.length).toBe(1);
  });

  it("debe eliminar una noticia de favoritos", () => {
    guardarFavorito(mockNoticia);
    expect(esFavorito("test-123")).toBe(true);
    eliminarFavorito("test-123");
    expect(esFavorito("test-123")).toBe(false);
    expect(obtenerFavoritos().length).toBe(0);
  });

  it("debe alternar el estado de favorito correctamente", () => {
    const agregado = alternarFavorito(mockNoticia);
    expect(agregado).toBe(true);
    expect(esFavorito("test-123")).toBe(true);

    const quitado = alternarFavorito(mockNoticia);
    expect(quitado).toBe(false);
    expect(esFavorito("test-123")).toBe(false);
  });
});
