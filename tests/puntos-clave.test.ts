import { describe, it, expect } from "vitest";
import {
  esDuplicadoDelResumen,
  esPorQueImportaSignificativo,
  obtenerPuntosClaveValidos,
  titularPuntosClave,
} from "@/lib/puntos-clave";

const RESUMEN =
  "Ángel L. Fernández Recuero, editor de Jot Down y antiguo CEO de Menéame, " +
  "ha anunciado de manera oficial una nueva red social que busca recuperar " +
  "el equilibrio de Internet tras el colapso del sector de los medios.";

describe("lib/puntos-clave · deduplicación frente al resumen", () => {
  it("descarta el punto idéntico al resumen (fallback del pipeline)", () => {
    expect(obtenerPuntosClaveValidos([RESUMEN], RESUMEN)).toEqual([]);
  });

  it("descarta variaciones triviales del resumen (tildes/puntuación)", () => {
    const variante = RESUMEN.replace(/[.,]/g, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    expect(obtenerPuntosClaveValidos([variante], RESUMEN)).toEqual([]);
  });

  it("conserva 3 puntos clave realmente distintos", () => {
    const puntos = [
      "La red social nace para frenar el dominio de los agregadores de noticias.",
      "El proyecto priorizará el tráfico directo hacia los medios originales.",
      "Su modelo económico aún no ha sido detallado públicamente.",
    ];
    expect(obtenerPuntosClaveValidos(puntos, RESUMEN)).toHaveLength(3);
  });

  it("elimina duplicados entre los propios puntos", () => {
    const punto = "El proyecto priorizará el tráfico directo hacia los medios.";
    expect(obtenerPuntosClaveValidos([punto, `  ${punto}  `], RESUMEN)).toHaveLength(1);
  });

  it("filtra cadenas vacías y entradas nulas/indefinidas", () => {
    expect(obtenerPuntosClaveValidos([], RESUMEN)).toEqual([]);
    expect(obtenerPuntosClaveValidos(undefined, RESUMEN)).toEqual([]);
    expect(
      obtenerPuntosClaveValidos(["", "   "], RESUMEN),
    ).toEqual([]);
  });

  it("no descarta un punto corto legítimo contenido en el resumen", () => {
    const corto = "Nueva red social.";
    expect(esDuplicadoDelResumen(corto, RESUMEN)).toBe(false);
  });
});

describe("lib/puntos-clave · encabezado dinámico honesto", () => {
  it("usa singular con un solo punto", () => {
    expect(titularPuntosClave(1)).toBe("Punto clave");
  });
  it("declara el número real de puntos", () => {
    expect(titularPuntosClave(2)).toBe("En 2 puntos clave");
    expect(titularPuntosClave(3)).toBe("En 3 puntos clave");
    expect(titularPuntosClave(5)).toBe("En 5 puntos clave");
  });
  it("degrada a singular si no hay puntos (nunca 'En 0 puntos')", () => {
    expect(titularPuntosClave(0)).toBe("Punto clave");
  });
});

describe("lib/puntos-clave · '¿Por qué importa?' significativo", () => {
  it("rechaza el rótulo de relleno de plantilla", () => {
    expect(
      esPorQueImportaSignificativo(
        "Novedad relevante en el sector de la inteligencia artificial reportada por ADSLZone.",
      ),
    ).toBe(false);
  });
  it("acepta criterio real y rechaza vacíos", () => {
    expect(
      esPorQueImportaSignificativo(
        "Marca un precedente sobre cómo los medios recuperan tráfico directo.",
      ),
    ).toBe(true);
    expect(esPorQueImportaSignificativo(undefined)).toBe(false);
    expect(esPorQueImportaSignificativo("   ")).toBe(false);
  });
});
