import { obtenerNoticiasDeHoy, leerArchivoPorFecha, listarFechasDisponibles } from "@/lib/noticias";
import Header from "@/components/Header";
import NoticiaCard from "@/components/NoticiaCard";
import NoticiaHero from "@/components/NoticiaHero";
import EstadoVacio from "@/components/EstadoVacio";
import SelectorFecha from "@/components/SelectorFecha";
import Buscador from "@/components/Buscador";
import FiltroCategoria from "@/components/FiltroCategoria";
import { Suspense } from "react";

interface Props {
  searchParams: Promise<{ fecha?: string; q?: string; categoria?: string }>;
}

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const fechas = listarFechasDisponibles();
  const fechaSeleccionada = params.fecha ?? fechas[0] ?? "";

  const archivo = fechaSeleccionada
    ? leerArchivoPorFecha(fechaSeleccionada)
    : obtenerNoticiasDeHoy();

  let noticias = archivo?.noticias ?? [];

  if (params.categoria) {
    noticias = noticias.filter((n) => n.categoria === params.categoria);
  }

  if (params.q) {
    const busqueda = params.q.toLowerCase();
    noticias = noticias.filter(
      (n) =>
        n.titulo.toLowerCase().includes(busqueda) ||
        n.resumen.toLowerCase().includes(busqueda)
    );
  }

  const noticiaHero = noticias[0] ?? null;
  const noticiasGrid = noticias.slice(1);

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8 pb-24 sm:pb-8">

        {/* Hero */}
        <section className="mb-6">
          <h1 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#00E5FF] mb-6">
            Noticias de Inteligencia Artificial
          </h1>

          {/* Noticia principal grande */}
          {noticiaHero && !params.q && !params.categoria && (
            <div className="mb-8">
              <NoticiaHero noticia={noticiaHero} />
            </div>
          )}
        </section>

        {/* Búsqueda */}
        <section className="mb-4" aria-label="Búsqueda">
          <Suspense>
            <Buscador />
          </Suspense>
        </section>

        {/* Filtros */}
        <section className="mb-4" aria-label="Filtros">
          <Suspense>
            <FiltroCategoria />
          </Suspense>
        </section>

        {/* Historial */}
        {fechas.length > 1 && (
          <section className="mb-6">
            <Suspense>
              <SelectorFecha fechas={fechas} fechaActual={fechaSeleccionada} />
            </Suspense>
          </section>
        )}

        {/* Contador */}
        <p className="text-xs text-[#444444] mb-6 tracking-wide" aria-live="polite">
          {noticias.length} {noticias.length === 1 ? "noticia" : "noticias"}
          {params.q && <span className="ml-1">para <span className="text-[#00E5FF]">"{params.q}"</span></span>}
        </p>

        {/* Grid */}
        <section
          aria-label="Lista de noticias"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {(params.q || params.categoria ? noticias : noticiasGrid).length === 0 ? (
            <EstadoVacio />
          ) : (
            (params.q || params.categoria ? noticias : noticiasGrid).map((noticia) => (
              <NoticiaCard key={noticia.id} noticia={noticia} />
            ))
          )}
        </section>

      </main>

      <footer className="mt-16 border-t border-[#111111] py-8 text-center text-xs text-[#333333]">
        DiarioIA · Actualizado cada 24 horas
      </footer>
    </>
  );
}
