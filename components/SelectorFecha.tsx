// Selector de fecha para navegar el historial
"use client";
import { useRouter } from "next/navigation";

interface Props {
  fechas: string[];
  fechaActual: string;
}

export default function SelectorFecha({ fechas, fechaActual }: Props) {
  const router = useRouter();

  if (fechas.length <= 1) return null;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-sm text-[#5F6368] font-medium">Historial:</span>
      <div className="flex gap-2 flex-wrap">
        {fechas.slice(0, 7).map((fecha) => (
          <button
            key={fecha}
            onClick={() =>
              router.push(fecha === fechas[0] ? "/" : `/?fecha=${fecha}`)
            }
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:ring-offset-1 ${
              fecha === fechaActual
                ? "bg-[#1A73E8] text-white border-[#1A73E8]"
                : "bg-white text-[#5F6368] border-gray-200 hover:border-[#1A73E8] hover:text-[#1A73E8]"
            }`}
            aria-label={`Ver noticias del ${fecha}`}
            aria-current={fecha === fechaActual ? "true" : undefined}
          >
            {fecha}
          </button>
        ))}
      </div>
    </div>
  );
}
