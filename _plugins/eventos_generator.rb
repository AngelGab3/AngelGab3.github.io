# frozen_string_literal: true

require "date"
require "json"
require "open3"
require "psych"
require "shellwords"

module PortfolioEventos
  EVENTOS_REL = File.join("assets", "img", "eventos")
  CACHE_REL = File.join(".cache", "eventos")
  SCRIPT_REL = File.join("scripts", "process_event_photos.py")
  @processed_once = false

  class << self
    attr_accessor :processed_once
  end

  class EventVariantStaticFile < Jekyll::StaticFile
    def initialize(site, base, name, folder_name)
      @dest_rel_dir = "/assets/img/eventos/#{folder_name}/_variants"
      super(site, base, "", name)
    end

    def destination(dest)
      File.join(dest, @dest_rel_dir, @name)
    end

    def relative_path
      "#{@dest_rel_dir}/#{@name}"
    end

    def url
      "#{@dest_rel_dir}/#{@name}"
    end
  end

  def self.find_python(site)
    candidates = []
    candidates << ENV["PYTHON"] if ENV["PYTHON"] && !ENV["PYTHON"].empty?
    venv_py = File.join(site.source, ".venv", "bin", "python3")
    candidates << venv_py if File.executable?(venv_py)

    ENV.fetch("PATH", "").split(File::PATH_SEPARATOR).each do |dir|
      cand = File.join(dir, "python3")
      candidates << cand if File.executable?(cand)
    end
    candidates << "python3"

    candidates.uniq.each do |bin|
      _, _, st = Open3.capture3(bin, "-c", "import PIL")
      return bin if st.success?
    rescue Errno::ENOENT
      next
    end
    nil
  end

  def self.run_processor!(site, force: false)
    return if @processed_once && !force

    script_path = File.join(site.source, SCRIPT_REL)
    eventos_path = File.join(site.source, EVENTOS_REL)
    return unless File.file?(script_path) && File.directory?(eventos_path)

    python = find_python(site)
    unless python
      Jekyll.logger.warn("Eventos:", "No se encontró Python 3 con Pillow instalado para procesar fotos")
      return
    end

    stdout, stderr, status = Open3.capture3(python, script_path)
    unless status.success?
      Jekyll.logger.warn("Eventos:", "process_event_photos.py exited #{status.exitstatus}: #{stderr} #{stdout}".strip)
      return
    end
    Jekyll.logger.info("Eventos:", stdout.strip) unless stdout.strip.empty?
    @processed_once = true
  rescue Errno::ENOENT => e
    Jekyll.logger.warn("Eventos:", "Python no disponible para procesar fotos (#{e.message})")
  end

  class EventosGenerator < Jekyll::Generator
    safe true
    priority :high

    def generate(site)
      PortfolioEventos.run_processor!(site, force: false)

      # Sync static_files if HEIC conversion removed or added files
      site.static_files.reject! { |sf| !File.exist?(sf.path) }

      eventos_root = File.join(site.source, EVENTOS_REL)
      cache_root = File.join(site.source, CACHE_REL)
      return unless File.directory?(eventos_root)

      baseurl = site.config["baseurl"].to_s
      baseurl = "" if baseurl == "/"
      baseurl = baseurl.chomp("/")

      existing_static_paths = {}
      site.static_files.each { |sf| existing_static_paths[sf.path] = true }

      eventos = []
      eventos_by_folder = {}

      Dir.children(eventos_root).sort.each do |folder|
        next if folder.start_with?(".")

        folder_dir = File.join(eventos_root, folder)
        next unless File.directory?(folder_dir)

        meta = load_event_metadata(folder_dir, folder)
        manifest = load_manifest(cache_root, folder)
        raw_photos = Array(manifest["photos"])

        # Register source files if converted after initial read, and register cached WebP variants
        folder_cache_dir = File.join(cache_root, folder)
        raw_photos.each do |photo|
          src_disk_path = File.join(folder_dir, photo["filename"])
          if File.exist?(src_disk_path) && !existing_static_paths[src_disk_path]
            sf = Jekyll::StaticFile.new(site, site.source, File.join(EVENTOS_REL, folder), photo["filename"])
            site.static_files << sf
            existing_static_paths[src_disk_path] = true
          end

          Array(photo["variants"]).each do |variant|
            vname = variant["name"]
            vpath = File.join(folder_cache_dir, vname)
            next unless File.file?(vpath) && !existing_static_paths[vpath]

            site.static_files << EventVariantStaticFile.new(site, folder_cache_dir, vname, folder)
            existing_static_paths[vpath] = true
          end
        end

        fotos = build_sorted_photos(raw_photos, meta, baseurl)
        portada = pick_cover_photo(fotos, meta["portada"])

        evento_data = {
          "folder" => folder,
          "slug" => folder,
          "titulo_es" => meta["titulo_es"],
          "titulo_en" => meta["titulo_en"],
          "fecha" => meta["fecha"],
          "fecha_texto_es" => meta["fecha_texto_es"],
          "fecha_texto_en" => meta["fecha_texto_en"],
          "sort_fecha" => meta["sort_fecha"],
          "lugar" => meta["lugar"],
          "descripcion_es" => meta["descripcion_es"],
          "descripcion_en" => meta["descripcion_en"],
          "portada" => portada,
          "fotos" => fotos,
          "cantidad_fotos" => fotos.length,
          "tiene_fotos" => !fotos.empty?,
        }

        eventos << evento_data
        eventos_by_folder[folder] = evento_data
      end

      # Ordenar eventos por fecha descendente (más reciente primero)
      eventos.sort_by! { |e| [e["sort_fecha"].to_s, e["folder"].to_s] }
      eventos.reverse!

      site.data["eventos"] = eventos
      site.data["eventos_by_folder"] = eventos_by_folder
    end

    private

    def load_manifest(cache_root, folder)
      manifest_path = File.join(cache_root, folder, "manifest.json")
      return { "photos" => [] } unless File.file?(manifest_path)

      JSON.parse(File.read(manifest_path, encoding: "utf-8"))
    rescue JSON::ParserError => e
      Jekyll.logger.warn("Eventos:", "Manifest inválido en #{manifest_path}: #{e.message}")
      { "photos" => [] }
    end

    def load_event_metadata(folder_dir, folder)
      yml_path = File.join(folder_dir, "evento.yml")
      raw = {}
      if File.file?(yml_path)
        loaded = Psych.safe_load_file(yml_path, permitted_classes: [Date, Time])
        raw = loaded if loaded.is_a?(Hash)
      end

      inferred_date, slug_body = parse_folder_slug(folder)
      inferred_title = humanize_slug(slug_body)

      raw_fecha = raw["fecha"]
      fecha_str = if raw_fecha.respond_to?(:strftime)
                    raw_fecha.strftime("%Y-%m-%d")
                  elsif raw_fecha
                    raw_fecha.to_s.strip
                  else
                    inferred_date
                  end

      titulo_es = (raw["titulo_es"] || raw["titulo"] || inferred_title).to_s.strip
      titulo_en = (raw["titulo_en"] || raw["titulo"] || titulo_es).to_s.strip

      {
        "titulo_es" => titulo_es,
        "titulo_en" => titulo_en,
        "fecha" => fecha_str,
        "fecha_texto_es" => (raw["fecha_texto_es"] || format_date_es(fecha_str)).to_s,
        "fecha_texto_en" => (raw["fecha_texto_en"] || format_date_en(fecha_str)).to_s,
        "sort_fecha" => normalize_sort_date(fecha_str),
        "lugar" => (raw["lugar"] || "").to_s.strip,
        "descripcion_es" => (raw["descripcion_es"] || raw["descripcion"] || "").to_s.strip,
        "descripcion_en" => (raw["descripcion_en"] || raw["descripcion"] || "").to_s.strip,
        "portada" => raw["portada"]&.to_s&.strip,
        "pie_de_foto" => raw["pie_de_foto"].is_a?(Hash) ? raw["pie_de_foto"] : {},
      }
    end

    def parse_folder_slug(folder)
      if folder =~ /\A(\d{4})-(\d{4})-(.+)\z/
        return "#{Regexp.last_match(2)}-01-01", Regexp.last_match(3)
      elsif folder =~ /\A(\d{4})-(\d{2})-(\d{2})-(.+)\z/
        return "#{Regexp.last_match(1)}-#{Regexp.last_match(2)}-#{Regexp.last_match(3)}", Regexp.last_match(4)
      elsif folder =~ /\A(\d{4})-(\d{2})-(.+)\z/
        return "#{Regexp.last_match(1)}-#{Regexp.last_match(2)}-01", Regexp.last_match(3)
      elsif folder =~ /\A(\d{4})-(.+)\z/
        return "#{Regexp.last_match(1)}-01-01", Regexp.last_match(2)
      end

      ["", folder]
    end

    def normalize_sort_date(fecha_str)
      return "0000-00-00" if fecha_str.nil? || fecha_str.empty?
      return fecha_str if fecha_str =~ /\A\d{4}-\d{2}-\d{2}\z/
      return "#{fecha_str}-01" if fecha_str =~ /\A\d{4}-\d{2}\z/
      return "#{fecha_str}-01-01" if fecha_str =~ /\A\d{4}\z/

      fecha_str
    end

    def format_date_es(fecha_str)
      months = %w[_ Ene Feb Mar Abr May Jun Jul Ago Sep Oct Nov Dic]
      if fecha_str =~ /\A(\d{4})-(\d{2})(?:-(\d{2}))?\z/
        y = Regexp.last_match(1)
        m = Regexp.last_match(2).to_i
        return "#{months[m]} #{y}" if m.between?(1, 12)
      end
      fecha_str
    end

    def format_date_en(fecha_str)
      months = %w[_ Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec]
      if fecha_str =~ /\A(\d{4})-(\d{2})(?:-(\d{2}))?\z/
        y = Regexp.last_match(1)
        m = Regexp.last_match(2).to_i
        return "#{months[m]} #{y}" if m.between?(1, 12)
      end
      fecha_str
    end

    def humanize_slug(slug)
      slug.to_s.tr("_-", " ").split.map(&:capitalize).join(" ")
    end

    def build_sorted_photos(raw_photos, meta, baseurl)
      pie_map = meta["pie_de_foto"]
      sorted = raw_photos.sort_by do |photo|
        fname = photo["filename"].to_s
        exif_date = photo["exif_date"].to_s
        if fname =~ /\A(\d+)[._\- ]/
          [0, Regexp.last_match(1).to_i, exif_date, fname.downcase]
        elsif !exif_date.empty?
          [1, 0, exif_date, fname.downcase]
        else
          [2, 0, "", fname.downcase]
        end
      end

      total = sorted.length
      sorted.each_with_index.map do |photo, idx|
        fname = photo["filename"].to_s
        stem = photo["stem"].to_s
        variants = Array(photo["variants"]).map do |v|
          url = "#{baseurl}#{v['url']}"
          {
            "width" => v["width"],
            "height" => v["height"],
            "url" => url,
          }
        end
        srcset = variants.map { |v| "#{v['url']} #{v['width']}w" }.join(", ")
        thumb_variant = variants.find { |v| v["width"] >= 800 } || variants.last
        thumb_url = thumb_variant ? thumb_variant["url"] : "#{baseurl}#{photo['rel_url']}"
        largest_variant = variants.last
        largest_url = largest_variant ? largest_variant["url"] : "#{baseurl}#{photo['rel_url']}"

        custom_cap = pie_map[fname] || pie_map[stem]
        if custom_cap.is_a?(Hash)
          cap_es = (custom_cap["es"] || custom_cap["titulo_es"] || meta["titulo_es"]).to_s
          cap_en = (custom_cap["en"] || custom_cap["titulo_en"] || meta["titulo_en"]).to_s
        elsif custom_cap.is_a?(String) && !custom_cap.strip.empty?
          cap_es = custom_cap.strip
          cap_en = custom_cap.strip
        else
          pretty_stem = meaningful_caption_from_stem(stem)
          if pretty_stem
            cap_es = "#{meta['titulo_es']} — #{pretty_stem}"
            cap_en = "#{meta['titulo_en']} — #{pretty_stem}"
          else
            cap_es = "#{meta['titulo_es']} (#{idx + 1}/#{total})"
            cap_en = "#{meta['titulo_en']} (#{idx + 1}/#{total})"
          end
        end

        {
          "filename" => fname,
          "stem" => stem,
          "rel_url" => "#{baseurl}#{photo['rel_url']}",
          "thumb_url" => thumb_url,
          "largest_url" => largest_url,
          "srcset" => srcset,
          "width" => photo["width"].to_i,
          "height" => photo["height"].to_i,
          "aspect_ratio" => photo["aspect_ratio"].to_f,
          "dominant_color" => photo["dominant_color"].to_s,
          "exif_date" => photo["exif_date"].to_s,
          "caption_es" => cap_es,
          "caption_en" => cap_en,
        }
      end
    end

    def meaningful_caption_from_stem(stem)
      cleaned = stem.sub(/\A\d+[._\- ]*/, "").tr("_-", " ").strip
      return nil if cleaned.empty?
      return nil if cleaned =~ /\A(?:img|dsc|pxl|photo|foto|mvimg)\s*\d+\z/i
      return nil if cleaned =~ /\A\d+\z/

      cleaned.split.map(&:capitalize).join(" ")
    end

    def pick_cover_photo(fotos, requested_portada)
      return nil if fotos.empty?

      if requested_portada && !requested_portada.empty?
        matched = fotos.find { |f| f["filename"] == requested_portada }
        return matched if matched
      end

      horizontal = fotos.find { |f| f["aspect_ratio"].to_f >= 1.0 }
      horizontal || fotos.first
    end
  end
end

Jekyll::Hooks.register(:site, :after_reset) do |site|
  PortfolioEventos.processed_once = false
  PortfolioEventos.run_processor!(site)
end
