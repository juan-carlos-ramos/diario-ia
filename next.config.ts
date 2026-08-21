import type { NextConfig } from "next";

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https:;
  font-src 'self' data: https://fonts.gstatic.com;
  connect-src 'self' https://api.telegram.org https://generativelanguage.googleapis.com https://va.vercel-scripts.com https://vitals.vercel-insights.com;
  frame-ancestors 'none';
  form-action 'self';
  base-uri 'self';
  object-src 'none';
`.replace(/\s{2,}/g, " ").trim();

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
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Content Security Policy
          { key: "Content-Security-Policy", value: cspHeader },
          // Evita que el sitio se cargue dentro de un iframe (clickjacking)
          { key: "X-Frame-Options", value: "DENY" },
          // Evita que el navegador adivine el tipo de archivo (MIME sniffing)
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Fuerza HTTPS siempre con HSTS
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          // Controla qué información se envía al hacer clic en links externos
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Restringe acceso a funciones del navegador innecesarias
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Aislamiento de ventanas y recursos contra Spectre / side-channels
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
