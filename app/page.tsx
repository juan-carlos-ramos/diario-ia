// Página principal de DiarioIA
import {
  obtenerNoticiasDeHoy,
  leerArchivoPorFecha,
  listarFechasDisponibles,
} from "@/lib/noticias";
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

  if (params.categoria) {
    noticias = noticias.filter((n) => n.categoria === params.categoria);
  }

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
        <section className="mb-6" aria-labelledby="titulo-principal">
          <h1
            id="titulo-principal"
            className="text-3xl sm:text-4xl font-bold text-[#202124] dark:text-white mb-1"
          >
            Noticias de IA
          </h1>
          <p className="text-[#5F6368] dark:text-gray-400 text-base sm:text-lg">
            Lo más relevante sobre inteligencia artificial.
          </p>
        </section>

        {/* Búsqueda — ancho completo */}
        <section className="mb-4" aria-label="Búsqueda">
          <Suspense>
            <Buscador />
          </Suspense>
        </section>

        {/* Filtros de categoría */}
        <section className="mb-4" aria-label="Filtros por categoría">
          <Suspense>
            <FiltroCategoria />
          </Suspense>
        </section>

        {/* Historial — colapsable en móvil */}
        {fechas.length > 1 && (
          <section className="mb-6" aria-label="Historial de fechas">
            <Suspense>
              <SelectorFecha fechas={fechas} fechaActual={fechaSeleccionada} />
            </Suspense>
          </section>
        )}

        {/* Contador */}
        <p
          className="text-sm text-[#5F6368] dark:text-gray-400 mb-6"
          aria-live="polite"
        >
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

      <footer className="mt-16 border-t border-gray-100 dark:border-gray-800 py-8 text-center text-xs text-[#9AA0A6]">
        DiarioIA · Actualizado automáticamente cada 24 horas · Solo noticias en
        español
      </footer>
    </>
  );
}
