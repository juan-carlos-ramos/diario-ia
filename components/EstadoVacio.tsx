export default function EstadoVacio() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <span className="text-5xl mb-4 opacity-20">◈</span>
      <h3 className="text-base font-bold text-[#F0F0F0] mb-2">
        Sin noticias por ahora
      </h3>
      <p className="text-sm text-[#444444] max-w-sm">
        El sistema se actualiza automáticamente cada 24 horas.
      </p>
    </div>
  );
}
