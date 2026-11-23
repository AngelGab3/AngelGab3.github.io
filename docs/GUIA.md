# Guía de Mantenimiento y Publicación del Portafolio

### Ángel Gabriel Munguía Velázquez · https://angelgab3.github.io

Este sitio web personal y académico está construido con **Jekyll** sobre el tema **al-folio** (arquitectura v1). Se compila y despliega automáticamente en **GitHub Pages** mediante **GitHub Actions** cada vez que se actualiza la rama `main`.

---

## Sistema Automatizado de Fotos de Eventos

Diseñado para que **únicamente copies tus fotos en una subcarpeta de `assets/img/eventos/`** sin tener que editar archivos Markdown (`.md`), salvo que desees incrustar esa galería en una página adicional.

### 1. ¿Dónde se guardan las fotos?

Cada evento tiene su propia subcarpeta dentro de `assets/img/eventos/`:

| Carpeta                                                | Evento correspondiente                                |
| :----------------------------------------------------- | :---------------------------------------------------- |
| `assets/img/eventos/2026-05-planetario-puebla/`        | Conferencia "Atajos Cósmicos" (Domo del Planetario)   |
| `assets/img/eventos/2026-03-infomatrix-san-luis/`      | Final Iberoamericana Infomatrix (Medalla de Oro)      |
| `assets/img/eventos/2025-2026-talleres-stem-udlap/`    | Taller de Computación Cuántica y STEM UDLAP           |
| `assets/img/eventos/2025-10-nasa-space-apps/`          | NASA International Space Apps Challenge               |
| `assets/img/eventos/2025-05-ios-development-lab/`      | Hackathon Apple Swift Challenge & iOS Development Lab |
| `assets/img/eventos/2025-voluntariado-imav-mexcir/`    | Voluntariado técnico en IMAV y MEXCIR                 |
| `assets/img/eventos/2025-smgs-astrofisica/`            | Gráficos y registros de investigación en galaxias SMG |
| `assets/img/eventos/2024-10-congreso-smf-chihuahua/`   | 67.º Congreso Nacional de Física (Efecto Faraday)     |
| `assets/img/eventos/2023-2025-noche-de-las-estrellas/` | Noche de las Estrellas (2023, 2024, 2025)             |

_(Si una carpeta está vacía, el sitio la oculta automáticamente sin mostrar avisos ni espacios en blanco.)_

### 2. Formatos, privacidad y optimización automática

Formatos admitidos: `.jpg`, `.jpeg`, `.png`, `.webp` y `.heic` (fotos de iPhone).

Durante la compilación, `scripts/process_event_photos.py` se encarga de:

1. Convertir automáticamente `.heic` a `.jpg`.
2. Leer la fecha EXIF y corregir la orientación vertical/horizontal.
3. **Eliminar metadatos EXIF y coordenadas GPS** antes de publicar.
4. Optimizar todas las imágenes debajo de **300 KB** y generar variantes cacheadas en WebP (`400w`, `800w`, `1600w`) en `.cache/eventos/`.
5. Renderizar filas justificadas (sin recortar fotos verticales o panorámicas) con visor **PhotoSwipe v5**.

### 3. Orden y archivo opcional `evento.yml`

- **Orden automático:** 1) prefijo numérico en el nombre (`01_domo.jpg`, `02_equipo.jpg`), 2) fecha de captura EXIF, 3) orden alfabético.
- **Metadatos opcionales:** Puedes editar o crear `evento.yml` en cada carpeta con `titulo_es`, `titulo_en`, `fecha`, `lugar`, `descripcion_es`, `descripcion_en`, `portada` y `pie_de_foto`.

### 4. ¿Cómo crear un evento nuevo?

1. Crea una nueva carpeta con fecha al inicio, por ejemplo: `assets/img/eventos/2027-04-mi-nuevo-evento/`.
2. Coloca tus fotos dentro (y opcionalmente un archivo `evento.yml`).
3. El nuevo álbum aparecerá **automáticamente** en la página `/galeria/` ordenado del más reciente al más antiguo, sin tocar ningún `.md`.
4. _(Opcional)_ Si también quieres incrustarlo dentro de una página o proyecto específico, agrega:

```liquid
{% raw %}{% include event_gallery.liquid folder="2027-04-mi-nuevo-evento" title="Título de Mi Galería" %}{% endraw %}
```

---

## Proyectos en `_projects/`

- `infomatrix-visual-assistant.md`: Asistente visual con IA (Infomatrix).
- `nasa-space-apps.md`: NASA Space Apps Challenge (Calidad del aire y Exoplanetas).
- `tmr-robotics-control.md`: Robótica y Sistemas de Control (TMR).
- `ios-swift-challenge.md`: Desarrollo Nativo iOS (Swift Challenge & iOS Lab).
- `galaxyae-manga-desom.md`: GalaxyAE y MaNGA-DESOM (Astrofísica Computacional).
- `deep-learning-manifolds.md`: Deep Learning & Topological Manifolds.
- `quantum-computing.md`: Computación Cuántica (Implementaciones y notas Qiskit).

---

## Estructura de Páginas y Datos

| Archivo                           | Contenido                                                                    |
| :-------------------------------- | :--------------------------------------------------------------------------- |
| `_pages/about.md`                 | Portada bilingüe: biografía, educación, experiencia, becas/premios y skills. |
| `_pages/projects.md`              | Catálogo bilingüe por categorías de `_projects/`.                            |
| `_pages/investigaciones.md`       | Investigación en galaxias SMGs (UDLAP) y efecto Faraday (67.º Congreso SMF). |
| `_pages/lectures.md`              | Serie de conferencias _Deep Learning: A Mathematical and Physical Approach_. |
| `_pages/charlas.md`               | Conferencias (Planetario de Puebla, SMF) y talleres (UDLAP STEM, Noche).     |
| `_pages/certificados.md`          | Cuadrícula con certificaciones (UNAM, Boulder, Packt, HKUST, Cisco, TOEFL).  |
| `_pages/galeria.md`               | Galería fotográfica automática agrupada por evento (`/galeria/`).            |
| `_pages/voluntariado.md`          | Participación técnica en congresos (IMAV y MEXCIR).                          |
| `_pages/cv.md`                    | Visor PDF y enlaces al currículum (`assets/pdf/cv.pdf`).                     |
| `_data/cv.yml`                    | Datos estructurados del currículum (sin número telefónico).                  |
| `_data/socials.yml`               | Correo institucional, GitHub y LinkedIn.                                     |
| `_config.yml`                     | Configuración global, plugins, SEO/OpenGraph y exclusiones de despliegue.    |
| `scripts/process_event_photos.py` | Conversión HEIC, limpieza EXIF/GPS y variantes WebP cacheadas.               |
| `_plugins/eventos_generator.rb`   | Generador Jekyll que expone `site.data.eventos` ordenados por fecha.         |

---

## Flujo de Publicación con Git

```bash
git status
git add .
git commit -m "Agregar fotos de evento y actualizar contenido"
git push origin main
```

GitHub Actions compila el sitio con Jekyll, procesa las fotos y publica la carpeta `_site/` en la rama `gh-pages` con `.nojekyll` y `clean: true`. En pocos minutos se refleja en <https://angelgab3.github.io/>.
