"use client";
import { useEffect, useState } from "react";

export default function BarraProgresoLectura() {
  const [progreso, setProgreso] = useState(0);

  useEffect(() => {
    const calcularProgreso = () => {
      const scrollActual = window.scrollY;
      const alturaTotal = document.documentElement.scrollHeight - window.innerHeight;
      if (alturaTotal > 0) {
        const porcentaje = Math.min(100, Math.max(0, (scrollActual / alturaTotal) * 100));
        setProgreso(porcentaje);
      }
    };

    window.addEventListener("scroll", calcularProgreso, { passive: true });
    calcularProgreso();

    return () => window.removeEventListener("scroll", calcularProgreso);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 z-50 bg-transparent pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-[#00E5FF] to-[oklch(80%_0.18_180)] transition-all duration-75 ease-out shadow-[0_0_8px_#00E5FF]"
        style={{ width: `${progreso}%` }}
      />
    </div>
  );
}
