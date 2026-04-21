"use client";
import { useRouter, useSearchParams } from "next/navigation";

const CATEGORIAS = [
  { valor: "", etiqueta: "Todas" },
  { valor: "tecnologia", etiqueta: "Tecnología" },
  { valor: "investigacion", etiqueta: "Investigación" },
  { valor: "productividad", etiqueta: "Productividad" },
];

export default function FiltroCategoria() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoriaActual = searchParams.get("categoria") ?? "";

  const handleCategoria = (valor: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (valor) {
      params.set("categoria", valor);
    } else {
      params.delete("categoria");
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
      role="group"
      aria-label="Filtrar por categoría"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {CATEGORIAS.map((cat) => (
        <button
          key={cat.valor}
          onClick={() => handleCategoria(cat.valor)}
          className={`flex-shrink-0 text-xs font-semibold tracking-[0.06em] uppercase px-4 py-2 rounded-full border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:ring-offset-1 focus:ring-offset-black ${
            categoriaActual === cat.valor
              ? "bg-[#00E5FF] text-black border-[#00E5FF]"
              : "bg-transparent text-[#666666] border-[#333333] hover:border-[#00E5FF] hover:text-[#00E5FF]"
          }`}
          aria-pressed={categoriaActual === cat.valor}
        >
          {cat.etiqueta}
        </button>
      ))}
    </div>
  );
}
