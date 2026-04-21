import Header from "@/components/Header";

export default function NoticiaNoEncontrada() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-24 text-center">
        <span className="text-6xl mb-6 block opacity-10">◈</span>
        <h1 className="text-2xl font-black tracking-[-0.02em] text-[#F0F0F0] mb-3">
          Noticia no encontrada
        </h1>
        <p className="text-sm text-[#444444] mb-8">
          Esta noticia ya no está disponible o el enlace es incorrecto.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#00E5FF] text-black text-sm font-bold rounded-full hover:bg-[#00B8CC] transition-colors"
        >
          ← Volver a DiarioIA
        </a>
      </main>
    </>
  );
}
