// Utilidades generales del proyecto

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const MESES_CORTOS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

/**
 * Formatea una fecha ISO a formato legible en español usando UTC
 * para garantizar paridad absoluta entre el renderizado del servidor (SSR)
 * y la hidratación en el cliente en cualquier zona horaria.
 */
export function formatearFecha(fechaISO: string): string {
  try {
    const d = new Date(fechaISO);
    if (isNaN(d.getTime())) return "Fecha desconocida";
    const dia = d.getUTCDate();
    const mes = MESES[d.getUTCMonth()];
    const anio = d.getUTCFullYear();
    return `${dia} de ${mes}, ${anio}`;
  } catch {
    return "Fecha desconocida";
  }
}

/**
 * Formatea YYYY-MM-DD a formato legible corto usando UTC
 */
export function formatearFechaCorta(fecha: string): string {
  try {
    const d = new Date(fecha.includes("T") ? fecha : `${fecha}T00:00:00Z`);
    if (isNaN(d.getTime())) return fecha;
    const dia = d.getUTCDate();
    const mes = MESES_CORTOS[d.getUTCMonth()];
    const anio = d.getUTCFullYear();
    return `${dia} ${mes} ${anio}`;
  } catch {
    return fecha;
  }
}
