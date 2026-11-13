(function () {
  var lang = "es";
  try {
    var stored = localStorage.getItem("site-lang");
    if (stored === "en" || stored === "es") {
      lang = stored;
    }
  } catch (e) {}

  document.documentElement.setAttribute("data-lang", lang);
  document.documentElement.setAttribute("lang", lang);

  var NAV_TRANSLATIONS = {
    "/": { es: "Inicio", en: "Home" },
    "/proyectos/": { es: "Proyectos", en: "Projects" },
    "/investigaciones/": { es: "Investigaciones", en: "Research" },
    "/lectures/": { es: "Lectures", en: "Lectures" },
    "/platicas-talleres/": { es: "Pláticas y Talleres", en: "Talks & Outreach" },
    "/certificados/": { es: "Certificados", en: "Certifications" },
    "/galeria/": { es: "Galería", en: "Gallery" },
    "/voluntariado/": { es: "Voluntariado", en: "Volunteering" },
    "/cv/": { es: "CV", en: "CV" },
  };

  var PAGE_HEADER_TRANSLATIONS = {
    "/proyectos/": {
      title: { es: "Proyectos", en: "Projects" },
      desc: {
        es: "Proyectos en física computacional, inteligencia artificial, robótica y desarrollo de software.",
        en: "Projects in computational physics, artificial intelligence, robotics, and software development.",
      },
    },
    "/investigaciones/": {
      title: { es: "Investigaciones", en: "Research" },
      desc: {
        es: "Física computacional, astrofísica observacional y física experimental.",
        en: "Computational physics, observational astrophysics, and experimental physics.",
      },
    },
    "/lectures/": {
      title: { es: "Lectures", en: "Lectures" },
      desc: {
        es: "Cursos y series de conferencias especializadas que he diseñado e impartido.",
        en: "Specialized courses and lecture series designed and delivered.",
      },
    },
    "/platicas-talleres/": {
      title: { es: "Pláticas y Talleres", en: "Talks & Outreach" },
      desc: {
        es: "Ponencias, divulgación científica y talleres impartidos.",
        en: "Talks, science outreach, and delivered workshops.",
      },
    },
    "/certificados/": {
      title: { es: "Certificados", en: "Certifications" },
      desc: {
        es: "Educación continua, escuelas científicas y certificaciones profesionales.",
        en: "Extended education, scientific schools, and professional certifications.",
      },
    },
    "/galeria/": {
      title: { es: "Galería de Eventos", en: "Event Gallery" },
      desc: {
        es: "Registro fotográfico de congresos, conferencias, talleres y competencias.",
        en: "Photographic archive of conferences, talks, workshops, and competitions.",
      },
    },
    "/voluntariado/": {
      title: { es: "Voluntariado", en: "Volunteering" },
      desc: {
        es: "Participación como staff técnico y voluntario en congresos internacionales y eventos científicos.",
        en: "Volunteering and technical staff at international conferences and scientific events.",
      },
    },
    "/cv/": {
      title: { es: "CV", en: "Curriculum Vitae" },
      desc: {
        es: "Currículum Vitae académico de Ángel Gabriel Munguía Velázquez.",
        en: "Academic Curriculum Vitae of Ángel Gabriel Munguía Velázquez.",
      },
    },
  };

  function normalizePath(href) {
    try {
      var u = new URL(href, window.location.origin);
      var p = u.pathname;
      if (!p.endsWith("/")) p += "/";
      return p;
    } catch (e) {
      return href;
    }
  }

  function applyLanguageToUI(activeLang) {
    var navLinks = document.querySelectorAll("#navbarNav .nav-link[href]");
    navLinks.forEach(function (link) {
      var p = normalizePath(link.getAttribute("href"));
      var entry = NAV_TRANSLATIONS[p];
      if (!entry) return;
      var text = entry[activeLang] || entry.es;
      var srSpan = link.querySelector(".sr-only");
      link.textContent = text + " ";
      if (srSpan) {
        link.appendChild(srSpan);
      }
    });

    var currentPath = normalizePath(window.location.pathname);
    var headerData = PAGE_HEADER_TRANSLATIONS[currentPath];
    if (headerData) {
      var titleEl = document.querySelector(".post-header h1.post-title");
      var descEl = document.querySelector(".post-header p.post-description");
      if (titleEl && headerData.title[activeLang]) {
        titleEl.textContent = headerData.title[activeLang];
      }
      if (descEl && headerData.desc[activeLang]) {
        descEl.textContent = headerData.desc[activeLang];
      }
    }
  }

  function labelFor(l) {
    return l === "en" ? "ES" : "EN";
  }

  function insertLanguageButton() {
    var currentLang = document.documentElement.getAttribute("data-lang") || "es";
    applyLanguageToUI(currentLang);

    var themeBtn = document.getElementById("light-toggle");
    if (!themeBtn || document.getElementById("lang-toggle")) return;

    var btn = document.createElement("button");
    btn.id = "lang-toggle";
    btn.type = "button";
    btn.title = "Cambiar idioma / Change language";
    btn.setAttribute("aria-label", "Cambiar idioma / Change language");
    btn.textContent = labelFor(currentLang);

    btn.addEventListener("click", function () {
      var next = document.documentElement.getAttribute("data-lang") === "en" ? "es" : "en";
      document.documentElement.setAttribute("data-lang", next);
      document.documentElement.setAttribute("lang", next);
      try {
        localStorage.setItem("site-lang", next);
      } catch (e) {}
      btn.textContent = labelFor(next);
      applyLanguageToUI(next);
    });

    themeBtn.parentNode.insertBefore(btn, themeBtn);
  }

  async function initPhotoSwipeGalleries() {
    var galleries = document.querySelectorAll(".pswp-gallery");
    if (!galleries.length) return;
    try {
      var mod = await import("https://cdn.jsdelivr.net/npm/photoswipe@5.4.4/dist/photoswipe-lightbox.esm.min.js");
      var PhotoSwipeLightbox = mod.default;
      var lightbox = new PhotoSwipeLightbox({
        gallery: ".pswp-gallery",
        children: "a.justified-item",
        pswpModule: function () {
          return import("https://cdn.jsdelivr.net/npm/photoswipe@5.4.4/dist/photoswipe.esm.min.js");
        },
        bgOpacity: 0.92,
        padding: { top: 24, bottom: 56, left: 16, right: 16 },
      });
      lightbox.on("uiRegister", function () {
        lightbox.pswp.ui.registerElement({
          name: "custom-caption",
          order: 9,
          isButton: false,
          appendTo: "root",
          html: "",
          onInit: function (el, pswp) {
            el.className = "pswp-custom-caption";
            pswp.on("change", function () {
              var curr = pswp.currSlide;
              var trigger = curr && curr.data && curr.data.element;
              var activeLang = document.documentElement.getAttribute("data-lang") || "es";
              var caption = "";
              if (trigger) {
                caption =
                  (activeLang === "en" ? trigger.getAttribute("data-caption-en") : trigger.getAttribute("data-caption-es")) ||
                  trigger.getAttribute("data-caption-es") ||
                  "";
              }
              el.textContent = "";
              if (caption) {
                var inner = document.createElement("div");
                inner.className = "pswp-custom-caption-inner";
                inner.textContent = caption;
                el.appendChild(inner);
              }
            });
          },
        });
      });
      lightbox.init();
    } catch (e) {}
  }

  function onReady() {
    insertLanguageButton();
    initPhotoSwipeGalleries();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }
})();
