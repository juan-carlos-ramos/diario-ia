// Utilidades generales del proyecto
import { format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Formatea una fecha ISO a formato legible en español
 */
export function formatearFecha(fechaISO: string): string {
  try {
    const fecha = parseISO(fechaISO);
    if (!isValid(fecha)) return "Fecha desconocida";
    return format(fecha, "d 'de' MMMM, yyyy", { locale: es });
  } catch {
    return "Fecha desconocida";
  }
}

/**
 * Formatea YYYY-MM-DD a formato legible
 */
export function formatearFechaCorta(fecha: string): string {
  try {
    const parsed = parseISO(fecha);
    if (!isValid(parsed)) return fecha;
    return format(parsed, "d MMM yyyy", { locale: es });
  } catch {
    return fecha;
  }
}
