---
layout: page
title: Redes Neuronales Difractivas (D²NN) — Óptica Computacional
title_es: Redes Neuronales Difractivas (D²NN)
title_en: Diffractive Deep Neural Networks (D²NN)
description: Simulación óptica en el visible con espectro angular de banda limitada y retropropagación por cálculo de Wirtinger.
description_es: Reproducción numérica y análisis teórico de redes neuronales ópticas de solo fase mediante espectro angular de banda limitada (Rayleigh–Sommerfeld) y cálculo de Wirtinger.
description_en: Numerical reproduction and theoretical analysis of visible-wavelength phase-only diffractive neural networks via band-limited angular spectrum propagation and Wirtinger calculus.
importance: 2
category: Física Computacional
category_es: Física Computacional
category_en: Computational Physics
github: https://github.com/AngelGab3/Final_Project_Optics_Difractive_Neural_Networks
sim: diffraction
bento_span: 5
formula: "U(z) = ℱ⁻¹{ H_BL(u,v;z) · ℱ{U₀·e^{iΦ}} }"
tags:
  - Fourier Optics
  - PyTorch
  - Wirtinger
  - LaTeX
---

<div class="lang lang-es" markdown="1">

Reproducción numérica, validación física y desarrollo teórico completo de **Redes Neuronales Difractivas ($\text{D}^2\text{NN}$) en el visible**, basado en Chen et al. (_Engineering_ 7, 2021) como proyecto final de Óptica:

- **Propagación escalar de Fourier:** Implementación mediante la integral de **Rayleigh–Sommerfeld** y el **espectro angular de banda limitada** (Matsushima &amp; Shimobaba, 2009) para evitar _aliasing_ en campo cercano.
- **Escalamiento por número de Fresnel neuronal:** Análisis del criterio de conectividad total ($D_{\min} \equiv z_c$) y equivalencia óptica controlada por $N_{F,n} = d_f^2 / (\lambda D)$.
- **Validación numérica rigurosa:** Comparación contra soluciones analíticas de Fresnel en apertura cuadrada (**&lt; 0.04% error máximo**) y campo exacto en eje de Rayleigh–Sommerfeld.
- **Entrenamiento y documentación formal:** Optimización de máscaras de **solo fase** ($\Phi \in [0,\pi]$) mediante gradientes complejos (**cálculo de Wirtinger**), acompañada de tesina completa en **LaTeX** y presentación interactiva.

<div class="action-links">
  <a class="btn-repo" href="https://github.com/AngelGab3/Final_Project_Optics_Difractive_Neural_Networks" target="_blank" rel="noopener">
    <i class="fa-brands fa-github"></i> Repositorio D²NN en GitHub
  </a>
</div>

<div class="tech-pills">
  <span class="tech-pill">Fourier Optics</span>
  <span class="tech-pill">Band-Limited Angular Spectrum</span>
  <span class="tech-pill">Wirtinger Calculus</span>
  <span class="tech-pill">PyTorch / Python</span>
  <span class="tech-pill">LaTeX</span>
</div>

</div>

<div class="lang lang-en" markdown="1">

Numerical reproduction, physical validation, and full theoretical derivation of **Visible-Wavelength Diffractive Deep Neural Networks ($\text{D}^2\text{NN}$)**, based on Chen et al. (_Engineering_ 7, 2021):

- **Scalar Fourier propagation:** Implemented with the **Rayleigh–Sommerfeld** diffraction integral and **band-limited angular spectrum** (Matsushima &amp; Shimobaba, 2009) to eliminate aliasing in near-field propagation.
- **Neuron Fresnel-number scaling:** Proved that the full-connectivity condition ($D_{\min} \equiv z_c$) matches the angular spectrum sampling limit, governed by $N_{F,n} = d_f^2 / (\lambda D)$.
- **Numerical propagator validation:** Verified against analytical Fresnel integrals on square apertures (**&lt; 0.04% max error**) and exact on-axis Rayleigh–Sommerfeld solutions.
- **Training &amp; formal write-up:** Backpropagation through complex diffraction layers using **Wirtinger calculus** over phase-only masks ($\Phi \in [0,\pi]$), documented in a full **LaTeX** thesis and interactive presentation.

<div class="action-links">
  <a class="btn-repo" href="https://github.com/AngelGab3/Final_Project_Optics_Difractive_Neural_Networks" target="_blank" rel="noopener">
    <i class="fa-brands fa-github"></i> D²NN Repo on GitHub
  </a>
</div>

<div class="tech-pills">
  <span class="tech-pill">Fourier Optics</span>
  <span class="tech-pill">Band-Limited Angular Spectrum</span>
  <span class="tech-pill">Wirtinger Calculus</span>
  <span class="tech-pill">PyTorch / Python</span>
  <span class="tech-pill">LaTeX</span>
</div>

</div>
