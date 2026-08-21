"use client";
import Header from "@/components/Header";
import NoticiaCard from "@/components/NoticiaCard";
import { useFavoritos } from "@/lib/favoritos";
import Link from "next/link";

export default function PaginaGuardados() {
  const { favoritos, montado, totalFavoritos } = useFavoritos();

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8 pb-24 sm:pb-8 stagger-entry">
        {/* Cabecera de la sección */}
        <div className="flex items-center justify-between mb-8 border-b border-[var(--color-border)] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                href="/"
                className="text-xs font-bold text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors inline-flex items-center gap-1"
              >
                ← Inicio
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Noticias Guardadas
              {montado && totalFavoritos > 0 && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-[oklch(76%_0.19_200_/_20%)] text-[var(--color-accent)] border border-[var(--color-accent)] font-bold">
                  {totalFavoritos}
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-muted)] mt-1 font-medium">
              Tu colección personal de artículos guardados en este dispositivo.
            </p>
          </div>
        </div>

        {/* Contenido */}
        {!montado ? (
          <div className="py-20 text-center text-[var(--color-muted)] text-sm">
            Cargando tus noticias guardadas...
          </div>
        ) : favoritos.length === 0 ? (
          <div className="py-20 px-4 text-center max-w-md mx-auto flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-accent)] text-2xl mb-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <svg
                className="w-8 h-8"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white mb-2">
              No tienes noticias guardadas
            </h2>
            <p className="text-xs text-[var(--color-muted)] mb-6 leading-relaxed">
              Guarda artículos interesantes tocando el icono de marcador en cualquier tarjeta de noticia para leerlos cuando quieras.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--color-accent)] text-black text-xs font-bold transition-transform active:scale-95 interactive-tap"
            >
              Explorar noticias de hoy →
            </Link>
          </div>
        ) : (
          <section
            aria-label="Lista de noticias guardadas"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {favoritos.map((noticia, idx) => (
              <NoticiaCard key={noticia.id} noticia={noticia} index={idx} />
            ))}
          </section>
        )}
      </main>

      <footer className="mt-16 border-t border-[#111111] py-8 text-center text-xs text-[#333333]">
        DiarioIA · Colección personal en tu navegador
      </footer>
    </>
  );
}
