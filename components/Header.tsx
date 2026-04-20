// Encabezado principal de DiarioIA
export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <span className="text-xl font-semibold text-[#202124]">
            Diario<span className="text-[#1A73E8]">IA</span>
          </span>
        </div>
        <p className="text-sm text-[#5F6368] hidden sm:block">
          Noticias de inteligencia artificial en español
        </p>
      </div>
    </header>
  );
}
