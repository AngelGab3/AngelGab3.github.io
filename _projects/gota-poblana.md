---
layout: page
title: Gota Poblana — Control Adaptativo de pH y Cloración
title_es: Gota Poblana — Control Adaptativo de pH
title_en: Gota Poblana — Adaptive pH Water Control
description: Control adaptativo de pH con ESP32-S3, app Flutter y simulador físico (2.º lugar Hackatón Puebla 2026).
description_es: Monitoreo y dosificación adaptativa de pH para maximizar la eficacia del cloro (HOCl) con ESP32-S3, Flutter, MQTT y simulador determinista de firmware. 2.º lugar Hackatón Puebla 2026.
description_en: Adaptive pH monitoring and dosing to maximize active chlorine (HOCl) efficacy with ESP32-S3, Flutter, MQTT/WebSocket, and a deterministic firmware simulator. 2nd place Hackatón Puebla 2026.
importance: 1
category: Robótica y Hardware
category_es: Robótica y Hardware
category_en: Robotics & Hardware
github: https://github.com/RoshTzsche/gota_poblana
sim: hocl-control
bento_span: 7
formula: "α_HOCl = 1 / (1 + 10^(pH − pKa(T)))"
badge_es: "2.º Lugar Hackatón Puebla 2026"
badge_en: "2nd Place Hackatón Puebla 2026"
tags:
  - ESP32-S3
  - Flutter
  - MQTT
  - Control Adaptativo
  - NOM-127
---

<div class="lang lang-es" markdown="1">

Proyecto desarrollado con el **Equipo Pulse** para el **Hackatón Puebla 2026 (Reto Agua Microside)**, obteniendo el **2.º lugar**: un sistema completo de monitoreo y **control adaptativo de pH** para optimizar la desinfección con cloro libre sin conexión a internet.

### Modelo Físico-Químico y Control Adaptativo

- **Eficacia del cloro libre ($\mathrm{HOCl}$):** El cloro libre se reparte entre ácido hipocloroso ($\mathrm{HOCl}$, especie desinfectante) e ion hipoclorito ($\mathrm{OCl}^-$) en función de la temperatura y el pH:
  $$\alpha_{\mathrm{HOCl}} = \frac{1}{1 + 10^{\,\mathrm{pH} - \mathrm{p}K_a(T)}}, \qquad \mathrm{p}K_a(T) = \frac{3000}{T} - 10.0686 + 0.0253\,T$$
- **Restricción asimétrica y norma NOM-127-SSA1-2021:** Solo se puede dosificar ácido para reducir el pH dentro de la ventana segura **6.5 – 8.5** sin sobrepasar el umbral.
- **Lazo pulso–espera–aprende:** El firmware en **ESP32-S3** ejecuta micro-pulsos acotados (`PULSO`), espera la mezcla (`MEZCLA`), estima en línea la sensibilidad local del tanque ($\hat{s}$) y ajusta la dosis siguiente manteniendo un historial seguro.
- **Arquitectura app ↔ firmware + simulador:** App multiplataforma en **Flutter** conectada por **MQTT sobre WebSocket** (`agua/<nodo>/...`) y equipada con un **simulador determinista de ESP32-S3** (`simulador_esp32.dart`) que replica regla por regla los rechazos, retardos de red, calibración de caudal $V = q\cdot(t - t_0)$ y pruebas de hardware.

<div class="action-links">
  <a class="btn-repo" href="https://github.com/RoshTzsche/gota_poblana" target="_blank" rel="noopener">
    <i class="fa-brands fa-github"></i> Repositorio Gota Poblana (Equipo Pulse)
  </a>
  <a class="btn-repo" href="https://github.com/AngelGab3/gota_poblana" target="_blank" rel="noopener">
    <i class="fa-brands fa-github"></i> Fork en AngelGab3
  </a>
</div>

<div class="tech-pills">
  <span class="tech-pill">ESP32-S3 (C++ / PlatformIO)</span>
  <span class="tech-pill">Flutter / Dart</span>
  <span class="tech-pill">MQTT over WebSocket</span>
  <span class="tech-pill">Adaptive Control</span>
  <span class="tech-pill">Hardware-in-the-Loop Simulator</span>
</div>

</div>

<div class="lang lang-en" markdown="1">

Built with **Equipo Pulse** for **Hackatón Puebla 2026 (Microside Water Challenge)**, winning **2nd place**: an end-to-end offline monitoring and **adaptive pH control** system engineered to maximize chlorine disinfection efficiency.

### Chemical-Physics Model & Adaptive Control

- **Active chlorine ($\mathrm{HOCl}$) fraction:** Free chlorine partitions between hypochlorous acid ($\mathrm{HOCl}$, active disinfectant) and hypochlorite ($\mathrm{OCl}^-$) according to pH and temperature:
  $$\alpha_{\mathrm{HOCl}} = \frac{1}{1 + 10^{\,\mathrm{pH} - \mathrm{p}K_a(T)}}, \qquad \mathrm{p}K_a(T) = \frac{3000}{T} - 10.0686 + 0.0253\,T$$
- **Asymmetric dosing under NOM-127-SSA1-2021:** Because only acid can be added without overshoot, the controller targets safe regulation inside the **6.5 – 8.5** pH compliance window.
- **Pulse–wait–learn control loop:** **ESP32-S3** firmware delivers bounded micro-pulses (`PULSO`), waits through mixing dynamics (`MEZCLA`), estimates the tank's local pH sensitivity ($\hat{s}$), and adapts subsequent dosing steps.
- **Contract & deterministic simulator:** Cross-platform **Flutter** client communicating over **MQTT/WebSocket** (`agua/<node>/...`), backed by a deterministic **ESP32-S3 firmware simulator** (`simulador_esp32.dart`) reproducing two-point pump flow calibration $V = q\cdot(t - t_0)$, network latency, fault injection, and unit/integration test suites.

<div class="action-links">
  <a class="btn-repo" href="https://github.com/RoshTzsche/gota_poblana" target="_blank" rel="noopener">
    <i class="fa-brands fa-github"></i> Gota Poblana Repo (Equipo Pulse)
  </a>
  <a class="btn-repo" href="https://github.com/AngelGab3/gota_poblana" target="_blank" rel="noopener">
    <i class="fa-brands fa-github"></i> Fork on AngelGab3
  </a>
</div>

<div class="tech-pills">
  <span class="tech-pill">ESP32-S3 (C++ / PlatformIO)</span>
  <span class="tech-pill">Flutter / Dart</span>
  <span class="tech-pill">MQTT over WebSocket</span>
  <span class="tech-pill">Adaptive Control</span>
  <span class="tech-pill">Hardware-in-the-Loop Simulator</span>
</div>

</div>
