# Guía para publicar tu portafolio (Ángel Munguía)

Tu portafolio ya está personalizado con al-folio. Sigue estos pasos una sola vez
para publicarlo. GitHub se encarga de "compilar" el sitio; tú no instalas nada.

## 1. Crea el repositorio
1. Entra a https://github.com/new (con tu cuenta **AngelGab3**).
2. En **Repository name** escribe EXACTAMENTE: `AngelGab3.github.io`
3. Ponlo **Public** y crea el repo (sin README).

## 2. Sube estos archivos al repo
Opción con Git (recomendada, ya usas GitHub):
```bash
# dentro de la carpeta que descomprimiste (portafolio-angel)
git init
git add .
git commit -m "Mi portafolio"
git branch -M main
git remote add origin https://github.com/AngelGab3/AngelGab3.github.io.git
git push -u origin main
```

## 3. Activa GitHub Pages
1. En el repo: **Settings → Pages**.
2. En **Build and deployment → Source**, elige **Deploy from a branch**.
3. En **Branch** selecciona **`gh-pages`** y carpeta **`/ (root)`**. Guarda.
   - Nota: la rama `gh-pages` aparece sola tras el primer despliegue (paso 4).

## 4. Espera el despliegue
- Ve a la pestaña **Actions** del repo. Verás correr "Deploy site" (2–4 min).
- Cuando termine, tu sitio estará en: **https://AngelGab3.github.io**

Cada vez que hagas cambios y hagas `git push`, el sitio se actualiza solo.

---

## Cómo editar tu contenido
Todo se edita con archivos de texto. Los principales:

- **Tu bio y portada:** `_pages/about.md`
- **Tu foto:** reemplaza `assets/img/prof_pic.jpg` con tu foto (mismo nombre).
- **Proyectos:** carpeta `_projects/`. Copia `1_proyecto.md` como `2_proyecto.md`, etc.
- **Investigaciones:** `_pages/investigaciones.md`
- **Certificados:** `_pages/certificados.md`
- **Pláticas:** `_pages/charlas.md`
- **Talleres:** `_pages/talleres.md`
- **Redes (GitHub/LinkedIn):** `_data/socials.yml`
- **Nombre, título, idioma:** `_config.yml`

Consejo: puedes editar cualquier archivo directo en GitHub (botón del lápiz) sin
usar tu compu. Al guardar, el sitio se reconstruye solo.

## Notas
- Tu LinkedIn ya está configurado. Si el ícono no lleva bien al enlace por los
  acentos, en `_data/socials.yml` puedes cambiar `linkedin_username` por la
  versión sin acentos de tu URL.
- Cuando tengas publicaciones formales, se puede activar la página automática de
  "Publications" (formato BibTeX). Por ahora usamos la sección Investigaciones.
