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

  var reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  function prefersReducedMotion() {
    return reducedMotionQuery.matches;
  }

  var finePointerQuery = window.matchMedia("(pointer: fine)");
  function isFinePointer() {
    return finePointerQuery.matches;
  }

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
        es: "Proyectos en física computacional, computación cuántica, geometría de la información, simulaciones numéricas, IA y robótica.",
        en: "Projects in computational physics, quantum computing, information geometry, numerical simulations, AI, and robotics.",
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
    "/projects/gota-poblana/": {
      title: {
        es: "Gota Poblana — Control Adaptativo de pH y Cloración",
        en: "Gota Poblana — Adaptive pH Water Control",
      },
      desc: {
        es: "Monitoreo y dosificación adaptativa de pH para maximizar la eficacia del cloro (HOCl) con ESP32-S3, Flutter, MQTT y simulador determinista de firmware. 2.º lugar Hackatón Puebla 2026.",
        en: "Adaptive pH monitoring and dosing to maximize active chlorine (HOCl) efficacy with ESP32-S3, Flutter, MQTT/WebSocket, and a deterministic firmware simulator. 2nd place Hackatón Puebla 2026.",
      },
    },
    "/projects/diffractive-neural-networks/": {
      title: {
        es: "Redes Neuronales Difractivas (D²NN) — Óptica Computacional",
        en: "Diffractive Deep Neural Networks (D²NN)",
      },
      desc: {
        es: "Reproducción numérica y análisis teórico de redes neuronales ópticas de solo fase mediante espectro angular de banda limitada (Rayleigh–Sommerfeld) y cálculo de Wirtinger.",
        en: "Numerical reproduction and theoretical analysis of visible-wavelength phase-only diffractive neural networks via band-limited angular spectrum propagation and Wirtinger calculus.",
      },
    },
    "/projects/geometry-and-physics/": {
      title: {
        es: "Geometría Diferencial, Topología y Física Matemática",
        en: "Differential Geometry, Topology & Symplectic Physics",
      },
      desc: {
        es: "Desarrollo formal en LaTeX de geometría visual, tensor métrico riemanniano, cálculo exterior de Cartan, cohomología física y mecánica simpléctica.",
        en: "Formal LaTeX notes bridging vector calculus with differential forms, Cartan moving frames, Riemannian metric tensors, physical topology, and symplectic mechanics.",
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

  var onLanguageChangedCallbacks = [];

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
      onLanguageChangedCallbacks.forEach(function (cb) {
        try {
          cb(next);
        } catch (err) {}
      });
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

  /* =========================================================================
   * SPOTLIGHT CURSOR GLOW ON CARDS
   * ========================================================================= */
  function initSpotlight() {
    if (!isFinePointer()) return;
    var cards = document.querySelectorAll(".cv-entry, .cert-card, .bento-card, .hero-stat, .event-cover-card");
    cards.forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", e.clientX - r.left + "px");
        card.style.setProperty("--my", e.clientY - r.top + "px");
      });
      card.addEventListener("pointerleave", function () {
        card.style.setProperty("--mx", "-999px");
        card.style.setProperty("--my", "-999px");
      });
    });
  }

  /* =========================================================================
   * 3D PERSPECTIVE TILT ON PROFILE & BENTO CARDS
   * ========================================================================= */
  function attachTilt(el, maxDeg) {
    if (!el || !isFinePointer() || prefersReducedMotion()) return;
    el.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      var nx = (e.clientX - r.left) / r.width - 0.5;
      var ny = (e.clientY - r.top) / r.height - 0.5;
      var rx = (-ny * maxDeg * 2).toFixed(2);
      var ry = (nx * maxDeg * 2).toFixed(2);
      el.style.transform = "perspective(900px) rotateX(" + rx + "deg) rotateY(" + ry + "deg) translateY(-2px)";
    });
    el.addEventListener("pointerleave", function () {
      el.style.transform = "";
    });
  }

  function initProfileAndCardTilt() {
    var profileFig = document.querySelector(".post .profile figure");
    attachTilt(profileFig, 5.5);

    var bentoCards = document.querySelectorAll(".bento-card");
    bentoCards.forEach(function (card) {
      attachTilt(card, 2.2);
    });
  }

  /* =========================================================================
   * ANIMATED METRIC COUNTERS
   * ========================================================================= */
  function animateCounter(el) {
    if (!el || el.getAttribute("data-counted") === "1") return;
    if (el.offsetParent === null) return;
    var target = parseFloat(el.getAttribute("data-count-target"));
    if (isNaN(target)) return;
    var decimals = parseInt(el.getAttribute("data-count-decimals") || "0", 10);
    el.setAttribute("data-counted", "1");

    if (prefersReducedMotion()) {
      el.textContent = target.toFixed(decimals);
      return;
    }

    var duration = 660;
    var start = performance.now();
    function tick(now) {
      var p = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = val.toFixed(decimals);
      if (p < 1) {
        window.requestAnimationFrame(tick);
      } else {
        el.textContent = target.toFixed(decimals);
      }
    }
    window.requestAnimationFrame(tick);
  }

  function initCounters() {
    var counters = document.querySelectorAll(".count-num[data-count-target]");
    if (!counters.length) return;

    function checkVisibleCounters() {
      counters.forEach(function (el) {
        if (el.offsetParent === null) return;
        var rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight + 40 && rect.bottom > -40) {
          animateCounter(el);
        }
      });
    }

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      counters.forEach(function (c) {
        io.observe(c);
      });
    } else {
      checkVisibleCounters();
    }

    onLanguageChangedCallbacks.push(function () {
      window.setTimeout(checkVisibleCounters, 20);
    });
  }

  /* =========================================================================
   * STAGGERED SCROLL REVEAL
   * ========================================================================= */
  function initScrollReveals() {
    var targets = document.querySelectorAll(
      ".cv-entry, .cert-card, .bento-card, .hero-stat, .event-cover-card, h2.category, .post article h3, .event-section-header"
    );
    if (!targets.length) return;

    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    document.documentElement.classList.add("motion-ready");

    targets.forEach(function (el, idx) {
      el.classList.add("reveal-item");
      var delay = (idx % 4) * 65;
      el.style.setProperty("--reveal-delay", delay + "ms");
    });

    function revealVisibleItems(instant) {
      var vh = window.innerHeight || 800;
      targets.forEach(function (el) {
        if (el.offsetParent === null) return;
        var r = el.getBoundingClientRect();
        if (r.top <= vh + 140) {
          if (instant) {
            el.classList.add("is-instant");
            el.style.setProperty("--reveal-delay", "0ms");
          }
          el.classList.add("is-visible");
        }
      });
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.01, rootMargin: "0px 0px 100px 0px" }
    );

    targets.forEach(function (el) {
      io.observe(el);
    });

    var scrollRaf = 0;
    function scheduleRevealCheck() {
      if (scrollRaf) return;
      scrollRaf = window.requestAnimationFrame(function () {
        scrollRaf = 0;
        revealVisibleItems(false);
      });
    }

    window.addEventListener("scroll", scheduleRevealCheck, { passive: true });
    window.addEventListener("resize", scheduleRevealCheck, { passive: true });

    revealVisibleItems(false);
    window.setTimeout(function () {
      revealVisibleItems(false);
    }, 900);

    onLanguageChangedCallbacks.push(function () {
      revealVisibleItems(true);
      targets.forEach(function (el) {
        if (!el.classList.contains("is-visible")) {
          io.observe(el);
        }
      });
    });

    initScrollReveals.refresh = function () {
      revealVisibleItems(true);
    };
  }

  /* =========================================================================
   * NAVBAR GLASS STATE & MAGNETIC BUTTONS
   * ========================================================================= */
  function initNavbarAndMagnetics() {
    function updateScrollState() {
      document.documentElement.classList.toggle("is-scrolled", window.scrollY > 16);
    }
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });

    if (!isFinePointer() || prefersReducedMotion()) return;
    var magneticButtons = document.querySelectorAll(".btn-repo, .cv-download-btn, .bento-filter-btn");
    magneticButtons.forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var dx = ((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * 4;
        var dy = ((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * 3;
        btn.style.transform = "translate3d(" + dx.toFixed(1) + "px, " + dy.toFixed(1) + "px, 0)";
      });
      btn.addEventListener("pointerleave", function () {
        btn.style.transform = "";
      });
    });
  }

  /* =========================================================================
   * BENTO CATEGORY FILTERS
   * ========================================================================= */
  function initBentoFilters() {
    var filterButtons = document.querySelectorAll(".bento-filter-btn[data-filter]");
    var sections = document.querySelectorAll("[data-bento-section]");
    if (!filterButtons.length || !sections.length) return;

    function applyFilter(slug) {
      filterButtons.forEach(function (btn) {
        var active = btn.getAttribute("data-filter") === slug;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", active ? "true" : "false");
      });

      sections.forEach(function (sec) {
        var secSlug = sec.getAttribute("data-bento-section");
        var show = slug === "all" || secSlug === slug;
        sec.hidden = !show;
        sec.style.display = show ? "" : "none";
      });

      if (typeof initScrollReveals.refresh === "function") {
        window.requestAnimationFrame(initScrollReveals.refresh);
      }
    }

    filterButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyFilter(btn.getAttribute("data-filter") || "all");
      });
    });
  }

  /* =========================================================================
   * CIRCULAR VIEW TRANSITION ON THEME TOGGLE
   * ========================================================================= */
  function initThemeReveal() {
    var themeBtn = document.getElementById("light-toggle");
    if (!themeBtn) return;
    if (typeof document.startViewTransition !== "function") return;
    if (typeof toggleThemeSetting !== "function") return;

    themeBtn.addEventListener(
      "click",
      function (e) {
        if (prefersReducedMotion()) return;
        e.preventDefault();
        e.stopImmediatePropagation();

        var rect = themeBtn.getBoundingClientRect();
        var x = rect.left + rect.width / 2;
        var y = rect.top + rect.height / 2;
        var endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

        document.documentElement.classList.add("theme-transitioning");
        var vt = document.startViewTransition(function () {
          toggleThemeSetting();
        });

        vt.ready
          .then(function () {
            document.documentElement.animate(
              {
                clipPath: ["circle(0px at " + x + "px " + y + "px)", "circle(" + endRadius + "px at " + x + "px " + y + "px)"],
              },
              {
                duration: 500,
                easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                pseudoElement: "::view-transition-new(root)",
              }
            );
          })
          .catch(function () {});

        vt.finished.finally(function () {
          document.documentElement.classList.remove("theme-transitioning");
        });
      },
      true
    );
  }

  function onReady() {
    insertLanguageButton();
    initPhotoSwipeGalleries();
    initThemeReveal();
    initNavbarAndMagnetics();
    initSpotlight();
    initProfileAndCardTilt();
    initCounters();
    initScrollReveals();
    initBentoFilters();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }
})();
