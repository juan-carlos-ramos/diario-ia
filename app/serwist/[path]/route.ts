import { spawnSync } from "node:child_process";
import crypto from "node:crypto";

import { createSerwistRoute } from "@serwist/turbopack";

/**
 * Route Handler que sirve los archivos generados del service worker
 * (`/serwist/sw.js` y su source map) en la integración oficial de Serwist
 * para Turbopack. Sigue el patrón documentado en
 * https://serwist.pages.dev/docs/next/turbo
 */

/**
 * Revisión del precache del fallback offline: se sella con el commit actual
 * para invalidar la copia cacheada de `/~offline` cuando el contenido cambia.
 * Si `git` no está disponible (p. ej. build sin repositorio), se usa un UUID
 * para no romper el build.
 */
const revision: string =
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout?.trim() ||
  crypto.randomUUID();

const serwistRoute = createSerwistRoute({
  swSrc: "app/sw.ts",
  useNativeEsbuild: true,
  // El fallback offline es contenido estático: se precachea con revisión.
  additionalPrecacheEntries: [{ url: "/~offline", revision }],
  /**
   * `public/logo.png` pesa 2.07 MiB. No se descarga nunca por su URL cruda
   * (el Header lo pinta con `next/image`, que sirve `/_next/image?url=...` y
   * ya está cubierto por la regla de imágenes en tiempo de ejecución), así que
   * precachearlo solo engordaría la instalación del SW sin aportar nada.
   */
  globIgnores: ["**/logo.png"],
});

export const { dynamic, dynamicParams, revalidate, generateStaticParams } = serwistRoute;

export async function GET(request: Request, context: { params: Promise<{ path: string }> }) {
  const respuesta = await serwistRoute.GET(request, context);
  const { path } = await context.params;

  const cabeceras = new Headers(respuesta.headers);
  cabeceras.set(
    "Content-Type",
    path.endsWith(".map") ? "application/json; charset=utf-8" : "application/javascript; charset=utf-8"
  );
  // El script del service worker NUNCA debe servirse desde caché HTTP:
  // una copia vieja secuestra el precache y congela la app en una versión
  // antigua. Se refuerza con `updateViaCache: "none"` en el registro.
  cabeceras.set("Cache-Control", "no-cache, no-store, must-revalidate");
  cabeceras.set("Service-Worker-Allowed", "/");

  return new Response(respuesta.body, {
    status: respuesta.status,
    statusText: respuesta.statusText,
    headers: cabeceras,
  });
}
