# frozen_string_literal: true

module PortfolioSiteHooks
  INCLUDES_DIR = File.expand_path("includes", __dir__)

  def self.register_includes_path(site)
    return unless File.directory?(INCLUDES_DIR)

    paths = site.includes_load_paths
    paths << INCLUDES_DIR unless paths.include?(INCLUDES_DIR)
  end

  def self.inject_assets(doc)
    return unless doc.output_ext == ".html"
    return unless doc.output.is_a?(String) && doc.output.include?("</head>")

    baseurl = doc.site.config["baseurl"].to_s
    baseurl = "" if baseurl == "/"

    lang_init_script = <<~HTML.chomp
      <script>(function(){try{var l=localStorage.getItem('site-lang');if(l!=='en'&&l!=='es'){l='es';}document.documentElement.setAttribute('data-lang',l);document.documentElement.setAttribute('lang',l);}catch(e){document.documentElement.setAttribute('data-lang','es');}})();</script>
    HTML

    css_tags = <<~HTML.chomp
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/photoswipe@5.4.4/dist/photoswipe.min.css" crossorigin="anonymous">
      <link rel="stylesheet" href="#{baseurl}/assets/css/custom.css">
    HTML

    js_tag = %(<script src="#{baseurl}/assets/js/site-enhancements.js" defer></script>)

    html = doc.output
    unless html.include?("/assets/css/custom.css")
      html = html.sub("</head>", "#{lang_init_script}\n#{css_tags}\n</head>")
    end
    if html.include?("</body>") && !html.include?("/assets/js/site-enhancements.js")
      html = html.sub("</body>", "#{js_tag}\n</body>")
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
