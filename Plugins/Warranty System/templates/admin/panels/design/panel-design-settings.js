// @dozo:sync auto
// @dozo:module warranty-design-panel
// DOZO v7.2.2: Design Panel JavaScript

(function ($) {
  "use strict";

  // DOZO v7.2.2: Design panel initialization
  let selectedTheme = null;

  /**
   * Initialize design panel
   */
  function rsDesignInit() {
    console.log("🎨 DOZO v7.2.2: Design panel initialized");

    // Load current theme
    const currentTheme =
      $("#designPreview").data("current-theme") || "rockstage-orange";
    selectedTheme = currentTheme;

    // Select current theme card
    const themeCard = $(`.rs-theme-card[data-theme="${currentTheme}"]`);
    if (themeCard.length) {
      selectThemeCard(themeCard);
    }

    // Bind events
    bindDesignEvents();

    // Log to DOZO
    if (typeof DOZO !== "undefined" && DOZO.registerPanel) {
      DOZO.registerPanel("design", "🎨 Diseño", "panel-design-settings.html");
    }
  }

  /**
   * Bind design panel events
   */
  function bindDesignEvents() {
    // Theme card clicks
    $(".rs-theme-card").on("click", function () {
      const theme = $(this).data("theme");
      selectTheme(theme, this);
    });

    // Save button
    $("#saveDesignBtn").on("click", saveDesignSettings);

    // Sync button (if present)
    $("#syncDesignBtn").on("click", dozoExecuteSync);
  }

  /**
   * Select theme
   */
  window.selectTheme = function (theme, element) {
    selectedTheme = theme;
    selectThemeCard($(element));
    updatePreview(theme);
  };

  /**
   * Select theme card visually
   */
  function selectThemeCard($card) {
    // Remove selection from all
    $(".rs-theme-card").removeClass("selected").css({
      "border-color": "#e5e7eb",
      "box-shadow": "none",
    });

    // Add selection to clicked card
    $card.addClass("selected").css({
      "border-color": "#FF8C00",
      "box-shadow": "0 0 0 3px rgba(255,140,0,0.1)",
    });
  }

  /**
   * Update preview section
   */
  function updatePreview(theme) {
    const themeNames = {
      "rockstage-orange": "RockStage Orange",
      "minimal-gray": "Minimal Gray",
      "corporate-blue": "Corporate Blue",
      "modern-dark": "Modern Dark",
    };

    const preview = $("#designPreview");
    preview.addClass("has-selection").html(`
            <div style="max-width: 400px; margin: 0 auto;">
                <h4 style="margin: 0 0 12px; color: #1f2937;">Tema seleccionado:</h4>
                <p style="margin: 0; font-size: 18px; font-weight: 600; color: #FF8C00;">${themeNames[theme] || theme}</p>
                <p style="margin: 12px 0 0; color: #6b7280; font-size: 14px;">Los cambios se aplicarán al guardar la configuración</p>
            </div>
        `);
  }

  /**
   * Save design settings
   */
  window.saveDesignSettings = function () {
    if (!selectedTheme) {
      alert("⚠️ Por favor selecciona un tema primero");
      return;
    }

    const $btn = $("#saveDesignBtn, .rs-btn-primary").first();
    const originalHTML = $btn.html();

    $btn
      .prop("disabled", true)
      .html(
        '<svg class="rs-spinner" width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"/></svg> Guardando...',
      );

    $.ajax({
      url: rsWarrantyAdmin.ajaxUrl,
      type: "POST",
      data: {
        action: "rs_save_design_settings",
        nonce: rsWarrantyAdmin.nonce,
        theme: selectedTheme,
        settings: {},
      },
      success: function (response) {
        if (response.success) {
          alert("✅ Configuración de diseño guardada correctamente");
          console.log("✅ DOZO v7.2.2: Design settings saved -", selectedTheme);
        } else {
          alert("❌ Error: " + (response.data.message || "Error al guardar"));
        }
        $btn.prop("disabled", false).html(originalHTML);
      },
      error: function () {
        alert("❌ Error de conexión");
        $btn.prop("disabled", false).html(originalHTML);
      },
    });
  };

  /**
   * Execute DOZO sync
   */
  window.dozoExecuteSync = function () {
    if (
      !confirm(
        "¿Deseas sincronizar el panel de diseño desde Claude AI?\n\nEsto copiará los archivos de diseño al plugin.",
      )
    ) {
      return;
    }

    const $btn = $("#syncDesignBtn, button").first();
    const originalHTML = $btn.html();

    $btn
      .prop("disabled", true)
      .html(
        '<svg class="rs-spinner" width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"/></svg> Sincronizando...',
      );

    $.ajax({
      url: rsWarrantyAdmin.ajaxUrl,
      type: "POST",
      data: {
        action: "dozo_sync_execute",
        nonce: rsWarrantyAdmin.nonce,
      },
      success: function (response) {
        if (response.success) {
          alert(
            "✅ DOZO Sync completado:\n\n" +
              "Archivos sincronizados: " +
              response.data.synced_files +
              "\n" +
              "Errores: " +
              response.data.errors +
              "\n\n" +
              "Recargando página...",
          );
          window.location.reload();
        } else {
          alert(
            "❌ Error en sync: " +
              (response.data.message || "Error desconocido"),
          );
          $btn.prop("disabled", false).html(originalHTML);
        }
      },
      error: function () {
        alert("❌ Error de conexión al ejecutar sync");
        $btn.prop("disabled", false).html(originalHTML);
      },
    });
  };

  // Initialize on DOM ready
  $(document).ready(function () {
    if ($(".rs-design-panel").length) {
      rsDesignInit();
    }
  });
})(jQuery);

// DOZO v7.2.2: Register panel assets
if (typeof DOZO !== "undefined") {
  DOZO.registerAssets =
    DOZO.registerAssets ||
    function (panel, assets) {
      console.log("📋 DOZO: Registered assets for panel:", panel, assets);
    };

  DOZO.registerAssets("design", {
    css: "Admin Panels/panel-design-settings/panel-design-settings.css",
    js: "Admin Panels/panel-design-settings/panel-design-settings.js",
  });
}
