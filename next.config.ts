import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Evita que el sitio se cargue dentro de un iframe (clickjacking)
          { key: "X-Frame-Options", value: "DENY" },
          // Evita que el navegador adivine el tipo de archivo
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Fuerza HTTPS siempre
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          // Controla qué información se envía al hacer clic en links externos
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Restringe acceso a funciones del navegador innecesarias
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Protección básica contra XSS
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
    ];
  },
};

export default nextConfig;
