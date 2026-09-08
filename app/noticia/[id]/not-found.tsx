import Link from "next/link";
import Header from "@/components/Header";

export default function NoticiaNoEncontrada() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-24 text-center">
        <span className="text-6xl mb-6 block opacity-20 text-[var(--color-accent)]">◈</span>
        <h1 className="text-2xl font-bold font-serif tracking-tight text-[var(--color-text)] mb-3">
          Noticia no encontrada
        </h1>
        <p className="text-sm text-[var(--color-muted)] mb-8">
          Esta noticia ya no está disponible o el enlace es incorrecto.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-accent)] text-white text-sm font-bold rounded-full hover:scale-[1.02] transition-all duration-150 interactive-tap shadow-xs"
        >
          ← Volver a DiarioIA
        </Link>
      </main>
    </>
  );
}
