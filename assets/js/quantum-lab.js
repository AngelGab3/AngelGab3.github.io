(function () {
  "use strict";

  var REDUCED_MOTION_QUERY = window.matchMedia("(prefers-reduced-motion: reduce)");
  var prefersReducedMotion = REDUCED_MOTION_QUERY.matches;
  if (typeof REDUCED_MOTION_QUERY.addEventListener === "function") {
    REDUCED_MOTION_QUERY.addEventListener("change", function (e) {
      prefersReducedMotion = e.matches;
    });
  }

  function isDarkTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark";
  }

  function getPalette(forceDark) {
    var dark = typeof forceDark === "boolean" ? forceDark : isDarkTheme();
    if (dark) {
      return {
        dark: true,
        violet: "#a78bfa",
        violetDeep: "#7c3aed",
        cyan: "#22d3ee",
        indigo: "#818cf8",
        pink: "#f472b6",
        emerald: "#34d399",
        amber: "#fbbf24",
        grid: "rgba(167, 139, 250, 0.14)",
        axis: "rgba(226, 232, 240, 0.25)",
        text: "rgba(226, 232, 240, 0.78)",
        mutedText: "rgba(148, 163, 184, 0.65)",
        glowViolet: "rgba(139, 92, 246, 0.45)",
        glowCyan: "rgba(34, 211, 238, 0.42)",
      };
    }
    return {
      dark: false,
      violet: "#6d28d9",
      violetDeep: "#5b21b6",
      cyan: "#0891b2",
      indigo: "#4f46e5",
      pink: "#db2777",
      emerald: "#059669",
      amber: "#d97706",
      grid: "rgba(109, 40, 217, 0.12)",
      axis: "rgba(30, 41, 59, 0.22)",
      text: "rgba(30, 41, 59, 0.84)",
      mutedText: "rgba(71, 85, 105, 0.72)",
      glowViolet: "rgba(109, 40, 217, 0.28)",
      glowCyan: "rgba(8, 145, 178, 0.26)",
    };
  }

  function project3D(x, y, z, yaw, pitch, cx, cy, scale, fov) {
    var cosY = Math.cos(yaw);
    var sinY = Math.sin(yaw);
    var x1 = x * cosY - z * sinY;
    var z1 = x * sinY + z * cosY;

    var cosP = Math.cos(pitch);
    var sinP = Math.sin(pitch);
    var y2 = y * cosP - z1 * sinP;
    var z2 = y * sinP + z1 * cosP;

    var dist = fov || 5.2;
    var s = dist / Math.max(0.8, dist - z2);
    return {
      x: cx + x1 * scale * s,
      y: cy - y2 * scale * s,
      z: z2,
      s: s,
    };
  }

  function resizeCanvas(canvas, ctx) {
    var rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.round(rect.width * dpr);
    var h = Math.round(rect.height * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { width: rect.width, height: rect.height };
  }

  /* =========================================================================
   * HOMEPAGE INTERACTIVE HERO STAGE
   * ========================================================================= */
  function createHeroStage() {
    var post = document.querySelector(".post");
    var postHeader = document.querySelector(".post > .post-header");
    var profile = document.querySelector(".post .profile");
    if (!post || !postHeader || !profile) return null;

    if (document.getElementById("quantum-hero-canvas")) return null;

    post.classList.add("has-quantum-hero");

    var backdrop = document.createElement("div");
    backdrop.className = "quantum-hero-backdrop";
    backdrop.setAttribute("aria-hidden", "true");

    var canvas = document.createElement("canvas");
    canvas.id = "quantum-hero-canvas";
    backdrop.appendChild(canvas);
    post.insertBefore(backdrop, post.firstChild);

    var hud = document.createElement("div");
    hud.className = "quantum-hud";
    hud.innerHTML =
      '<div class="quantum-hud-modes" role="group" aria-label="Simulation mode">' +
      '<button type="button" class="quantum-mode-btn is-active" data-qmode="manifold" aria-pressed="true">' +
      '<span class="q-dot"></span>' +
      '<span class="lang-es">Variedad Fisher–Rao</span>' +
      '<span class="lang-en">Fisher–Rao Manifold</span>' +
      "</button>" +
      '<button type="button" class="quantum-mode-btn" data-qmode="bloch" aria-pressed="false">' +
      '<span class="q-dot"></span>' +
      '<span class="lang-es">Esfera de Bloch |ψ⟩</span>' +
      '<span class="lang-en">Bloch Sphere |ψ⟩</span>' +
      "</button>" +
      '<button type="button" class="quantum-mode-btn" data-qmode="symplectic" aria-pressed="false">' +
      '<span class="q-dot"></span>' +
      '<span class="lang-es">Flujo Simpléctico</span>' +
      '<span class="lang-en">Symplectic Flow</span>' +
      "</button>" +
      "</div>" +
      '<div class="quantum-hud-telemetry" aria-live="off"><i>ds</i><sup>2</sup> = <i>g</i><sub>ij</sub> <i>dθ</i><sup>i</sup> <i>dθ</i><sup>j</sup> · κ = +0.42</div>';

    postHeader.appendChild(hud);

    var ctx = canvas.getContext("2d");
    if (!ctx) return null;

    var telemetryEl = hud.querySelector(".quantum-hud-telemetry");
    var modeButtons = hud.querySelectorAll(".quantum-mode-btn");
    var state = {
      mode: "manifold",
      pointerX: 0.5,
      pointerY: 0.45,
      smoothX: 0.5,
      smoothY: 0.45,
      hovering: false,
      lastTelemetryAt: 0,
      blochTrail: [],
      symplecticParticles: [],
    };

    for (var i = 0; i < 38; i++) {
      state.symplecticParticles.push({
        x: (Math.random() - 0.5) * 2.4,
        y: (Math.random() - 0.5) * 2.4,
        z: (Math.random() - 0.5) * 1.8,
        trail: [],
      });
    }

    modeButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var nextMode = btn.getAttribute("data-qmode");
        if (!nextMode || nextMode === state.mode) return;
        state.mode = nextMode;
        state.blochTrail = [];
        modeButtons.forEach(function (b) {
          var active = b === btn;
          b.classList.toggle("is-active", active);
          b.setAttribute("aria-pressed", active ? "true" : "false");
        });
        state.lastTelemetryAt = 0;
        if (prefersReducedMotion) {
          draw(performance.now());
        }
      });
    });

    post.addEventListener("pointermove", function (e) {
      var r = backdrop.getBoundingClientRect();
      if (!r.width || !r.height) return;
      state.pointerX = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      state.pointerY = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
      state.hovering = true;
    });

    post.addEventListener("pointerleave", function () {
      state.hovering = false;
    });

    function drawManifoldHero(w, h, t, p) {
      var cx = w * (w > 860 ? 0.68 : 0.54);
      var cy = h * 0.52;
      var scale = Math.min(w, h) * 0.25;
      var yaw = 0.55 + Math.sin(t * 0.22) * 0.25 + (state.smoothX - 0.5) * 0.55;
      var pitch = 0.62 + (state.smoothY - 0.5) * 0.35;

      var N = 22;
      var pts = [];
      var uCursor = (state.smoothX - 0.5) * 2.8;
      var vCursor = (state.smoothY - 0.5) * 2.8;

      for (var i = 0; i <= N; i++) {
        pts[i] = [];
        var u = -1.7 + (3.4 * i) / N;
        for (var j = 0; j <= N; j++) {
          var v = -1.7 + (3.4 * j) / N;
          var r2 = u * u + v * v;
          var rippleDist = Math.hypot(u - uCursor, v - vCursor);
          var cursorPeak = state.hovering ? 0.34 * Math.exp(-rippleDist * 1.4) * Math.cos(rippleDist * 4 - t * 3.5) : 0;
          var z = 0.52 * Math.cos(Math.sqrt(r2) * 2.4 - t * 1.15) * Math.exp(-0.24 * r2) + 0.22 * (u * u - v * v) * Math.sin(t * 0.45) + cursorPeak;
          pts[i][j] = project3D(u, z, v, yaw, pitch, cx, cy, scale, 6.2);
        }
      }

      ctx.lineWidth = 1;
      for (var ui = 0; ui <= N; ui++) {
        ctx.beginPath();
        for (var vj = 0; vj <= N; vj++) {
          var pt = pts[ui][vj];
          if (vj === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.strokeStyle = p.dark ? "rgba(167, 139, 250, " + (0.06 + (ui / N) * 0.11) + ")" : "rgba(109, 40, 217, " + (0.045 + (ui / N) * 0.08) + ")";
        ctx.stroke();
      }

      for (var vj2 = 0; vj2 <= N; vj2++) {
        ctx.beginPath();
        for (var ui2 = 0; ui2 <= N; ui2++) {
          var pt2 = pts[ui2][vj2];
          if (ui2 === 0) ctx.moveTo(pt2.x, pt2.y);
          else ctx.lineTo(pt2.x, pt2.y);
        }
        ctx.strokeStyle = p.dark ? "rgba(34, 211, 238, " + (0.05 + (vj2 / N) * 0.1) + ")" : "rgba(8, 145, 178, " + (0.04 + (vj2 / N) * 0.075) + ")";
        ctx.stroke();
      }

      // Highlighted geodesic trajectories along the manifold
      for (var g = 0; g < 3; g++) {
        var phase = t * 0.7 + g * 2.1;
        ctx.beginPath();
        for (var step = 0; step <= 40; step++) {
          var s = step / 40;
          var ang = phase + s * 2.8;
          var rad = 0.35 + s * 1.15;
          var gu = rad * Math.cos(ang);
          var gv = rad * Math.sin(ang);
          var gr2 = gu * gu + gv * gv;
          var gz = 0.52 * Math.cos(Math.sqrt(gr2) * 2.4 - t * 1.15) * Math.exp(-0.24 * gr2) + 0.22 * (gu * gu - gv * gv) * Math.sin(t * 0.45);
          var gp = project3D(gu, gz, gv, yaw, pitch, cx, cy, scale, 6.2);
          if (step === 0) ctx.moveTo(gp.x, gp.y);
          else ctx.lineTo(gp.x, gp.y);
        }
        ctx.strokeStyle = g === 1 ? p.cyan : p.violet;
        ctx.globalAlpha = p.dark ? 0.55 : 0.34;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      var kappa = (0.42 * Math.cos(t * 1.15) + (state.smoothX - 0.5) * 0.3).toFixed(2);
      var t1 = ((state.smoothX - 0.5) * 2.0).toFixed(2);
      var t2 = ((state.smoothY - 0.5) * 2.0).toFixed(2);
      return (
        "<i>ds</i><sup>2</sup> = <i>g</i><sub>ij</sub> <i>dθ</i><sup>i</sup> <i>dθ</i><sup>j</sup> · κ = " +
        (Number(kappa) >= 0 ? "+" : "") +
        kappa +
        " | θ = (" +
        t1 +
        ", " +
        t2 +
        ")"
      );
    }

    function drawBlochHero(w, h, t, p) {
      var cx = w * (w > 860 ? 0.62 : 0.5);
      var cy = h * 0.52;
      var radius = Math.min(w, h) * 0.3;
      var yaw = t * 0.28 + (state.smoothX - 0.5) * 1.4;
      var pitch = 0.36 + (state.smoothY - 0.5) * 0.8;

      // Subtle background phase interference arcs
      ctx.lineWidth = 1;
      for (var wv = 0; wv < 4; wv++) {
        ctx.beginPath();
        for (var x = 0; x <= w; x += 24) {
          var yy = h * 0.52 + Math.sin(x * 0.011 + t * (1 + wv * 0.25) + wv) * (28 + wv * 14);
          if (x === 0) ctx.moveTo(x, yy);
          else ctx.lineTo(x, yy);
        }
        ctx.strokeStyle = p.dark ? "rgba(139, 92, 246, 0.07)" : "rgba(109, 40, 217, 0.06)";
        ctx.stroke();
      }

      // Latitude & longitude rings
      var rings = [-0.55, 0, 0.55];
      rings.forEach(function (lat) {
        var rLat = Math.sqrt(Math.max(0, 1 - lat * lat));
        ctx.beginPath();
        for (var k = 0; k <= 48; k++) {
          var a = (k / 48) * Math.PI * 2;
          var pt = project3D(rLat * Math.cos(a), lat, rLat * Math.sin(a), yaw, pitch, cx, cy, radius, 5.5);
          if (k === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.strokeStyle = lat === 0 ? (p.dark ? "rgba(34, 211, 238, 0.34)" : "rgba(8, 145, 178, 0.32)") : p.grid;
        ctx.lineWidth = lat === 0 ? 1.4 : 1;
        ctx.stroke();
      });

      for (var m = 0; m < 4; m++) {
        var phiM = (m * Math.PI) / 4;
        ctx.beginPath();
        for (var k2 = 0; k2 <= 48; k2++) {
          var th = (k2 / 48) * Math.PI * 2;
          var ptM = project3D(Math.sin(th) * Math.cos(phiM), Math.cos(th), Math.sin(th) * Math.sin(phiM), yaw, pitch, cx, cy, radius, 5.5);
          if (k2 === 0) ctx.moveTo(ptM.x, ptM.y);
          else ctx.lineTo(ptM.x, ptM.y);
        }
        ctx.strokeStyle = p.grid;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Basis axes |0>, |1>, |+>, |i>
      var poles = [
        { pos: [0, 1.18, 0], label: "|0⟩" },
        { pos: [0, -1.18, 0], label: "|1⟩" },
        { pos: [1.22, 0, 0], label: "|+⟩" },
        { pos: [0, 0, 1.22], label: "|i⟩" },
      ];
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillStyle = p.text;
      poles.forEach(function (pl) {
        var pp = project3D(pl.pos[0], pl.pos[1], pl.pos[2], yaw, pitch, cx, cy, radius, 5.5);
        ctx.fillText(pl.label, pp.x + 5, pp.y + 4);
      });

      // State vector |psi>
      var theta = Math.PI * 0.44 + Math.sin(t * 0.85) * 0.42 + (state.smoothY - 0.5) * 0.6;
      var phi = t * 1.45 + (state.smoothX - 0.5) * 2.2;
      var sx = Math.sin(theta) * Math.cos(phi);
      var sy = Math.cos(theta);
      var sz = Math.sin(theta) * Math.sin(phi);

      if (!prefersReducedMotion) {
        state.blochTrail.push([sx, sy, sz]);
        if (state.blochTrail.length > 52) state.blochTrail.shift();
      }

      if (state.blochTrail.length > 2) {
        for (var ti = 1; ti < state.blochTrail.length; ti++) {
          var a0 = project3D(state.blochTrail[ti - 1][0], state.blochTrail[ti - 1][1], state.blochTrail[ti - 1][2], yaw, pitch, cx, cy, radius, 5.5);
          var a1 = project3D(state.blochTrail[ti][0], state.blochTrail[ti][1], state.blochTrail[ti][2], yaw, pitch, cx, cy, radius, 5.5);
          ctx.beginPath();
          ctx.moveTo(a0.x, a0.y);
          ctx.lineTo(a1.x, a1.y);
          ctx.strokeStyle = p.cyan;
          ctx.globalAlpha = (ti / state.blochTrail.length) * 0.55;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      var origin = project3D(0, 0, 0, yaw, pitch, cx, cy, radius, 5.5);
      var tip = project3D(sx, sy, sz, yaw, pitch, cx, cy, radius, 5.5);
      ctx.beginPath();
      ctx.moveTo(origin.x, origin.y);
      ctx.lineTo(tip.x, tip.y);
      ctx.strokeStyle = p.violet;
      ctx.lineWidth = 2.6;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(tip.x, tip.y, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = p.cyan;
      ctx.fill();

      var c0 = Math.cos(theta / 2).toFixed(2);
      var c1 = Math.sin(theta / 2).toFixed(2);
      var phiMod = (((phi % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)).toFixed(2);
      var zExp = Math.cos(theta).toFixed(2);
      return "|ψ⟩ = " + c0 + "|0⟩ + " + c1 + " <i>e</i><sup><i>i</i>·" + phiMod + "</sup>|1⟩ · ⟨<i>Z</i>⟩ = " + (Number(zExp) >= 0 ? "+" : "") + zExp;
    }

    function stepSymplectic(pt, dt, t) {
      // Coupled 3D Hamiltonian / double-well symplectic oscillator field
      function deriv(x, y, z) {
        var r2 = x * x + y * y + 0.35;
        return {
          dx: y + 0.25 * Math.sin(z + t * 0.4),
          dy: -x + 0.65 * x * Math.exp(-0.4 * r2) - 0.15 * y * z,
          dz: 0.45 * Math.sin(x * 1.4 - y * 1.1) - 0.18 * z,
        };
      }
      var k1 = deriv(pt.x, pt.y, pt.z);
      var k2 = deriv(pt.x + 0.5 * dt * k1.dx, pt.y + 0.5 * dt * k1.dy, pt.z + 0.5 * dt * k1.dz);
      var k3 = deriv(pt.x + 0.5 * dt * k2.dx, pt.y + 0.5 * dt * k2.dy, pt.z + 0.5 * dt * k2.dz);
      var k4 = deriv(pt.x + dt * k3.dx, pt.y + dt * k3.dy, pt.z + dt * k3.dz);

      pt.x += (dt / 6) * (k1.dx + 2 * k2.dx + 2 * k3.dx + k4.dx);
      pt.y += (dt / 6) * (k1.dy + 2 * k2.dy + 2 * k3.dy + k4.dy);
      pt.z += (dt / 6) * (k1.dz + 2 * k2.dz + 2 * k3.dz + k4.dz);

      if (Math.abs(pt.x) > 3.2 || Math.abs(pt.y) > 3.2) {
        pt.x = (Math.random() - 0.5) * 1.8;
        pt.y = (Math.random() - 0.5) * 1.8;
        pt.z = (Math.random() - 0.5) * 1.2;
        pt.trail = [];
      }
    }

    function drawSymplecticHero(w, h, t, p) {
      var cx = w * 0.55;
      var cy = h * 0.52;
      var scale = Math.min(w, h) * 0.26;
      var yaw = t * 0.18 + (state.smoothX - 0.5) * 0.9;
      var pitch = 0.42 + (state.smoothY - 0.5) * 0.5;

      // Subtle phase-space contour rings
      for (var c = 1; c <= 4; c++) {
        ctx.beginPath();
        for (var k = 0; k <= 48; k++) {
          var a = (k / 48) * Math.PI * 2;
          var r = c * 0.48;
          var pt = project3D(r * Math.cos(a), r * Math.sin(a) * 0.72, Math.sin(a * 2 + t) * 0.2, yaw, pitch, cx, cy, scale, 5.8);
          if (k === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.strokeStyle = p.grid;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      var dt = 0.022;
      for (var idx = 0; idx < state.symplecticParticles.length; idx++) {
        var sp = state.symplecticParticles[idx];
        if (!prefersReducedMotion) {
          stepSymplectic(sp, dt, t);
          sp.trail.push([sp.x, sp.y, sp.z]);
          if (sp.trail.length > 26) sp.trail.shift();
        } else if (sp.trail.length === 0) {
          for (var warm = 0; warm < 20; warm++) {
            stepSymplectic(sp, dt, t);
            sp.trail.push([sp.x, sp.y, sp.z]);
          }
        }

        if (sp.trail.length > 1) {
          ctx.beginPath();
          for (var s = 0; s < sp.trail.length; s++) {
            var pr = project3D(sp.trail[s][0], sp.trail[s][1], sp.trail[s][2], yaw, pitch, cx, cy, scale, 5.8);
            if (s === 0) ctx.moveTo(pr.x, pr.y);
            else ctx.lineTo(pr.x, pr.y);
          }
          ctx.strokeStyle = idx % 2 === 0 ? p.violet : p.cyan;
          ctx.globalAlpha = 0.34;
          ctx.lineWidth = 1.4;
          ctx.stroke();
          ctx.globalAlpha = 1;

          var head = sp.trail[sp.trail.length - 1];
          var hp = project3D(head[0], head[1], head[2], yaw, pitch, cx, cy, scale, 5.8);
          ctx.beginPath();
          ctx.arc(hp.x, hp.y, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = idx % 2 === 0 ? p.cyan : p.violet;
          ctx.fill();
        }
      }

      var H = (1.42 + 0.35 * Math.sin(t * 0.6) + (state.smoothX - 0.5) * 0.2).toFixed(3);
      return "ω = <i>dp</i> ∧ <i>dq</i> · RK4 Δ<i>t</i> = 0.022 | <i>H</i>(<i>q</i>,<i>p</i>) = " + H;
    }

    function draw(now) {
      var size = resizeCanvas(canvas, ctx);
      if (!size) return;

      state.smoothX += (state.pointerX - state.smoothX) * 0.08;
      state.smoothY += (state.pointerY - state.smoothY) * 0.08;

      ctx.clearRect(0, 0, size.width, size.height);
      var p = getPalette();
      var t = now * 0.001;
      var telemetryHtml = "";

      if (state.mode === "bloch") {
        telemetryHtml = drawBlochHero(size.width, size.height, t, p);
      } else if (state.mode === "symplectic") {
        telemetryHtml = drawSymplecticHero(size.width, size.height, t, p);
      } else {
        telemetryHtml = drawManifoldHero(size.width, size.height, t, p);
      }

      if (telemetryEl && now - state.lastTelemetryAt > 110) {
        telemetryEl.innerHTML = telemetryHtml;
        state.lastTelemetryAt = now;
      }
    }

    return {
      canvas: canvas,
      draw: draw,
      isVisible: true,
    };
  }

  /* =========================================================================
   * BENTO PROJECT MINI-SIMULATIONS (10 bespoke computational canvases)
   * ========================================================================= */
  var SIM_RENDERERS = {
    bloch: function (ctx, w, h, t, p, st) {
      var cx = w * 0.54;
      var cy = h * 0.52;
      var r = Math.min(w, h) * 0.35;
      var yaw = t * 0.45 + (st.hx - 0.5) * 1.4;
      var pitch = 0.38 + (st.hy - 0.5) * 0.8;

      // Outer phase ring
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.18, 0, Math.PI * 2);
      ctx.strokeStyle = p.grid;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Wireframe sphere equator + 2 meridians
      ctx.beginPath();
      for (var k = 0; k <= 40; k++) {
        var a = (k / 40) * Math.PI * 2;
        var pt = project3D(Math.cos(a), 0, Math.sin(a), yaw, pitch, cx, cy, r, 4.8);
        if (k === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = p.cyan;
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = 1.3;
      ctx.stroke();
      ctx.globalAlpha = 1;

      for (var m = 0; m < 3; m++) {
        var pm = (m * Math.PI) / 3;
        ctx.beginPath();
        for (var j = 0; j <= 36; j++) {
          var th = (j / 36) * Math.PI * 2;
          var ptM = project3D(Math.sin(th) * Math.cos(pm), Math.cos(th), Math.sin(th) * Math.sin(pm), yaw, pitch, cx, cy, r, 4.8);
          if (j === 0) ctx.moveTo(ptM.x, ptM.y);
          else ctx.lineTo(ptM.x, ptM.y);
        }
        ctx.strokeStyle = p.grid;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Poles
      var p0 = project3D(0, 1.16, 0, yaw, pitch, cx, cy, r, 4.8);
      var p1 = project3D(0, -1.16, 0, yaw, pitch, cx, cy, r, 4.8);
      ctx.font = '600 10px "JetBrains Mono", monospace';
      ctx.fillStyle = p.text;
      ctx.fillText("|0⟩", p0.x - 10, p0.y - 2);
      ctx.fillText("|1⟩", p1.x - 10, p1.y + 8);

      // State vector
      var theta = 0.8 + 0.55 * Math.sin(t * 1.1) + (st.hy - 0.5) * 0.6;
      var phi = t * 1.7 + (st.hx - 0.5) * 1.8;
      var sx = Math.sin(theta) * Math.cos(phi);
      var sy = Math.cos(theta);
      var sz = Math.sin(theta) * Math.sin(phi);

      if (!st.trail) st.trail = [];
      if (!prefersReducedMotion) {
        st.trail.push([sx, sy, sz]);
        if (st.trail.length > 28) st.trail.shift();
      }
      if (st.trail.length > 1) {
        ctx.beginPath();
        for (var i = 0; i < st.trail.length; i++) {
          var tp = project3D(st.trail[i][0], st.trail[i][1], st.trail[i][2], yaw, pitch, cx, cy, r, 4.8);
          if (i === 0) ctx.moveTo(tp.x, tp.y);
          else ctx.lineTo(tp.x, tp.y);
        }
        ctx.strokeStyle = p.cyan;
        ctx.lineWidth = 1.6;
        ctx.globalAlpha = 0.55;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      var org = project3D(0, 0, 0, yaw, pitch, cx, cy, r, 4.8);
      var tip = project3D(sx, sy, sz, yaw, pitch, cx, cy, r, 4.8);
      ctx.beginPath();
      ctx.moveTo(org.x, org.y);
      ctx.lineTo(tip.x, tip.y);
      ctx.strokeStyle = p.violet;
      ctx.lineWidth = 2.4;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(tip.x, tip.y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = p.cyan;
      ctx.fill();
    },

    diffraction: function (ctx, w, h, t, p, st) {
      // 3 Diffractive Phase Mask planes + coherent wavefront rays + detector intensity curve
      var layers = [0.22, 0.45, 0.68];
      var detX = w * 0.87;
      var srcX = w * 0.09;
      var nodesPerLayer = 5;
      var targetY = h * (0.28 + st.hy * 0.44);

      // Draw diffracting rays between planes
      for (var l = 0; l < layers.length; l++) {
        var xA = w * layers[l];
        var xB = l < layers.length - 1 ? w * layers[l + 1] : detX;
        for (var i = 0; i < nodesPerLayer; i++) {
          var yA = h * (0.2 + (0.6 * i) / (nodesPerLayer - 1));
          for (var j = 0; j < nodesPerLayer; j++) {
            var yB = l < layers.length - 1 ? h * (0.2 + (0.6 * j) / (nodesPerLayer - 1)) : targetY + (j - 2) * 14;
            var phase = Math.sin(t * 2.2 - l * 0.9 + (i + j) * 0.5);
            ctx.beginPath();
            ctx.moveTo(xA, yA);
            ctx.lineTo(xB, yB);
            ctx.strokeStyle = phase > 0 ? p.cyan : p.violet;
            ctx.globalAlpha = 0.08 + Math.max(0, phase) * 0.22;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      // Incoming wave from source
      for (var s = 0; s < nodesPerLayer; s++) {
        var yS = h * (0.2 + (0.6 * s) / (nodesPerLayer - 1));
        ctx.beginPath();
        ctx.moveTo(srcX, h * 0.5);
        ctx.lineTo(w * layers[0], yS);
        ctx.strokeStyle = p.violet;
        ctx.globalAlpha = 0.28;
        ctx.lineWidth = 1.1;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Phase masks Φ_k
      layers.forEach(function (lx, li) {
        var x = w * lx;
        for (var k = 0; k < 12; k++) {
          var py = h * 0.16 + k * ((h * 0.68) / 12);
          var ph = 0.5 + 0.5 * Math.sin(t * 1.8 + k * 0.7 + li * 1.3);
          ctx.fillStyle = ph > 0.5 ? p.violet : p.cyan;
          ctx.globalAlpha = 0.35 + ph * 0.55;
          ctx.fillRect(x - 2, py, 4, (h * 0.68) / 14);
        }
      });
      ctx.globalAlpha = 1;

      // Intensity peak at detector plane
      ctx.beginPath();
      for (var y = h * 0.14; y <= h * 0.86; y += 2) {
        var dy = (y - targetY) / (h * 0.09);
        var amp = Math.exp(-dy * dy) * (24 + Math.sin(t * 2) * 3);
        var px = detX - amp;
        if (y === h * 0.14) ctx.moveTo(detX, y);
        ctx.lineTo(px, y);
      }
      ctx.strokeStyle = p.cyan;
      ctx.lineWidth = 2;
      ctx.stroke();
    },

    "som-galaxy": function (ctx, w, h, t, p, st) {
      if (!st.galaxies) {
        st.galaxies = [];
        for (var i = 0; i < 48; i++) {
          var cluster = i % 3;
          var cx = cluster === 0 ? 0.32 : cluster === 1 ? 0.68 : 0.52;
          var cy = cluster === 0 ? 0.42 : cluster === 1 ? 0.48 : 0.72;
          st.galaxies.push({
            x: cx + (Math.random() - 0.5) * 0.24,
            y: cy + (Math.random() - 0.5) * 0.24,
            c: cluster,
            r: 1.8 + Math.random() * 2.2,
          });
        }
      }
      // Galaxy scatter points
      st.galaxies.forEach(function (g, idx) {
        var gx = g.x * w + Math.sin(t * 0.6 + idx) * 2;
        var gy = g.y * h + Math.cos(t * 0.5 + idx) * 2;
        ctx.beginPath();
        ctx.arc(gx, gy, g.r, 0, Math.PI * 2);
        ctx.fillStyle = g.c === 0 ? p.violet : g.c === 1 ? p.cyan : p.amber;
        ctx.globalAlpha = 0.7;
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Elastic DESOM 6x6 grid adapting over clusters
      var G = 6;
      var gridPts = [];
      for (var i = 0; i < G; i++) {
        gridPts[i] = [];
        for (var j = 0; j < G; j++) {
          var u = i / (G - 1);
          var v = j / (G - 1);
          var dx = (u - 0.5) * 0.58;
          var dy = (v - 0.5) * 0.58;
          var warp = 0.045 * Math.sin(u * Math.PI * 2 + t * 1.1) * Math.cos(v * Math.PI * 2 - t * 0.8);
          var pullX = (st.hx - 0.5) * 0.08 * st.hover;
          var pullY = (st.hy - 0.5) * 0.08 * st.hover;
          gridPts[i][j] = {
            x: (0.5 + dx + warp + pullX) * w,
            y: (0.52 + dy - warp + pullY) * h,
          };
        }
      }
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = p.cyan;
      ctx.globalAlpha = 0.55;
      for (var i2 = 0; i2 < G; i2++) {
        ctx.beginPath();
        for (var j2 = 0; j2 < G; j2++) {
          if (j2 === 0) ctx.moveTo(gridPts[i2][j2].x, gridPts[i2][j2].y);
          else ctx.lineTo(gridPts[i2][j2].x, gridPts[i2][j2].y);
        }
        ctx.stroke();

        ctx.beginPath();
        for (var j3 = 0; j3 < G; j3++) {
          if (j3 === 0) ctx.moveTo(gridPts[j3][i2].x, gridPts[j3][i2].y);
          else ctx.lineTo(gridPts[j3][i2].x, gridPts[j3][i2].y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    },

    manifold: function (ctx, w, h, t, p, st) {
      var cx = w * 0.52;
      var cy = h * 0.54;
      var sc = Math.min(w, h) * 0.29;
      var yaw = 0.6 + t * 0.25 + (st.hx - 0.5) * 0.8;
      var pitch = 0.65 + (st.hy - 0.5) * 0.4;
      var N = 12;
      var pts = [];
      for (var i = 0; i <= N; i++) {
        pts[i] = [];
        var u = -1.2 + (2.4 * i) / N;
        for (var j = 0; j <= N; j++) {
          var v = -1.2 + (2.4 * j) / N;
          var z = 0.42 * (u * u - v * v) * Math.cos(t * 0.7) + 0.35 * Math.sin(u * 2.1 + t) * Math.cos(v * 2.1);
          pts[i][j] = project3D(u, z, v, yaw, pitch, cx, cy, sc, 5);
        }
      }
      ctx.lineWidth = 1;
      for (var a = 0; a <= N; a++) {
        ctx.beginPath();
        for (var b = 0; b <= N; b++) {
          if (b === 0) ctx.moveTo(pts[a][b].x, pts[a][b].y);
          else ctx.lineTo(pts[a][b].x, pts[a][b].y);
        }
        ctx.strokeStyle = p.violet;
        ctx.globalAlpha = 0.42;
        ctx.stroke();

        ctx.beginPath();
        for (var b2 = 0; b2 <= N; b2++) {
          if (b2 === 0) ctx.moveTo(pts[b2][a].x, pts[b2][a].y);
          else ctx.lineTo(pts[b2][a].x, pts[b2][a].y);
        }
        ctx.strokeStyle = p.cyan;
        ctx.globalAlpha = 0.36;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    },

    "vision-scan": function (ctx, w, h, t, p, st) {
      // Laser scan sweep + YOLO detection reticles
      var sweepX = ((t * 0.28) % 1) * w;
      var grad = ctx.createLinearGradient(sweepX - 36, 0, sweepX + 4, 0);
      grad.addColorStop(0, "transparent");
      grad.addColorStop(1, p.glowCyan);
      ctx.fillStyle = grad;
      ctx.fillRect(sweepX - 36, 0, 40, h);

      ctx.beginPath();
      ctx.moveTo(sweepX, 0);
      ctx.lineTo(sweepX, h);
      ctx.strokeStyle = p.cyan;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      var boxes = [
        { x: w * 0.18, y: h * 0.24, bw: w * 0.24, bh: h * 0.5, label: "OBJ 0.97", color: p.cyan },
        { x: w * 0.53 + (st.hx - 0.5) * 14, y: h * 0.3 + (st.hy - 0.5) * 10, bw: w * 0.26, bh: h * 0.44, label: "PATH 0.94", color: p.violet },
      ];
      ctx.font = '600 9.5px "JetBrains Mono", monospace';
      boxes.forEach(function (b) {
        var cl = 10;
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(b.x, b.y + cl);
        ctx.lineTo(b.x, b.y);
        ctx.lineTo(b.x + cl, b.y);
        ctx.moveTo(b.x + b.bw - cl, b.y);
        ctx.lineTo(b.x + b.bw, b.y);
        ctx.lineTo(b.x + b.bw, b.y + cl);
        ctx.moveTo(b.x, b.y + b.bh - cl);
        ctx.lineTo(b.x, b.y + b.bh);
        ctx.lineTo(b.x + cl, b.y + b.bh);
        ctx.moveTo(b.x + b.bw - cl, b.y + b.bh);
        ctx.lineTo(b.x + b.bw, b.y + b.bh);
        ctx.lineTo(b.x + b.bw, b.y + b.bh - cl);
        ctx.stroke();

        ctx.fillStyle = b.color;
        ctx.fillText(b.label, b.x + 4, b.y - 5);
      });
    },

    "orbital-forecast": function (ctx, w, h, t, p) {
      // Confidence band + LSTM multi-harmonic time-series wave + satellite arc
      ctx.beginPath();
      for (var x = 0; x <= w; x += 6) {
        var nx = x / w;
        var yBase = h * 0.56 + Math.sin(nx * 9 - t * 2.1) * h * 0.14 + Math.cos(nx * 4 + t) * h * 0.06;
        var band = 10 + nx * 16;
        if (x === 0) ctx.moveTo(x, yBase - band);
        else ctx.lineTo(x, yBase - band);
      }
      for (var x2 = w; x2 >= 0; x2 -= 6) {
        var nx2 = x2 / w;
        var yBase2 = h * 0.56 + Math.sin(nx2 * 9 - t * 2.1) * h * 0.14 + Math.cos(nx2 * 4 + t) * h * 0.06;
        var band2 = 10 + nx2 * 16;
        ctx.lineTo(x2, yBase2 + band2);
      }
      ctx.closePath();
      ctx.fillStyle = p.dark ? "rgba(139, 92, 246, 0.14)" : "rgba(109, 40, 217, 0.11)";
      ctx.fill();

      ctx.beginPath();
      for (var x3 = 0; x3 <= w; x3 += 5) {
        var nx3 = x3 / w;
        var y3 = h * 0.56 + Math.sin(nx3 * 9 - t * 2.1) * h * 0.14 + Math.cos(nx3 * 4 + t) * h * 0.06;
        if (x3 === 0) ctx.moveTo(x3, y3);
        else ctx.lineTo(x3, y3);
      }
      ctx.strokeStyle = p.cyan;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Orbiting point
      var ox = w * (0.2 + 0.6 * ((t * 0.25) % 1));
      var oy = h * 0.22 + Math.sin((ox / w) * Math.PI) * -14;
      ctx.beginPath();
      ctx.arc(ox, oy, 3.8, 0, Math.PI * 2);
      ctx.fillStyle = p.violet;
      ctx.fill();
    },

    "latent-flow": function (ctx, w, h, t, p, st) {
      // Loss contours + natural gradient trajectories
      var tx = w * (0.58 + (st.hx - 0.5) * 0.16);
      var ty = h * (0.5 + (st.hy - 0.5) * 0.16);

      for (var r = 1; r <= 5; r++) {
        ctx.beginPath();
        ctx.ellipse(tx, ty, r * 28, r * 17, -0.32, 0, Math.PI * 2);
        ctx.strokeStyle = p.grid;
        ctx.lineWidth = 1.1;
        ctx.stroke();
      }

      for (var k = 0; k < 5; k++) {
        var a0 = (k / 5) * Math.PI * 2 + 0.4;
        ctx.beginPath();
        for (var s = 0; s <= 28; s++) {
          var u = s / 28;
          var rad = (1 - u) * Math.min(w, h) * 0.44;
          var ang = a0 + u * 1.85 + Math.sin(t * 0.8 + k) * 0.15;
          var px = tx + Math.cos(ang) * rad * 1.25;
          var py = ty + Math.sin(ang) * rad * 0.72;
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = k % 2 === 0 ? p.violet : p.cyan;
        ctx.lineWidth = 1.6;
        ctx.globalAlpha = 0.78;
        ctx.stroke();

        var pulseU = (t * 0.45 + k * 0.2) % 1;
        var pRad = (1 - pulseU) * Math.min(w, h) * 0.44;
        var pAng = a0 + pulseU * 1.85 + Math.sin(t * 0.8 + k) * 0.15;
        ctx.beginPath();
        ctx.arc(tx + Math.cos(pAng) * pRad * 1.25, ty + Math.sin(pAng) * pRad * 0.72, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = p.cyan;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    },

    "hocl-control": function (ctx, w, h, t, p) {
      // NOM-127 compliance zone (pH 6.5 - 8.5 mapped onto x: [0.22, 0.76])
      var xMin = w * 0.24;
      var xMax = w * 0.76;
      ctx.fillStyle = p.dark ? "rgba(52, 211, 153, 0.08)" : "rgba(5, 150, 105, 0.08)";
      ctx.fillRect(xMin, h * 0.14, xMax - xMin, h * 0.72);

      // Sigmoid HOCl efficacy curve: alpha = 1 / (1 + 10^(pH - 7.54))
      ctx.beginPath();
      for (var x = w * 0.08; x <= w * 0.92; x += 4) {
        var ph = 5.5 + ((x - w * 0.08) / (w * 0.84)) * 4.0;
        var alpha = 1 / (1 + Math.pow(10, ph - 7.54));
        var y = h * 0.82 - alpha * h * 0.62;
        if (x === w * 0.08) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = p.cyan;
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Animated adaptive operating point converging toward pH 6.65
      var cycle = (t * 0.32) % 1;
      var curPh = 8.4 - 1.75 * (1 - Math.exp(-3.4 * cycle));
      var curAlpha = 1 / (1 + Math.pow(10, curPh - 7.54));
      var px = w * 0.08 + ((curPh - 5.5) / 4.0) * (w * 0.84);
      var py = h * 0.82 - curAlpha * h * 0.62;

      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fillStyle = p.emerald;
      ctx.fill();

      ctx.font = '600 9.5px "JetBrains Mono", monospace';
      ctx.fillStyle = p.text;
      ctx.fillText("pH " + curPh.toFixed(2) + " → " + Math.round(curAlpha * 100) + "% HOCl", w * 0.48, h * 0.24);
    },

    "pcb-signal": function (ctx, w, h, t, p) {
      // Orthogonal PCB traces + ESP32 chip + PID pulse wave
      var chipX = w * 0.5;
      var chipY = h * 0.48;
      var traces = [
        [
          [w * 0.08, h * 0.3],
          [w * 0.3, h * 0.3],
          [chipX - 18, chipY - 8],
        ],
        [
          [w * 0.08, h * 0.68],
          [w * 0.28, h * 0.68],
          [chipX - 18, chipY + 8],
        ],
        [
          [chipX + 18, chipY - 8],
          [w * 0.72, h * 0.28],
          [w * 0.92, h * 0.28],
        ],
        [
          [chipX + 18, chipY + 8],
          [w * 0.72, h * 0.7],
          [w * 0.92, h * 0.7],
        ],
      ];

      traces.forEach(function (tr, idx) {
        ctx.beginPath();
        ctx.moveTo(tr[0][0], tr[0][1]);
        ctx.lineTo(tr[1][0], tr[1][1]);
        ctx.lineTo(tr[2][0], tr[2][1]);
        ctx.strokeStyle = p.grid;
        ctx.lineWidth = 1.6;
        ctx.stroke();

        var u = (t * 0.7 + idx * 0.25) % 1;
        var seg = u < 0.5 ? u * 2 : (u - 0.5) * 2;
        var p0 = u < 0.5 ? tr[0] : tr[1];
        var p1 = u < 0.5 ? tr[1] : tr[2];
        var px = p0[0] + (p1[0] - p0[0]) * seg;
        var py = p0[1] + (p1[1] - p0[1]) * seg;
        ctx.beginPath();
        ctx.arc(px, py, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = idx % 2 === 0 ? p.cyan : p.violet;
        ctx.fill();
      });

      ctx.strokeStyle = p.violet;
      ctx.lineWidth = 1.8;
      ctx.strokeRect(chipX - 18, chipY - 18, 36, 36);
      ctx.font = '600 8.5px "JetBrains Mono", monospace';
      ctx.fillStyle = p.text;
      ctx.fillText("ESP32", chipX - 13, chipY + 3);
    },

    "swift-orbit": function (ctx, w, h, t, p, st) {
      var cx = w * 0.5;
      var cy = h * 0.52;
      for (var i = 1; i <= 4; i++) {
        var rx = i * (Math.min(w, h) * 0.22);
        var ry = i * (Math.min(w, h) * 0.13);
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0.22 * i + (st.hx - 0.5) * 0.3, 0, Math.PI * 2);
        ctx.strokeStyle = i % 2 === 0 ? p.cyan : p.violet;
        ctx.globalAlpha = 0.28 + i * 0.08;
        ctx.lineWidth = 1.4;
        ctx.stroke();

        var ang = t * (0.9 - i * 0.12) + i * 1.4;
        var px = cx + Math.cos(ang) * rx;
        var py = cy + Math.sin(ang) * ry;
        ctx.beginPath();
        ctx.arc(px, py, 3.4, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? p.violet : p.cyan;
        ctx.globalAlpha = 0.9;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    },
  };

  function collectBentoCanvases() {
    var nodes = document.querySelectorAll("canvas.project-sim-canvas");
    var entries = [];
    nodes.forEach(function (canvas) {
      var ctx = canvas.getContext("2d");
      if (!ctx) return;
      var type = canvas.getAttribute("data-sim") || "manifold";
      var card = canvas.closest("[data-sim-card]") || canvas.parentElement;
      var entry = {
        canvas: canvas,
        ctx: ctx,
        type: type,
        isVisible: false,
        hx: 0.5,
        hy: 0.5,
        hover: 0,
        targetHover: 0,
      };
      if (card) {
        card.addEventListener("pointermove", function (e) {
          var r = card.getBoundingClientRect();
          if (!r.width || !r.height) return;
          entry.hx = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
          entry.hy = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
          entry.targetHover = 1;
        });
        card.addEventListener("pointerleave", function () {
          entry.targetHover = 0;
        });
      }
      entries.push(entry);
    });
    return entries;
  }

  function initQuantumLab() {
    var heroStage = createHeroStage();
    var bentoEntries = collectBentoCanvases();
    if (!heroStage && !bentoEntries.length) return;

    if (bentoEntries.length && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (items) {
          items.forEach(function (item) {
            for (var i = 0; i < bentoEntries.length; i++) {
              if (bentoEntries[i].canvas === item.target) {
                bentoEntries[i].isVisible = item.isIntersecting;
                if (item.isIntersecting && prefersReducedMotion) {
                  renderAll(performance.now());
                }
              }
            }
          });
        },
        { rootMargin: "120px" }
      );
      bentoEntries.forEach(function (entry) {
        io.observe(entry.canvas);
      });
    } else {
      bentoEntries.forEach(function (entry) {
        entry.isVisible = true;
      });
    }

    if (heroStage && "IntersectionObserver" in window) {
      var heroIo = new IntersectionObserver(
        function (items) {
          if (items[0]) {
            heroStage.isVisible = items[0].isIntersecting;
          }
        },
        { rootMargin: "150px" }
      );
      heroIo.observe(heroStage.canvas);
    }

    function renderAll(now) {
      var p = getPalette();
      var t = now * 0.001;
      if (heroStage && heroStage.isVisible) {
        heroStage.draw(now);
      }
      for (var i = 0; i < bentoEntries.length; i++) {
        var entry = bentoEntries[i];
        if (!entry.isVisible) continue;
        var sz = resizeCanvas(entry.canvas, entry.ctx);
        if (!sz) continue;
        entry.hover += (entry.targetHover - entry.hover) * 0.12;
        entry.ctx.clearRect(0, 0, sz.width, sz.height);
        var renderer = SIM_RENDERERS[entry.type] || SIM_RENDERERS.manifold;
        renderer(entry.ctx, sz.width, sz.height, t, p, entry);
      }
    }

    var rafId = 0;
    function tick(now) {
      if (!document.hidden) {
        renderAll(now);
      }
      if (!prefersReducedMotion) {
        rafId = window.requestAnimationFrame(tick);
      }
    }

    // Re-render on theme change even when reduced motion is enabled
    var mo = new MutationObserver(function () {
      renderAll(performance.now());
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    window.addEventListener("resize", function () {
      if (prefersReducedMotion) renderAll(performance.now());
    });

    if (prefersReducedMotion) {
      renderAll(performance.now());
    } else {
      rafId = window.requestAnimationFrame(tick);
    }

    document.addEventListener("visibilitychange", function () {
      if (!document.hidden && !prefersReducedMotion && !rafId) {
        rafId = window.requestAnimationFrame(tick);
      } else if (document.hidden && rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initQuantumLab);
  } else {
    initQuantumLab();
  }
})();
