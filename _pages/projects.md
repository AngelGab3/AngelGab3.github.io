---
layout: page
title: Proyectos
permalink: /proyectos/
description: Proyectos en física computacional, inteligencia artificial, robótica y desarrollo de software.
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

<div class="projects">
  {% for cat in page.display_categories %}
    {% assign cat_es = cat.es %}
    {% assign cat_en = cat.en %}
    <a id="{{ cat_es | slugify }}" href="#{{ cat_es | slugify }}">
      <h2 class="category">
        <span class="lang-es">{{ cat_es }}</span>
        <span class="lang-en">{{ cat_en }}</span>
      </h2>
    </a>
    {% assign categorized_projects = site.projects | where: "category", cat_es %}
    {% assign sorted_projects = categorized_projects | sort: "importance" %}
    <div class="row row-cols-1 row-cols-md-3">
      {% for project in sorted_projects %}
        {% assign project_href = project.redirect | default: project.url | relative_url %}
        <div class="col mb-4">
          <div class="card h-100 hoverable">
            <div class="card-body d-flex flex-column justify-content-between">
              <div>
                <h3 class="card-title">
                  <a href="{{ project_href }}" class="stretched-link">
                    <span class="lang-es">{{ project.title_es | default: project.title }}</span>
                    <span class="lang-en">{{ project.title_en | default: project.title }}</span>
                  </a>
                </h3>
                <p class="card-text">
                  <span class="lang-es">{{ project.description_es | default: project.description }}</span>
                  <span class="lang-en">{{ project.description_en | default: project.description }}</span>
                </p>
              </div>
              {% if project.github %}
                <div class="row ml-1 mr-1 p-0 position-relative" style="z-index: 2;">
                  <div class="github-icon">
                    <div class="icon" title="GitHub Repository">
                      <a href="{{ project.github }}" target="_blank" rel="noopener" aria-label="GitHub Repository">
                        <i class="fa-brands fa-github gh-icon"></i>
                      </a>
                    </div>
                  </div>
                </div>
              {% endif %}
            </div>
          </div>
        </div>
      {% endfor %}
    </div>
  {% endfor %}
</div>
