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
    [router, searchParams]
  );

  return (
    <div className="relative w-full">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444444] text-sm">
        ⌕
      </span>
      <input
        type="search"
        placeholder="Buscar noticias..."
        defaultValue={searchParams.get("q") ?? ""}
        onChange={handleBusqueda}
        className="w-full pl-10 pr-4 py-3 text-sm bg-[#111111] border border-[#222222] rounded-full text-[#F0F0F0] placeholder-[#444444] focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] transition-colors"
        aria-label="Buscar noticias de IA"
      />
    </div>
  );
}
