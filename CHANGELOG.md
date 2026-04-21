# Changelog — DiarioIA

Todos los cambios notables del proyecto se documentan en este archivo.

## [0.8.0] — Rediseño Visual Completo

### Añadido
- Tema dark profundo con acento cian #00E5FF
- Noticia hero de gran formato en página principal
- Bottom NavBar fija en móvil
- Página de detalle rediseñada estilo editorial
- Sistema de tipografía Inter con tracking editorial
- Scrollbar personalizado con acento cian

## [0.7.0] — Modo Oscuro

### Añadido
- Modo oscuro completo con next-themes
- Botón de alternancia en el header
- Respeta la preferencia del sistema operativo automáticamente


## [0.6.0] — Fase 6 — Integración Telegram

### Añadido
- Bot de Telegram publica automáticamente las 10 noticias principales cada 24h
- Mensajes con formato Markdown, resumen y link directo a DiarioIA
- Variables de entorno para token y canal de Telegram
- Secrets configurados en GitHub Actions


## [0.5.0] — Fase 5 — Página de Detalle y SEO

### Añadido
- Página individual por noticia con URL propia (/noticia/[id])
- Metadatos SEO dinámicos por noticia (título, descripción, OpenGraph)
- Vista previa para WhatsApp, Twitter y redes sociales
- Página 404 personalizada para noticias no encontradas
- Las tarjetas ahora abren la página de detalle interna

## [0.4.0] — Fase 3 — Filtros y Búsqueda

### Añadido
- Buscador por palabras clave en título y resumen
- Filtros por categoría: Todas, Tecnología, Investigación, Productividad
- Contador de resultados con texto de búsqueda activa

## [0.3.0] — Fase 2 — UI/UX Interfaz Visual

### Añadido
- Header fijo con logo DiarioIA
- Tarjetas de noticias estilo Google Blog
- Skeleton de carga animado
- Estados de vacío y error
- Selector de historial por fecha
- Grid responsivo: 1 columna móvil, 2 tablet, 3 escritorio
- Utilidades de formateo de fechas en español

## [0.1.0] — Fase 0 — Setup Base

### Añadido

- Proyecto Next.js 14 con TypeScript y App Router
- Configuración de Tailwind CSS con variables de color personalizadas
- ESLint y Prettier configurados
- Sistema de carpetas base del proyecto
- Estructura para almacenamiento de noticias en JSON
- Variables de entorno documentadas en .env.example
- README.md con documentación inicial
- Vitest configurado para tests
- Página placeholder de inicio
