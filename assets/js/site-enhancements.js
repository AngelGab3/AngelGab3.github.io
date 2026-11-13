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

  function labelFor(l) {
    return l === "en" ? "ES" : "EN";
  }

  function insertLanguageButton() {
    var themeBtn = document.getElementById("light-toggle");
    if (!themeBtn || document.getElementById("lang-toggle")) return;

    var btn = document.createElement("button");
    btn.id = "lang-toggle";
    btn.type = "button";
    btn.title = "Cambiar idioma / Change language";
    btn.setAttribute("aria-label", "Cambiar idioma / Change language");
    btn.textContent = labelFor(document.documentElement.getAttribute("data-lang") || "es");

    btn.addEventListener("click", function () {
      var next = document.documentElement.getAttribute("data-lang") === "en" ? "es" : "en";
      document.documentElement.setAttribute("data-lang", next);
      document.documentElement.setAttribute("lang", next);
      try {
        localStorage.setItem("site-lang", next);
      } catch (e) {}
      btn.textContent = labelFor(next);
    });

    themeBtn.parentNode.insertBefore(btn, themeBtn);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", insertLanguageButton);
  } else {
    insertLanguageButton();
  }
})();
