---
layout: page
title: Proyectos
permalink: /proyectos/
description: Proyectos en física computacional, computación cuántica, geometría de la información, simulaciones numéricas, IA y robótica.
nav: true
nav_order: 1
display_categories:
  - es: Física Computacional
    en: Computational Physics
  - es: Inteligencia Artificial
    en: Artificial Intelligence
  - es: Robótica y Hardware
    en: Robotics & Hardware
  - es: Desarrollo iOS
    en: iOS Development
---

<div class="projects projects-bento-shell">
  <div class="bento-filter-bar" role="toolbar" aria-label="Filtrar proyectos / Filter projects">
    <button type="button" class="bento-filter-btn is-active" data-filter="all" aria-pressed="true">
      <span class="lang-es">Todos</span>
      <span class="lang-en">All</span>
      <span class="bento-filter-count">{{ site.projects.size }}</span>
    </button>
    {% for cat in page.display_categories %}
      {% assign cat_es = cat.es %}
      {% assign cat_en = cat.en %}
      {% assign cat_slug = cat_es | slugify: "latin" %}
      {% assign cat_items = site.projects | where: "category", cat_es %}
      <button type="button" class="bento-filter-btn" data-filter="{{ cat_slug }}" aria-pressed="false">
        <span class="lang-es">{{ cat_es }}</span>
        <span class="lang-en">{{ cat_en }}</span>
        <span class="bento-filter-count">{{ cat_items.size }}</span>
      </button>
    {% endfor %}
  </div>

{% for cat in page.display_categories %}
{% assign cat_es = cat.es %}
{% assign cat_en = cat.en %}
{% assign cat_slug = cat_es | slugify: "latin" %}
{% assign categorized_projects = site.projects | where: "category", cat_es %}
{% assign sorted_projects = categorized_projects | sort: "importance" %}

<section class="bento-category-section" data-bento-section="{{ cat_slug }}">
<a id="{{ cat_slug }}" href="#{{ cat_slug }}" class="bento-category-anchor">
<h2 class="category bento-category-heading">
<span class="bento-category-index">0{{ forloop.index }}</span>
<span class="lang-es">{{ cat_es }}</span>
<span class="lang-en">{{ cat_en }}</span>
</h2>
</a>

      <div class="bento-grid">
        {% for project in sorted_projects %}
          {% assign project_href = project.redirect | default: project.url | relative_url %}
          {% assign span_size = project.bento_span | default: 6 %}
          <article class="bento-card bento-span-{{ span_size }}" data-sim-card>
            <div class="bento-visual">
              <canvas
                class="project-sim-canvas"
                data-sim="{{ project.sim | default: 'manifold' }}"
                aria-hidden="true"
              ></canvas>
              <div class="bento-visual-vignette" aria-hidden="true"></div>
              {% if project.formula %}
                <span class="bento-formula">{{ project.formula }}</span>
              {% endif %}
              {% if project.badge_es or project.badge_en %}
                <span class="bento-award-badge badge-award">
                  <i class="fa-solid fa-award" aria-hidden="true"></i>
                  <span class="lang-es">{{ project.badge_es | default: project.badge_en }}</span>
                  <span class="lang-en">{{ project.badge_en | default: project.badge_es }}</span>
                </span>
              {% endif %}
            </div>

            <div class="bento-body">
              <div class="bento-body-top">
                <h3 class="bento-title">
                  <a href="{{ project_href }}" class="stretched-link bento-title-link">
                    <span class="bento-title-text">
                      <span class="lang-es">{{ project.title_es | default: project.title }}</span>
                      <span class="lang-en">{{ project.title_en | default: project.title }}</span>
                    </span>
                    <span class="bento-arrow" aria-hidden="true">↗</span>
                  </a>
                </h3>
                <p class="bento-desc">
                  <span class="lang-es">{{ project.description_es | default: project.description }}</span>
                  <span class="lang-en">{{ project.description_en | default: project.description }}</span>
                </p>
              </div>

              <div class="bento-footer">
                {% if project.tags %}
                  <div class="bento-tags">
                    {% for tag in project.tags %}
                      <span class="bento-tag">{{ tag }}</span>
                    {% endfor %}
                  </div>
                {% endif %}

                <div class="bento-actions">
                  {% if project.github %}
                    <a
                      href="{{ project.github }}"
                      class="bento-gh-link"
                      target="_blank"
                      rel="noopener"
                      aria-label="GitHub Repository"
                    >
                      <i class="fa-brands fa-github" aria-hidden="true"></i>
                      <span>GitHub</span>
                    </a>
                  {% endif %}
                  <span class="bento-explore-cue" aria-hidden="true">
                    <span class="lang-es">Explorar →</span>
                    <span class="lang-en">Explore →</span>
                  </span>
                </div>
              </div>
            </div>
          </article>
        {% endfor %}
      </div>
    </section>

{% endfor %}

</div>
