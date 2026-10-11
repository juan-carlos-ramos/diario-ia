/**
 * Sincronización del tema manual ("DiarioIA") con el DOM y con el color de la
 * barra del sistema (`<meta name="theme-color">`).
 *
 * El tema es 100% MANUAL (clave localStorage "diarioia_tema"); `prefers-color-scheme`
 * NO se lee para decidir el tema. Por eso el `<meta name="theme-color">` generado
 * por Next (con `media` queries) se homogeneiza: se elimina el atributo `media` y se
 * fija el color real del tema activo, de lo contrario el sistema podría pintar la
 * barra con el color del tema del SO y no con el que el usuario eligió.
 *
 * IMPORTANTE: el script inline `theme-bootstrap` de app/layout.tsx replica esta
 * misma lógica (no puede importar módulos TS). Si cambian los colores aquí,
 * actualízalos también allí.
 */

/** Colores HEX equivalentes a los tokens OKLCH del design system. */
export const COLORES_TEMA = {
  light: "#F7F4EF", // oklch(96.8% 0.007 75) — Papel prensa marfil
  dark: "#0C0705", // oklch(13.5% 0.012 55) — Carbón obsidiana cálido
} as const;

export type TemaNombre = keyof typeof COLORES_TEMA;

/** Devuelve el tema persistido, o "light" si no hay preferencia guardada. */
export function leerTema(): TemaNombre {
  if (typeof window === "undefined") return "light";
  try {
    return window.localStorage.getItem("diarioia_tema") === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

/**
 * Aplica el tema al DOM: clase `.dark`, atributo `data-theme`, persistencia en
 * localStorage y sincronización del `<meta name="theme-color">`.
 */
export function aplicarTemaAlDOM(tema: TemaNombre): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.classList.toggle("dark", tema === "dark");
  root.setAttribute("data-theme", tema);

  try {
    window.localStorage.setItem("diarioia_tema", tema);
  } catch {
    /* almacenamiento no disponible (modo privado): el tema sigue aplicado en memoria */
  }

  const color = COLORES_TEMA[tema];
  const metas = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]');

  if (metas.length === 0) {
    const meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    meta.setAttribute("content", color);
    document.head.appendChild(meta);
    return;
  }

  metas.forEach((meta) => {
    meta.removeAttribute("media");
    meta.setAttribute("content", color);
  });
}
