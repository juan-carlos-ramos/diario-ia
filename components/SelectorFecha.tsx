"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { formatearFechaCorta } from "@/lib/utils";

interface Props {
  fechas: string[];
  fechaActual: string;
}

export default function SelectorFecha({ fechas, fechaActual }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [abierto, setAbierto] = useState(false);

  if (fechas.length <= 1) return null;

  const handleFecha = (fecha: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (fecha === fechas[0]) {
      params.delete("fecha");
    } else {
      params.set("fecha", fecha);
    }
    router.push(`/?${params.toString()}`);
    setAbierto(false);
  };

  return (
    <div>
      {/* Botón visible solo en móvil */}
      <button
        onClick={() => setAbierto(!abierto)}
        className="sm:hidden flex items-center gap-2 text-sm text-[#5F6368] dark:text-gray-400 mb-2"
        aria-expanded={abierto}
      >
        <span>📅 Historial</span>
        <span>{abierto ? "▲" : "▼"}</span>
      </button>

      {/* En escritorio siempre visible, en móvil solo si está abierto */}
      <div
        className={`${abierto ? "flex" : "hidden"} sm:flex items-center gap-2 flex-wrap`}
      >
        <span className="text-sm text-[#5F6368] dark:text-gray-400 font-medium hidden sm:inline">
          Historial:
        </span>
        {fechas.slice(0, 7).map((fecha) => (
          <button
            key={fecha}
            onClick={() => handleFecha(fecha)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:ring-offset-1 ${
              fecha === fechaActual
                ? "bg-[#1A73E8] text-white border-[#1A73E8]"
                : "bg-white dark:bg-gray-800 text-[#5F6368] dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-[#1A73E8] hover:text-[#1A73E8]"
            }`}
            aria-label={`Ver noticias del ${formatearFechaCorta(fecha)}`}
            aria-current={fecha === fechaActual ? "true" : undefined}
          >
            {formatearFechaCorta(fecha)}
          </button>
        ))}
      </div>
    </div>
  );
}
