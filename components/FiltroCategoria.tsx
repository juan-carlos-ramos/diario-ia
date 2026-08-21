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
      className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide snap-x"
      role="group"
      aria-label="Filtrar por categoría"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {CATEGORIAS.map((cat) => {
        const activo = categoriaActual === cat.valor;
        return (
          <button
            key={cat.valor}
            onClick={() => handleCategoria(cat.valor)}
            className={`flex-shrink-0 text-xs font-extrabold tracking-wider uppercase px-5 py-2.5 rounded-full border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-1 focus:ring-offset-black interactive-tap pc-hover-tab snap-align-start ${
              activo
                ? "bg-[var(--color-accent)] text-black border-[var(--color-accent)] shadow-[0_2px_12px_oklch(76%_0.165_72_/_20%)]"
                : "bg-[var(--color-card)] text-[var(--color-muted)] hover:text-white border-[var(--color-border)]"
            }`}
            aria-pressed={activo}
          >
            {cat.etiqueta}
          </button>
        );
      })}
    </div>
  );
}

