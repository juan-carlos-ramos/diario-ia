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
    <div className="relative w-full">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA0A6]">
        🔍
      </span>
      <input
        type="search"
        placeholder="Buscar noticias de IA..."
        defaultValue={searchParams.get("q") ?? ""}
        onChange={handleBusqueda}
        className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-full bg-[#F8F9FA] dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent placeholder-[#9AA0A6]"
        aria-label="Buscar noticias de IA"
      />
    </div>
  );
}
