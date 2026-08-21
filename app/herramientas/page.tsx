import { Metadata } from "next";
import Header from "@/components/Header";
import { obtenerTodasHerramientas, CATEGORIAS_HERRAMIENTAS } from "@/lib/herramientas";
import HerramientasClient from "./HerramientasClient";

export const metadata: Metadata = {
  title: "Directorio de Herramientas de IA — DiarioIA",
  description: "Descubre y explora las mejores herramientas de Inteligencia Artificial para Vibe Coding, LLMs, productividad, diseño y modelos de código abierto.",
  openGraph: {
    title: "Directorio de Herramientas de IA — DiarioIA",
    description: "Las mejores IAs para desarrolladores, creadores y profesionales curadas a diario.",
    type: "website",
    locale: "es_ES",
  },
};

export default function PaginaHerramientas() {
  const herramientas = obtenerTodasHerramientas();

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-5 py-8 pb-32 sm:pb-16 stagger-entry">
        {/* Cabecera */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[oklch(15%_0.008_200)] border border-[oklch(22%_0.015_200)] text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider mb-4">
            🛠️ Directorio Curado
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Herramientas de IA
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-muted)] leading-relaxed">
            Explora las aplicaciones, modelos y plataformas de inteligencia artificial más potentes para desarrollo, automatización y creación de contenido.
          </p>
        </div>

        {/* Cliente interactivo con filtros y búsqueda */}
        <HerramientasClient herramientasIniciales={herramientas} categorias={CATEGORIAS_HERRAMIENTAS} />
      </main>
    </>
  );
}
