// Estado de error al cargar noticias
"use client";

export default function EstadoError({ mensaje }: { mensaje?: string }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <span className="text-6xl mb-4">⚠️</span>
      <h3 className="text-lg font-semibold text-[#D93025] mb-2">
        Error al cargar las noticias
      </h3>
      <p className="text-sm text-[#5F6368] max-w-sm">
        {mensaje ??
          "Ocurrió un problema al obtener las noticias. Intenta recargar la página."}
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 px-5 py-2 bg-[#1A73E8] text-white text-sm font-medium rounded-[8px] hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:ring-offset-2"
      >
        Reintentar
      </button>
    </div>
  );
}
