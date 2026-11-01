# 📖 Guía Completa de Mantenimiento y Publicación del Portafolio
### Ángel Gabriel Munguía Velázquez · https://angelgab3.github.io

Este sitio web personal y académico está construido sobre **Jekyll** con el tema **al-folio**. Se compila y despliega automáticamente en **GitHub Pages** mediante **GitHub Actions** cada vez que haces `git push origin main`. No requieres instalar herramientas complejas en tu computadora local si no lo deseas; puedes editar todo con Git o directamente desde la interfaz web de GitHub.

---

## 📸 Sistema Automatizado de Fotos de Eventos

Diseñado para que **únicamente arrastres o copies tus fotos en una carpeta** y el sitio web las ordene, recorte y muestre automáticamente en una cuadrícula moderna y responsiva.

### 1. ¿Dónde se guardan las fotos?
Cada evento tiene su propia subcarpeta dentro de `assets/img/eventos/`:

| Carpeta | Evento correspondiente |
| :--- | :--- |
| `assets/img/eventos/2026-05-planetario-puebla/` | Conferencia "Atajos Cósmicos" (Domo del Planetario) |
| `assets/img/eventos/2026-03-infomatrix-san-luis/` | Final Iberoamericana Infomatrix (Medalla de Oro) |
| `assets/img/eventos/2025-2026-talleres-stem-udlap/` | Taller de Computación Cuántica & STEM UDLAP |
| `assets/img/eventos/2025-10-nasa-space-apps/` | NASA International Space Apps Challenge |
| `assets/img/eventos/2025-05-ios-development-lab/` | Hackathon Apple Swift Challenge & iOS Dev Lab |
| `assets/img/eventos/2025-voluntariado-imav-mexcir/` | Voluntariado técnico en IMAV y MEXCIR |
| `assets/img/eventos/2024-10-congreso-smf-chihuahua/` | 67.º Congreso Nacional de Física (Efecto Faraday) |
| `assets/img/eventos/2023-2025-noche-de-las-estrellas/` | Noche de las Estrellas (2023, 2024, 2025) |
| `assets/img/eventos/2025-smgs-astrofisica/` | Gráficos y registros de investigación en galaxias SMGs |

### 2. ¿Cómo se ordenan las fotos?
El sistema las ordena **automáticamente en orden alfabético/numérico** por nombre de archivo.
Para controlar el orden exacto en que aparecen, nómbralas así:
```text
01.jpg
02.jpg
03.png
...
```
*(Formatos admitidos: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`)*

### 3. ¿Cómo crear un evento nuevo en el futuro?
1. Crea una nueva carpeta, por ejemplo: `assets/img/eventos/2027-mi-nuevo-evento/`
2. Coloca tus fotos dentro.
3. En cualquier página de Markdown (por ejemplo en `_pages/charlas.md`), añade esta línea:
   ```liquid
   {% include event_gallery.liquid folder="2027-mi-nuevo-evento" title="Título de Mi Galería" %}
   ```
4. Haz `git commit` y `git push`. Las fotos aparecerán solas con efectos hover y zoom.

---

## 💻 Proyectos e Hipervínculos a GitHub

Los proyectos se encuentran en la carpeta `_projects/`:
- `1_proyecto.md`: Asistente visual con IA (Infomatrix).
- `2_proyecto.md`: NASA Space Apps Challenge (Calidad del aire y Exoplanetas).
- `3_proyecto.md`: Robótica y Sistemas de Control (TMR / Silla de ruedas).
- `4_proyecto.md`: Bloom (iOS Native App / Apple Swift Challenge).
- `5_galaxyae.md`: GalaxyAE y MaNGA-DESOM (Astrofísica y Deep Learning).
- `6_deep_learning_repo.md`: Deep Learning & Topological Manifolds.
- `7_computacion_cuantica.md`: Quantum Computing (Algoritmos y cuadernos Qiskit).

### Cómo agregar botones directos a tus repositorios:
En el contenido Markdown de cualquier proyecto o página, puedes usar la clase `.btn-repo`:
```html
<div class="action-links">
  <a class="btn-repo" href="https://github.com/AngelGab3/Tu-Repositorio" target="_blank" rel="noopener">
    <i class="fa-brands fa-github"></i> Ver Código en GitHub
  </a>
</div>
```

---

## 📄 Estructura de Páginas y Contenido

| Archivo | Qué contiene |
| :--- | :--- |
| `_pages/about.md` | Portada principal, biografía bilingüe, honores/premios destacados, badges de tecnologías y enlaces directos. |
| `_pages/investigaciones.md` | Investigación en galaxias SMGs con Deep Learning y física experimental (Efecto Faraday). |
| `_pages/charlas.md` | Conferencias (Planetario, SMF) y talleres impartidos (Cuántica UDLAP, Noche de las Estrellas). |
| `_pages/lectures.md` | Cursos formales: *Deep Learning: A Mathematical and Physical Approach*. |
| `_pages/certificados.md` | Cuadrícula con tus 7 certificaciones (UNAM, Boulder, Packt, HKUST, Cisco, ETS TOEFL). |
| `_pages/voluntariado.md` | Soporte técnico en congresos (IMAV & MEXCIR). |
| `_pages/cv.md` | Visor interactivo y botones de descarga de `assets/pdf/cv.pdf`. |
| `_pages/galeria.md` | Vista centralizada de todas las galerías fotográficas de eventos (`/galeria/`). |
| `_data/cv.yml` | Base de datos estructurada con tu currículum completo. |
| `_data/repositories.yml` | Lista de tus repositorios públicos destacados de GitHub. |
| `_data/socials.yml` | Enlaces a tus redes (LinkedIn, GitHub, correo). |
| `_config.yml` | Configuración global del sitio (título, descripción, temas). |

---

## 🔄 Flujo de Trabajo y Publicación con Git

Cada vez que agregues fotos, modifiques texto o crees un proyecto:

```bash
# 1. Asegúrate de estar en la rama main
git status

# 2. Agrega los archivos modificados o nuevas fotos
git add .

# 3. Guarda el cambio con un mensaje descriptivo
git commit -m "Actualizar fotos del evento del planetario y proyectos"

# 4. Sube los cambios a GitHub
git push origin main
```

**¿Qué pasa después?**
1. GitHub detecta el `push` y arranca automáticamente el flujo de **GitHub Actions** (`.github/workflows/deploy.yml`).
2. Compila el sitio con Jekyll y publica los archivos en la rama `gh-pages`.
3. En 2 a 3 minutos, tu sitio se actualiza en: **https://AngelGab3.github.io**
