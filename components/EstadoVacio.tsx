// Estado cuando no hay noticias disponibles
export default function EstadoVacio() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <span className="text-6xl mb-4">📭</span>
      <h3 className="text-lg font-semibold text-[#202124] mb-2">
        No hay noticias por ahora
      </h3>
      <p className="text-sm text-[#5F6368] max-w-sm">
        El sistema actualizará las noticias automáticamente cada 24 horas.
        Vuelve pronto.
      </p>
    </div>
  );
}
