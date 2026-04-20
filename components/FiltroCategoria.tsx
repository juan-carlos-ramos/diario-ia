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
          className={`text-sm px-4 py-1.5 rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:ring-offset-1 ${
            categoriaActual === cat.valor
              ? "bg-[#1A73E8] text-white border-[#1A73E8]"
              : "bg-white text-[#5F6368] border-gray-200 hover:border-[#1A73E8] hover:text-[#1A73E8]"
          }`}
          aria-pressed={categoriaActual === cat.valor}
        >
          {cat.etiqueta}
        </button>
      ))}
    </div>
  );
}
