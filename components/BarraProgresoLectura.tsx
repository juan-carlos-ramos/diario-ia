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
        className="h-full bg-gradient-to-r from-[var(--color-accent)] to-[oklch(85%_0.14_85)] transition-all duration-75 ease-out shadow-[0_0_6px_var(--color-accent)]"
        style={{ width: `${progreso}%` }}
      />
    </div>
  );
}
