import { createSerwistRoute } from "@serwist/turbopack";

/**
 * Route handler de Serwist para Next.js con Turbopack (Fase 3 · PWA / Modo offline).
 *
 * Compila y empaqueta el service worker definido en `app/sw.ts` mediante esbuild
 * y sirve los artefactos estáticos en `/serwist/sw.js` (y sourcemaps asociados).
 *
 * `useNativeEsbuild: true` garantiza el uso del binario nativo de esbuild en
 * cualquier entorno (Linux, Windows, macOS) sin requerir el runtime WebAssembly.
 */
export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
  createSerwistRoute({
    swSrc: "app/sw.ts",
    useNativeEsbuild: true,
  });
