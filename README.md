<div align="center">

# 📰 DiarioIA — The Modern Broadsheet

**Periódico digital independiente sobre Inteligencia Artificial en Español.**  
Curaduría editorial automatizada cada 24 horas con análisis contextual por Gemini 3 Flash.

[![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/AI_Engine-Gemini_3_Flash-8E75FF?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Vitest](https://img.shields.io/badge/Tests-Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel&logoColor=white)](https://diario-ia.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

[🌐 Ver en Producción](https://diario-ia.vercel.app) · [✈️ Canal de Telegram](https://t.me/diariodeia) · [📖 Documentación](/docs/)

</div>

---

## 🌟 Características Principales

### 🗞️ 1. Identidad Editorial "The Modern Broadsheet"
- **Tipografía de Imprenta Clásica:** Titulares de alto impacto en *Newsreader* (Serif de imprenta) y cuerpo en *Plus Jakarta Sans*.
- **Paleta Cromática OKLCH:** Cero blanco puro deslumbrante (`#ffffff`). Diseñado en espacio OKLCH con tonos papel prensa marfil (`oklch(96.8% 0.007 75)`) y tinta carbón profunda (`oklch(18% 0.015 50)`).
- **☀️🌙 Selector de Tema Dual:** Modo Claro (Papel Prensa) y Modo Oscuro (Carbón Obsidiana Cálido) sincronizado en tiempo real con `useSyncExternalStore` y persistencia en `localStorage`.

### 🤖 2. Pipeline Editorial con Gemini 3 Flash
- **Ingesta Automatizada:** Ingesta multicanal RSS (El País, Hipertextual, Xataka, MuyComputer, ADSLZone, HardZone, Genbeta) programada vía GitHub Actions cada 24h.
- **Enriquecimiento con IA:**
  - Resumen periodístico ejecutivo sin relleno.
  - 📌 **"En 3 Puntos Clave":** Viñetas sintéticas de lectura rápida.
  - 💡 **"¿Por qué importa?":** Análisis contextual del impacto para la industria tecnológica.
  - Categorización automática y tags temáticos (`#OpenAI`, `#Claude`, `#Robótica`, etc.).
  - Pacing controlado de peticiones (4.5s) con backoff exponencial.

### ✈️ 3. Distribución Multicanal en Telegram
- Entrega automatizada de noticias destacadas al canal [@diariodeia](https://t.me/diariodeia) con fotos en alta resolución, escape seguro MarkdownV2 y enlaces directos.

### 🛠️ 4. Directorio de Herramientas de IA & Herramienta del Día
- Catálogo filtrable por categorías y modelos de precios (Gratis, Freemium, Open Source, Comercial).
- Algoritmo determinista de selección de la *"Herramienta del Día"* basado en fecha UTC.

### 🔍 5. Buscador Global Rápido (`⌘K` / `Ctrl+K`)
- Modal *bottom-sheet* táctil optimizado para móviles y escritorio con navegación por teclado (flechas `↑` `↓` y `Enter`) y chips de temas populares.

### 📱 6. PWA & Optimización Web
- **Progressive Web App:** Webmanifest, iconos adaptativos y soporte de instalación como App nativa en iOS/Android.
- **SEO & Structured Data:** `sitemap.xml` dinámico, `robots.txt` y Schema.org `NewsArticle` JSON-LD sanitizado contra XSS.

### 🛡️ 7. Seguridad Blindada (Enterprise Hardening)
- Content Security Policy (CSP) estricta, protección contra Clickjacking (`X-Frame-Options: DENY`), aislamiento de procesos COOP/CORP y prevención de path traversal.
- Principio de Mínimos Privilegios en CI/CD (`permissions: {}`).

---

## 🏗️ Arquitectura Técnica

```
diario-ia/
├── app/                        # Next.js 16 App Router (Turbopack)
│   ├── api/buscar/             # Endpoint de búsqueda unificada
│   ├── guardados/              # Colección de noticias guardadas (favoritos)
│   ├── herramientas/           # Directorio interactivo de herramientas de IA
│   ├── noticia/[id]/           # Vista editorial de artículo completo con JSON-LD
│   ├── globals.css             # Design Tokens OKLCH & Reglas del Modo Claro/Oscuro
│   ├── layout.tsx              # Root Layout, tipografías Google y theme bootstrap
│   ├── manifest.ts             # Manifiesto de PWA
│   ├── page.tsx                # Portada principal con Noticia Hero y Grid
│   ├── robots.ts               # Configuración para motores de búsqueda
│   └── sitemap.ts              # Generador dinámico de mapa del sitio
├── components/                 # Componentes modulares con microinteracciones
│   ├── BarraAccionesMovil.tsx  # Barra flotante inferior de acciones táctiles
│   ├── BotonCompartir.tsx      # Web Share API con fallback a clipboard
│   ├── BotonFavorito.tsx       # Marcador de guardado reactivo
│   ├── BotonTema.tsx           # Switcher Modo Claro ☀️ / Modo Oscuro 🌙
│   ├── BottomNav.tsx           # Navegación móvil principal
│   ├── BuscadorModal.tsx       # Buscador instantáneo con atajo ⌘K
│   ├── Header.tsx              # Cabecera editorial con logo y accesos directos
│   ├── HerramientaDelDia.tsx   # Tarjeta destacada de herramienta diaria
│   ├── NoticiaCard.tsx         # Tarjeta de noticia con tags y tiempo de lectura
│   ├── NoticiaHero.tsx         # Noticia principal destacada de portada
│   └── SelectorFecha.tsx       # Filtro cronológico de ediciones diarias
├── data/                       # Archivos JSON persistidos por fecha (YYYY-MM-DD.json)
├── docs/                       # Documentación técnica y changelog centralizado
│   └── changelog.md            # Registro histórico de versiones y cambios
├── lib/                        # Lógica de dominio, utilidades y hooks
│   ├── favoritos.ts            # Hook useFavoritos con useSyncExternalStore
│   ├── herramientas.ts         # Catálogo curado de herramientas de IA
│   ├── noticias.ts             # Parser y lector seguro de noticias diarias
│   └── utils.ts                # Formateadores de fecha y helpers
├── scripts/                    # Pipelines de automatización
│   └── fetch-news.mjs          # Script Node.js de ingesta RSS, Gemini y Telegram
├── tests/                      # Suite de pruebas unitarias (Vitest + Testing Library)
│   ├── favoritos.test.ts       # Pruebas de almacenamiento reactivo
│   ├── herramientas.test.ts    # Pruebas de selección determinista
│   └── noticias.test.ts        # Pruebas de validación y parsing de noticias
└── .github/workflows/          # Automatizaciones de GitHub Actions
    ├── ci.yml                  # Pipeline de CI (Vitest + Next.js Build)
    └── fetch-news.yml          # Cron diario de ingesta y enriquecimiento
```

---

## 🚀 Inicio Rápido (Desarrollo Local)

### Requisitos Previos
- **Node.js:** `>= 20.0.0` (Recomendado: `Node.js 22 LTS`)
- **npm:** `>= 10.0.0`

### 1. Clonar el repositorio
```bash
git clone https://github.com/juan-carlos-ramos/diario-ia.git
cd diario-ia
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea tu archivo `.env.local` a partir de la plantilla:
```bash
cp .env.example .env.local
```

Configura tus credenciales:
```env
# Gemini API Key (para enriquecimiento editorial con IA)
GEMINI_API_KEY="tu_gemini_api_key_aqui"

# Telegram Bot (opcional, para envío automático a canales)
TELEGRAM_BOT_TOKEN="tu_bot_token_aqui"
TELEGRAM_CHAT_ID="@tu_canal_o_chat_id"

# URL base del sitio
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 4. Iniciar el servidor de desarrollo
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🧪 Comandos y Suite de Pruebas

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo de Next.js con Turbopack. |
| `npm run build` | Compila la aplicación para producción y valida tipos TypeScript. |
| `npm run start` | Inicia el servidor de producción. |
| `npm test` | Ejecuta la suite de pruebas unitarias con **Vitest**. |
| `npm run lint` | Ejecuta el análisis estático de código con **ESLint**. |
| `node scripts/fetch-news.mjs` | Ejecuta manualmente el pipeline de ingesta y análisis con Gemini. |

---

## 🛡️ Seguridad y Buenas Prácticas

- **Cero secretos en Git:** Las API keys y tokens se gestionan estrictamente a través de variables de entorno seguras (`.env.local` y GitHub Secrets).
- **Validación de URLs:** Protocolos estrictos `http:` y `https:` para prevenir inyecciones o esquemas peligrosos (`javascript:`, `data:`).
- **Sanitización de JSON-LD:** Prevención de script injection escapando caracteres `<` a `\u003c`.
- **Content Security Policy (CSP):** Bloqueo de orígenes externos no autorizados y marcos (*anti-clickjacking*).

---

## 📄 Licencia

Este proyecto está distribuido bajo la licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más información.

---

<div align="center">
Desarrollado con pasión editorial y tecnología moderna.  
<strong>DiarioIA</strong> · <em>Noticias de Inteligencia Artificial para mentes curiosas.</em>
</div>
