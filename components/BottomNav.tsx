"use client";
import { usePathname } from "next/navigation";

import Link from "next/link";

const ITEMS = [
  { href: "/", icono: "⊞", etiqueta: "Inicio" },
  { href: "/?categoria=tecnologia", icono: "◈", etiqueta: "Tecnología" },
  { href: "/?categoria=productividad", icono: "◎", etiqueta: "Trabajo" },
  { href: "https://t.me/diariodeia", icono: "✈", etiqueta: "Telegram", externo: true },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0A] border-t border-[#222222] px-2 py-2"
      aria-label="Navegación principal"
    >
      <div className="flex items-center justify-around">
        {ITEMS.map((item) => {
          const activo = !item.externo && pathname === "/" && item.href === "/";
          
          if (item.externo) {
            return (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 px-4 py-1 rounded-xl text-[#444444] hover:text-[#F0F0F0] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]"
                aria-label={item.etiqueta}
              >
                <span className="text-lg leading-none">{item.icono}</span>
                <span className="text-[10px] font-medium tracking-wide">{item.etiqueta}</span>
              </a>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00E5FF] ${
                activo
                  ? "text-[#00E5FF]"
                  : "text-[#444444] hover:text-[#F0F0F0]"
              }`}
              aria-label={item.etiqueta}
              aria-current={activo ? "page" : undefined}
            >
              <span className="text-lg leading-none">{item.icono}</span>
              <span className="text-[10px] font-medium tracking-wide">{item.etiqueta}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
