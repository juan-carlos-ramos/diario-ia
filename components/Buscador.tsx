"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export default function Buscador() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleBusqueda = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const params = new URLSearchParams(searchParams.toString());
      const valor = e.target.value.trim();
      if (valor) {
        params.set("q", valor);
      } else {
        params.delete("q");
      }
      router.push(`/?${params.toString()}`);
    },
    [router, searchParams],
  );

  return (
    <div className="relative w-full sm:w-80">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA0A6]">
        🔍
      </span>
      <input
        type="search"
        placeholder="Buscar noticias..."
        defaultValue={searchParams.get("q") ?? ""}
        onChange={handleBusqueda}
        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-full bg-[#F8F9FA] focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent placeholder-[#9AA0A6] text-[#202124]"
        aria-label="Buscar noticias de IA"
      />
    </div>
  );
}
