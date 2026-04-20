// Página principal de DiarioIA
import {
  obtenerNoticiasDeHoy,
  leerArchivoPorFecha,
  listarFechasDisponibles,
} from "@/lib/noticias";
import { formatearFechaCorta } from "@/lib/utils";
import Header from "@/components/Header";
import NoticiaCard from "@/components/NoticiaCard";
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

  // Filtrar por categoría
  if (params.categoria) {
    noticias = noticias.filter((n) => n.categoria === params.categoria);
  }

  // Filtrar por búsqueda
  if (params.q) {
    const busqueda = params.q.toLowerCase();
    noticias = noticias.filter(
      (n) =>
        n.titulo.toLowerCase().includes(busqueda) ||
        n.resumen.toLowerCase().includes(busqueda),
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <section className="mb-8" aria-labelledby="titulo-principal">
          <h1
            id="titulo-principal"
            className="text-3xl sm:text-4xl font-bold text-[#202124] mb-2"
          >
            Noticias de IA
          </h1>
          <p className="text-[#5F6368] text-base sm:text-lg">
            Lo más relevante sobre inteligencia artificial en español.
            {fechaSeleccionada && (
              <span className="ml-2 font-medium text-[#1A73E8]">
                {formatearFechaCorta(fechaSeleccionada)}
              </span>
            )}
          </p>
        </section>

        {/* Buscador y filtros */}
        <section
          className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
          aria-label="Filtros y búsqueda"
        >
          <Suspense>
            <FiltroCategoria />
          </Suspense>
          <Suspense>
            <Buscador />
          </Suspense>
        </section>

        {/* Selector de historial */}
        {fechas.length > 1 && (
          <section className="mb-8" aria-label="Navegación por historial">
            <SelectorFecha fechas={fechas} fechaActual={fechaSeleccionada} />
          </section>
        )}

        {/* Contador */}
        <p className="text-sm text-[#5F6368] mb-6" aria-live="polite">
          {noticias.length}{" "}
          {noticias.length === 1
            ? "noticia encontrada"
            : "noticias encontradas"}
          {params.q && (
            <span className="ml-1">
              para <strong>"{params.q}"</strong>
            </span>
          )}
        </p>

        {/* Grid de noticias */}
        <section
          aria-label="Lista de noticias"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {noticias.length === 0 ? (
            <EstadoVacio />
          ) : (
            noticias.map((noticia) => (
              <NoticiaCard key={noticia.id} noticia={noticia} />
            ))
          )}
        </section>
      </main>

      <footer className="mt-16 border-t border-gray-100 py-8 text-center text-xs text-[#9AA0A6]">
        DiarioIA · Actualizado automáticamente cada 24 horas · Solo noticias en
        español
      </footer>
    </>
  );
}
