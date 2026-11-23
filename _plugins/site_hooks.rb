# frozen_string_literal: true

require "digest"

module PortfolioSiteHooks
  INCLUDES_DIR = File.expand_path("includes", __dir__)

  def self.register_includes_path(site)
    return unless File.directory?(INCLUDES_DIR)

    paths = site.includes_load_paths
    paths << INCLUDES_DIR unless paths.include?(INCLUDES_DIR)
  end

  def self.asset_version(site, rel_path)
    full_path = File.join(site.source, rel_path)
    if File.file?(full_path)
      Digest::MD5.file(full_path).hexdigest[0, 8]
    else
      Time.now.to_i.to_s
    end
  end

  def self.inject_assets(doc)
    return unless doc.output_ext == ".html"
    return unless doc.output.is_a?(String) && doc.output.include?("</head>")

    baseurl = doc.site.config["baseurl"].to_s
    baseurl = "" if baseurl == "/"

    css_v = asset_version(doc.site, "assets/css/custom.css")
    qlab_v = asset_version(doc.site, "assets/js/quantum-lab.js")
    enh_v = asset_version(doc.site, "assets/js/site-enhancements.js")

    lang_init_script = <<~HTML.chomp
      <script>(function(){try{var l=localStorage.getItem('site-lang');if(l!=='en'&&l!=='es'){l='es';}document.documentElement.setAttribute('data-lang',l);document.documentElement.setAttribute('lang',l);}catch(e){document.documentElement.setAttribute('data-lang','es');}})();</script>
    HTML

    css_tags = <<~HTML.chomp
      <meta name="view-transition" content="same-origin">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/photoswipe@5.4.4/dist/photoswipe.min.css" crossorigin="anonymous">
      <link rel="stylesheet" href="#{baseurl}/assets/css/custom.css?v=#{css_v}">
    HTML

    quantum_js_tag = %(<script src="#{baseurl}/assets/js/quantum-lab.js?v=#{qlab_v}" defer></script>)
    js_tag = %(<script src="#{baseurl}/assets/js/site-enhancements.js?v=#{enh_v}" defer></script>)

    html = doc.output
    unless html.include?("/assets/css/custom.css")
      html = html.sub("</head>", "#{lang_init_script}\n#{css_tags}\n</head>")
    end
    if html.include?("</body>")
      unless html.include?("/assets/js/quantum-lab.js")
        html = html.sub("</body>", "#{quantum_js_tag}\n</body>")
      end
      unless html.include?("/assets/js/site-enhancements.js")
        html = html.sub("</body>", "#{js_tag}\n</body>")
      end
    end
    doc.output = html
  end
end

Jekyll::Hooks.register(:site, :after_init) do |site|
  PortfolioSiteHooks.register_includes_path(site)
end

Jekyll::Hooks.register(:site, :after_reset) do |site|
  PortfolioSiteHooks.register_includes_path(site)
end

Jekyll::Hooks.register([:pages, :documents], :post_render) do |doc|
  PortfolioSiteHooks.inject_assets(doc)
end
