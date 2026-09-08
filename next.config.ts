import type { NextConfig } from "next";

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

export default nextConfig;
