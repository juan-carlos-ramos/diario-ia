import Link from "next/link";
import Header from "@/components/Header";

export default function NoticiaNotFound() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-16 sm:py-24 text-center">
        {/* Cabecera periodística */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-accent)] text-2xl mb-6 shadow-sm">
          <span className="font-serif text-3xl font-bold">404</span>
        </div>

        <div className="mb-3">
          <span className="text-[11px] font-black tracking-[0.18em] uppercase text-[var(--color-accent)]">
            Hemeroteca DiarioIA
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black font-serif tracking-tight text-[var(--color-text)] mb-4">
          Artículo no encontrado en la edición
        </h1>

        <p className="text-sm sm:text-base text-[var(--color-muted)] max-w-lg mx-auto mb-8 font-normal leading-relaxed">
          La noticia que intentas consultar no existe en nuestro archivo histórico,
          ha sido reubicada o el enlace no es válido.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[var(--color-accent)] text-[var(--color-on-accent)] text-xs font-bold transition-transform active:scale-95 interactive-tap shadow-[0_2px_12px_oklch(54%_0.17_50_/_20%)]"
          >
            ← Volver a la portada de hoy
          </Link>
          <Link
            href="/herramientas"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[var(--color-surface)] hover:bg-[var(--color-card-hover)] text-[var(--color-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)] text-xs font-semibold transition-colors interactive-tap"
          >
            Explorar Herramientas IA
          </Link>
        </div>
      </main>

      <footer className="mt-16 border-t border-[var(--color-border)] py-8 text-center text-xs text-[var(--color-muted)]">
        DiarioIA · Hemeroteca y archivo de noticias de inteligencia artificial
      </footer>
    </>
  );
}
