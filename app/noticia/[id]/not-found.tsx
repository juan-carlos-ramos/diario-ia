import Header from "@/components/Header";

export default function NoticiaNoEncontrada() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-24 text-center">
        <span className="text-6xl mb-6 block">📭</span>
        <h1 className="text-2xl font-bold text-[#202124] mb-3">
          Noticia no encontrada
        </h1>
        <p className="text-[#5F6368] mb-8">
          Esta noticia ya no está disponible o el enlace es incorrecto.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-1 px-6 py-3 bg-[#1A73E8] text-white font-medium rounded-[8px] hover:bg-blue-700 transition-colors"
        >
          ← Volver a DiarioIA
        </a>
      </main>
    </>
  );
}
