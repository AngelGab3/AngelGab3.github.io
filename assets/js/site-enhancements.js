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
    "/projects/infomatrix-visual-assistant/": {
      title: { es: "Asistente visual con IA — Infomatrix", en: "AI Visual Assistant — Infomatrix" },
      desc: {
        es: "Asistente visual con IA para personas con discapacidad visual (LLMs multimodales, YOLO y Arduino UNO Q). Medalla de Oro Internacional.",
        en: "AI visual assistant for the visually impaired (multimodal LLMs, YOLO, and Arduino UNO Q). International Gold Medal.",
      },
    },
    "/projects/nasa-space-apps/": {
      title: { es: "NASA Space Apps Challenge", en: "NASA Space Apps Challenge" },
      desc: {
        es: "Núcleo predictivo de calidad del aire (LSTM, XGBoost y LLMs) en 2025 y visualización estelar en Swift iOS en 2024.",
        en: "Predictive air quality core (LSTM, XGBoost, and LLMs) in 2025 and real-time star mapping in Swift iOS in 2024.",
      },
    },
    "/projects/tmr-robotics-control/": {
      title: { es: "Robótica y Sistemas de Control — TMR", en: "Robotics & Control Systems — TMR" },
      desc: {
        es: "Diseño de hardware y sistemas de control para robots autónomos en el Torneo Mexicano de Robótica (PCBs con ESP32).",
        en: "Hardware and control systems engineering for autonomous robots at the Mexican Robotics Tournament (custom ESP32 PCBs).",
      },
    },
    "/projects/ios-swift-challenge/": {
      title: {
        es: "Desarrollo Nativo iOS — Apple Swift Challenge & iOS Lab",
        en: "Native iOS Development — Apple Swift Challenge & iOS Lab",
      },
      desc: {
        es: "Aplicaciones nativas en Swift y SwiftUI; Finalista Nacional (5.º lugar regional) en iOS Development Lab.",
        en: "Native iOS applications in Swift and SwiftUI; National Finalist (5th regional place) at iOS Development Lab.",
      },
    },
    "/projects/galaxyae-manga-desom/": {
      title: {
        es: "GalaxyAE & MaNGA-DESOM — Astrofísica y Deep Learning",
        en: "GalaxyAE & MaNGA-DESOM — Computational Astrophysics",
      },
      desc: {
        es: "Tuberías computacionales para agrupamiento de galaxias por sus espectros mediante Autoencoders y DESOM.",
        en: "Computational astrophysics pipelines for spectroscopic galaxy clustering using Autoencoders and DESOM.",
      },
    },
    "/projects/deep-learning-manifolds/": {
      title: { es: "Deep Learning & Variedades Topológicas", en: "Deep Learning & Topological Manifolds" },
      desc: {
        es: "Aprendizaje no supervisado de representaciones y mapeo geométrico en datos físicos y astrofísicos.",
        en: "Unsupervised representation learning and manifold mapping implementations for astrophysical and physical datasets.",
      },
    },
    "/projects/quantum-computing/": {
      title: {
        es: "Computación Cuántica — Implementaciones y Notas",
        en: "Quantum Computing — Implementations & Notes",
      },
      desc: {
        es: "Algoritmos cuánticos, compuertas unitarias, simulación en esfera de Bloch y cuadernos en Qiskit.",
        en: "Qiskit notebooks, quantum gates, circuit simulation, and mathematical derivations of quantum algorithms.",
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
