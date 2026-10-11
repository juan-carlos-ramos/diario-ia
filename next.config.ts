import { withSerwist } from "@serwist/turbopack";
import type { NextConfig } from "next";

/**
 * Configuración de Next.js 16 (App Router + Turbopack) para DiarioIA.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * FASE 3 (modo offline): `withSerwist` envuelve la config para que el Route
 * Handler `app/serwist/[path]/route.ts` pueda cargar `esbuild` en tiempo de
 * build. Lo único que AÑADE es:
 *   serverExternalPackages: ["esbuild", "esbuild-wasm"]
 * No inyecta plugins de webpack (eso es cosa de `@serwist/next`), por eso es
 * compatible con Turbopack sin renunciar a él.
 * ────────────────────────────────────────────────────────────────────────────
 *
 * FASE 4 (cabeceras de seguridad HTTP):
 *   `headers()` se define DENTRO del objeto que recibe `withSerwist(...)`, de
 *   modo que la función se conserva al hacer el spread interno
 *   (`{ ...nextConfig, serverExternalPackages: [...] }`). Patrón verificado
 *   contra la doc oficial de Next.js 16:
 *   https://nextjs.org/docs/app/api-reference/config/next-config-js/headers
 *   https://nextjs.org/docs/app/guides/content-security-policy
 *
 *   Nota: la ruta del service worker (`/serwist/:path*`) queda EXCLUIDA de la
 *   CSP a propósito. Ver la justificación junto a la regla de cabeceras.
 * ────────────────────────────────────────────────────────────────────────────
 */

/**
 * En desarrollo, React usa `eval()` para reconstruir stacks de error en el
 * navegador; sin `'unsafe-eval'` el overlay de desarrollo se rompe. En
 * producción ni React ni Next.js usan `eval`, así que se omite.
 * (Fuente: doc oficial de CSP de Next.js 16.)
 */
const isDev = process.env.NODE_ENV === "development";

/**
 * Hosts de imágenes remotas que el sitio carga con `<img src>` DIRECTOS (no vía
 * `next/image`, que serviría `/_next/image?...` y quedaría cubierto por
 * `'self'`). Se derivan de los `images.remotePatterns` de abajo más los hosts
 * realmente presentes en los campos `imagen` de `data/noticias/*.json`
 * (verificado el 2026-10-11): i.blogs.es, imagenes.elpais.com (→ `*.elpais.com`),
 * i0.wp.com, redeszone, muycomputer, hardzone, adslzone, picsum.photos,
 * s.w.org y algunos `www.youtube.com` (asset de datos de origen).
 * Sin estos hosts, al pasar la CSP a enforcing las imágenes se bloquearían.
 */
const CSP_IMG_HOSTS = [
  "https://i.blogs.es",
  "https://elpais.com",
  "https://*.elpais.com",
  "https://i0.wp.com",
  "https://www.redeszone.net",
  "https://www.muycomputer.com",
  "https://hardzone.es",
  "https://picsum.photos",
  "https://www.adslzone.net",
  "https://s.w.org",
  "https://www.youtube.com",
].join(" ");

/**
 * Política CSP (sin nonce, apta para render estático + ISR + CDN de Vercel).
 *
 * `'unsafe-inline'` en `script-src` es necesario porque el layout inyecta un
 * `<script>` inline de arranque de tema (`theme-bootstrap`) y un JSON-LD, y
 * Next.js añade sus propios scripts inline de hidratación. Un nonce obligaría
 * a render dinámico y mataría ISR/CDN/PPR (inaceptable en un diario).
 *
 * `worker-src 'self'` permite registrar el service worker en `/serwist/sw.js`.
 */
const cspDirectives = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' blob: data: ${CSP_IMG_HOSTS}`,
  "font-src 'self'",
  // `/_vercel/insights/*` es same-origin en producción y queda cubierto por
  // `'self'`; `va.vercel-scripts.com` solo se usa en desarrollo (script.debug).
  "connect-src 'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "worker-src 'self'",
  "upgrade-insecure-requests",
];

const cspHeaderValue = cspDirectives.join("; ");

/**
 * Interruptor de despliegue de la CSP.
 *
 * `false`  → `Content-Security-Policy-Report-Only` (no bloquea; solo reporta).
 * `true`   → `Content-Security-Policy` (ENFORCING).
 *
 * FASE 4 se entrega en Report-Only: no hay navegador en la sesión de auditoría
 * para validar violaciones y no se debe arriesgar producción. Para activar
 * enforcing: revisar los informes de violación (DevTools → Console y/o
 * Reporting API), confirmar que no hay bloqueos legítimos y poner `true`.
 */
const CSP_ENFORCE = false;
const CSP_HEADER_NAME = CSP_ENFORCE
  ? "Content-Security-Policy"
  : "Content-Security-Policy-Report-Only";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "i.blogs.es" },
      { protocol: "https", hostname: "**.elpais.com" },
      { protocol: "https", hostname: "hipertextual.com" },
      { protocol: "https", hostname: "www.adslzone.net" },
      { protocol: "https", hostname: "www.redeszone.net" },
      { protocol: "https", hostname: "hardzone.es" },
      { protocol: "https", hostname: "www.muycomputer.com" },
    ],
  },
};

export default withSerwist({
  ...nextConfig,
  async headers() {
    return [
      {
        // Cabeceras "seguras y no rompientes" en TODAS las rutas. No requieren
        // navegador para validarse y no alteran el comportamiento del sitio.
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
        ],
      },
      {
        // CSP en todas las rutas EXCEPTO `/serwist/*`.
        //
        // Por qué se excluye el service worker: una cabecera CSP sobre la
        // respuesta del script de un service worker pasa a gobernar el scope
        // global del worker (su policy container se construye a partir de los
        // headers del script). El `defaultCache` de Serwist usa reglas para
        // recursos cross-origin (imágenes remotas y una regla `!sameOrigin`),
        // así que un `connect-src 'self' ...` en enforcing impediría al SW
        // hacer `fetch()` de las imágenes de i.blogs.es y compañía, rompiendo
        // el cacheo offline. Excluir esta ruta mantiene intacto el modo offline.
        source: "/((?!serwist).*)",
        headers: [{ key: CSP_HEADER_NAME, value: cspHeaderValue }],
      },
    ];
  },
});
