---
layout: page
title: Galería
permalink: /galeria/
description: Registro fotográfico de congresos, conferencias, talleres y competencias científicas.
nav: true
nav_order: 6
---

{% assign eventos_con_fotos = site.data.eventos | where: "tiene_fotos", true %}

<div class="lang lang-es">
  <p class="lead">
    Registro fotográfico de congresos, conferencias, competencias de robótica e IA y actividades de divulgación científica.
  </p>
</div>
<div class="lang lang-en">
  <p class="lead">
    Photographic archive of scientific conferences, talks, robotics and AI competitions, and science outreach activities.
  </p>
</div>

{% if eventos_con_fotos.size > 0 %}

  <div class="event-cards-grid">
    {% for evento in eventos_con_fotos %}
      <a class="event-cover-card" href="#evento-{{ evento.slug | slugify }}">
        {% if evento.portada %}
          <div class="event-cover-media" style="background-color: {{ evento.portada.dominant_color }};">
            <picture>
              <source type="image/webp" srcset="{{ evento.portada.srcset }}" sizes="(max-width: 640px) 100vw, 360px">
              <img
                src="{{ evento.portada.thumb_url }}"
                alt="{{ evento.titulo_es | escape }}"
                width="{{ evento.portada.width }}"
                height="{{ evento.portada.height }}"
                loading="lazy"
                decoding="async"
              >
            </picture>
            <span class="event-photo-badge">
              <i class="fa-regular fa-images"></i>
              <span class="lang-es">{{ evento.cantidad_fotos }} foto{% if evento.cantidad_fotos != 1 %}s{% endif %}</span>
              <span class="lang-en">{{ evento.cantidad_fotos }} photo{% if evento.cantidad_fotos != 1 %}s{% endif %}</span>
            </span>
          </div>
        {% endif %}
        <div class="event-cover-body">
          <h3>
            <span class="lang-es">{{ evento.titulo_es }}</span>
            <span class="lang-en">{{ evento.titulo_en }}</span>
          </h3>
          <p class="event-cover-meta">
            <span class="lang-es">{{ evento.fecha_texto_es }}</span>
            <span class="lang-en">{{ evento.fecha_texto_en }}</span>
            {% if evento.lugar != "" %}
              · {{ evento.lugar }}
            {% endif %}
          </p>
          {% if evento.descripcion_es != "" or evento.descripcion_en != "" %}
            <p class="event-cover-desc">
              {% if evento.descripcion_es != "" %}
                <span class="lang-es">{{ evento.descripcion_es }}</span>
              {% endif %}
              {% if evento.descripcion_en != "" %}
                <span class="lang-en">{{ evento.descripcion_en }}</span>
              {% endif %}
            </p>
          {% endif %}
        </div>
      </a>
    {% endfor %}
  </div>

{% for evento in eventos_con_fotos %}

<section id="evento-{{ evento.slug | slugify }}" class="event-section">
<div class="event-section-header">
<h2>
<span class="lang-es">{{ evento.titulo_es }}</span>
<span class="lang-en">{{ evento.titulo_en }}</span>
</h2>
<p class="cv-meta">
<span class="lang-es">{{ evento.fecha_texto_es }}</span>
<span class="lang-en">{{ evento.fecha_texto_en }}</span>
{% if evento.lugar != "" %}
· {{ evento.lugar }}
{% endif %}
·
<span class="lang-es">{{ evento.cantidad_fotos }} fotografía{% if evento.cantidad_fotos != 1 %}s{% endif %}</span>
<span class="lang-en">{{ evento.cantidad_fotos }} photo{% if evento.cantidad_fotos != 1 %}s{% endif %}</span>
</p>
{% if evento.descripcion_es != "" or evento.descripcion_en != "" %}
<p>
{% if evento.descripcion_es != "" %}
<span class="lang-es">{{ evento.descripcion_es }}</span>
{% endif %}
{% if evento.descripcion_en != "" %}
<span class="lang-en">{{ evento.descripcion_en }}</span>
{% endif %}
</p>
{% endif %}
</div>
{% include event_gallery.liquid folder=evento.folder %}
</section>
{% endfor %}
{% else %}

  <div class="event-empty-state">
    <p class="lang-es">
      <i class="fa-regular fa-images"></i> Próximamente se publicarán fotografías de eventos, congresos y proyectos en esta sección.
    </p>
    <p class="lang-en">
      <i class="fa-regular fa-images"></i> Photographs from conferences, workshops, and projects will be published here soon.
    </p>
  </div>
{% endif %}
