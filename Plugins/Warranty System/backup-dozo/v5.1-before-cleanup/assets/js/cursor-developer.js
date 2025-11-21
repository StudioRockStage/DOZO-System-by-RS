/**
 * Cursor AI Developer Panel
 * DOZO Deep Audit v5.1 - Dual AI Integration
 *
 * Handles Cursor AI interaction, query execution, and fix application.
 *
 * @package RockStage_Warranty_System
 * @since 5.1.0
 */

(function ($) {
  "use strict";

  const CursorDeveloper = {
    /**
     * Initialize Cursor Developer Panel
     */
    init: function () {
      this.setupEventListeners();
      this.setupTabNavigation();
      this.loadQueryHistory();
      this.addLog("Panel Cursor AI inicializado", "info");
    },

    /**
     * Setup event listeners
     */
    setupEventListeners: function () {
      // Endpoint configuration form
      $("#cursorEndpointForm").on("submit", (e) => {
        e.preventDefault();
        this.saveEndpointConfig();
      });

      // Test connection button
      $("#testCursorConnection").on("click", () => {
        this.testConnection();
      });

      // Execute query button
      $("#executeCursorQuery").on("click", () => {
        this.executeQuery();
      });

      // Clear prompt button
      $("#clearCursorPrompt").on("click", () => {
        $("#cursorPrompt").val("");
        this.addLog("Prompt limpiado", "info");
      });

      // Quick actions
      $(".rs-quick-action").on("click", function () {
        const action = $(this).data("action");
        CursorDeveloper.loadQuickAction(action);
      });

      // Keyboard shortcuts
      $("#cursorPrompt").on("keydown", (e) => {
        // Ctrl/Cmd + Enter to execute
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
          e.preventDefault();
          this.executeQuery();
        }
      });
    },

    /**
     * Setup tab navigation
     */
    setupTabNavigation: function () {
      $(".rs-console-tab").on("click", function () {
        const tab = $(this).data("tab");

        // Update tab buttons
        $(".rs-console-tab").removeClass("active");
        $(this).addClass("active");

        // Update panes
        $(".rs-console-pane").removeClass("active");
        $(`.rs-console-pane[data-pane="${tab}"]`).addClass("active");
      });
    },

    /**
     * Save endpoint configuration
     */
    saveEndpointConfig: function () {
      const $btn = $('#cursorEndpointForm button[type="submit"]');
      const originalText = $btn.html();

      $btn.addClass("loading").prop("disabled", true);
      this.addLog("Guardando configuración...", "info");

      $.ajax({
        url: rsCursorDev.ajaxUrl,
        type: "POST",
        data: {
          action: "rs_cursor_save_endpoint",
          nonce: rsCursorDev.nonce,
          endpoint_url: $("#cursorEndpointUrl").val(),
          access_token: $("#cursorAccessToken").val(),
        },
        success: (response) => {
          if (response.success) {
            this.showNotice("Configuración guardada exitosamente", "success");
            this.addLog(
              "Configuración guardada: " + $("#cursorEndpointUrl").val(),
              "success",
            );

            // Update status badge
            $(".rs-status-badge")
              .removeClass("disconnected")
              .addClass("connected")
              .html("🟢 Configurado");
          } else {
            this.showNotice(
              response.data.message || "Error al guardar",
              "error",
            );
            this.addLog("Error: " + response.data.message, "error");
          }
        },
        error: (xhr, status, error) => {
          this.showNotice("Error de conexión: " + error, "error");
          this.addLog("Error de conexión: " + error, "error");
        },
        complete: () => {
          $btn
            .removeClass("loading")
            .prop("disabled", false)
            .html(originalText);
        },
      });
    },

    /**
     * Test connection to Cursor endpoint
     */
    testConnection: function () {
      const $btn = $("#testCursorConnection");
      const originalText = $btn.html();

      $btn.addClass("loading").prop("disabled", true);
      this.addLog("Probando conexión con Cursor AI...", "info");

      $.ajax({
        url: rsCursorDev.ajaxUrl,
        type: "POST",
        data: {
          action: "rs_cursor_test_connection",
          nonce: rsCursorDev.nonce,
        },
        success: (response) => {
          if (response.success) {
            this.showNotice(response.data.message, "success");
            this.addLog("✅ Conexión exitosa", "success");
            this.addLog("Endpoint: " + response.data.endpoint, "info");
          } else {
            this.showNotice(response.data.message, "error");
            this.addLog("❌ " + response.data.message, "error");
          }
        },
        error: (xhr, status, error) => {
          this.showNotice("Error de conexión: " + error, "error");
          this.addLog("❌ Error de conexión: " + error, "error");
        },
        complete: () => {
          $btn
            .removeClass("loading")
            .prop("disabled", false)
            .html(originalText);
        },
      });
    },

    /**
     * Execute Cursor AI query
     */
    executeQuery: function () {
      const query = $("#cursorPrompt").val().trim();

      if (!query) {
        this.showNotice("Por favor escribe una consulta", "warning");
        return;
      }

      const $btn = $("#executeCursorQuery");
      const originalText = $btn.html();

      $btn.addClass("loading").prop("disabled", true);
      this.addLog("Ejecutando query...", "info");
      this.addLog(
        "Query: " + query.substring(0, 100) + (query.length > 100 ? "..." : ""),
        "info",
      );

      // Switch to response tab
      $('.rs-console-tab[data-tab="response"]').click();

      // Show loading in response
      $("#cursorResponse").html(`
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #FF8C00;">
                    <div style="text-align: center;">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: rs-spinner 1s linear infinite;">
                            <circle cx="12" cy="12" r="10" opacity="0.25"/>
                            <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
                        </svg>
                        <p style="margin-top: 16px; font-size: 14px;">Procesando con Cursor AI...</p>
                    </div>
                </div>
            `);

      $.ajax({
        url: rsCursorDev.ajaxUrl,
        type: "POST",
        data: {
          action: "rs_cursor_query",
          nonce: rsCursorDev.nonce,
          query: query,
        },
        success: (response) => {
          if (response.success) {
            this.displayResponse(response.data);
            this.addLog("✅ Query ejecutado exitosamente", "success");
            this.saveQueryHistory(query, response.data);
          } else {
            this.displayError(response.data.message || "Error desconocido");
            this.addLog("❌ Error: " + response.data.message, "error");
          }
        },
        error: (xhr, status, error) => {
          this.displayError("Error de conexión: " + error);
          this.addLog("❌ Error de conexión: " + error, "error");
        },
        complete: () => {
          $btn
            .removeClass("loading")
            .prop("disabled", false)
            .html(originalText);
        },
      });
    },

    /**
     * Display response from Cursor AI
     */
    displayResponse: function (data) {
      const response = data.response;
      let html = '<div class="rs-cursor-response">';

      if (response.code) {
        html += '<div class="rs-code-block">';
        html += "<pre>" + this.escapeHtml(response.code) + "</pre>";
        html += '<div class="rs-code-actions">';
        html +=
          '<button class="rs-btn rs-btn-secondary" onclick="CursorDeveloper.copyCode(this)">📋 Copiar</button>';
        html +=
          '<button class="rs-btn rs-btn-secondary" onclick="CursorDeveloper.previewCode(this)">👁️ Preview</button>';
        html +=
          '<button class="rs-btn rs-btn-primary" onclick="CursorDeveloper.applyCode(this)">✅ Aplicar Fix</button>';
        html += "</div>";
        html += "</div>";
      }

      if (response.explanation) {
        html +=
          '<div style="margin-top: 16px; padding: 16px; background: #f9fafb; border-radius: 8px; line-height: 1.6;">';
        html += this.processMarkdown(response.explanation);
        html += "</div>";
      }

      if (response.suggestions) {
        html += '<div style="margin-top: 16px;">';
        html += '<h4 style="margin-bottom: 12px;">💡 Sugerencias:</h4>';
        html += '<ul style="padding-left: 20px; line-height: 1.8;">';
        response.suggestions.forEach((s) => {
          html += "<li>" + this.escapeHtml(s) + "</li>";
        });
        html += "</ul>";
        html += "</div>";
      }

      html += "</div>";
      $("#cursorResponse").html(html);
    },

    /**
     * Display error message
     */
    displayError: function (message) {
      $("#cursorResponse").html(`
                <div class="rs-notice error" style="margin: 20px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    <span>${this.escapeHtml(message)}</span>
                </div>
            `);
    },

    /**
     * Copy code to clipboard
     */
    copyCode: function (btn) {
      const code = $(btn).closest(".rs-code-block").find("pre").text();

      navigator.clipboard
        .writeText(code)
        .then(() => {
          const originalText = $(btn).html();
          $(btn).html("✅ Copiado").addClass("success");

          setTimeout(() => {
            $(btn).html(originalText).removeClass("success");
          }, 2000);

          this.addLog("Código copiado al portapapeles", "success");
        })
        .catch((err) => {
          this.showNotice("Error al copiar: " + err, "error");
        });
    },

    /**
     * Preview code in preview tab
     */
    previewCode: function (btn) {
      const code = $(btn).closest(".rs-code-block").find("pre").text();

      $("#cursorPreview").html(`
                <div class="rs-code-block">
                    <pre>${this.escapeHtml(code)}</pre>
                </div>
            `);

      $('.rs-console-tab[data-tab="preview"]').click();
      this.addLog("Código cargado en preview", "info");
    },

    /**
     * Apply code fix to plugin
     */
    applyCode: function (btn) {
      const code = $(btn).closest(".rs-code-block").find("pre").text();

      // Prompt for file path
      const filePath = prompt(
        "Ingresa la ruta del archivo (ej: assets/js/admin-categories.js):",
      );

      if (!filePath) {
        return;
      }

      if (
        !confirm(
          "¿Estás seguro de aplicar este fix?\n\nSe creará un backup automáticamente.",
        )
      ) {
        return;
      }

      $(btn).addClass("loading").prop("disabled", true);
      this.addLog("Aplicando fix a: " + filePath, "info");

      $.ajax({
        url: rsCursorDev.ajaxUrl,
        type: "POST",
        data: {
          action: "rs_cursor_apply_fix",
          nonce: rsCursorDev.nonce,
          code: code,
          file_path: filePath,
        },
        success: (response) => {
          if (response.success) {
            this.showNotice(response.data.message, "success");
            this.addLog("✅ Fix aplicado exitosamente", "success");
            this.addLog("Draft: " + response.data.draft_path, "info");
            this.addLog("Backup: " + response.data.backup_path, "info");
          } else {
            this.showNotice(response.data.message, "error");
            this.addLog("❌ Error: " + response.data.message, "error");
          }
        },
        error: (xhr, status, error) => {
          this.showNotice("Error: " + error, "error");
          this.addLog("❌ Error: " + error, "error");
        },
        complete: () => {
          $(btn).removeClass("loading").prop("disabled", false);
        },
      });
    },

    /**
     * Load quick action prompt
     */
    loadQuickAction: function (action) {
      const prompts = {
        audit:
          "Realiza una auditoría completa del código del plugin RockStage Warranty System. Enfócate en:\n- Seguridad (XSS, CSRF, SQL injection)\n- Performance (queries lentas, memory leaks)\n- Best practices de WordPress",
        optimize:
          "Analiza y optimiza el archivo assets/js/admin-categories.js:\n- Reduce complejidad ciclomática\n- Mejora manejo de promesas\n- Implementa lazy loading donde sea posible",
        security:
          "Verifica la seguridad del plugin:\n- Validación de nonces en todos los endpoints AJAX\n- Sanitización de inputs\n- Escapado de outputs\n- Capability checks",
        debug:
          "Analiza los logs recientes y ayúdame a debuggear el siguiente error:\n[Pega aquí el mensaje de error o describe el problema]",
        refactor:
          "Refactoriza el siguiente código aplicando SOLID principles y design patterns:\n[Pega aquí el código a refactorizar]",
        test: "Genera unit tests para:\n- Función: saveCategory()\n- Archivo: includes/class-warranty-core.php\n- Framework: PHPUnit",
      };

      const prompt = prompts[action] || "";
      $("#cursorPrompt").val(prompt).focus();
      this.addLog("Acción rápida cargada: " + action, "info");

      // Switch to prompt tab
      $('.rs-console-tab[data-tab="prompt"]').click();
    },

    /**
     * Add log entry
     */
    addLog: function (message, level = "info") {
      const now = new Date();
      const time = now.toLocaleTimeString("es-ES", { hour12: false });

      const $logEntry = $('<div class="rs-log-entry"></div>');
      $logEntry.append(`<span class="rs-log-time">${time}</span>`);
      $logEntry.append(
        `<span class="rs-log-level ${level}">${level.toUpperCase()}</span>`,
      );
      $logEntry.append(
        `<span class="rs-log-message">${this.escapeHtml(message)}</span>`,
      );

      $("#cursorLogs").append($logEntry);

      // Auto-scroll to bottom
      const logsContainer = $("#cursorLogs")[0];
      if (logsContainer) {
        logsContainer.scrollTop = logsContainer.scrollHeight;
      }
    },

    /**
     * Show notice message
     */
    showNotice: function (message, type = "info") {
      const $notice = $(`
                <div class="rs-notice ${type}" style="position: fixed; top: 32px; right: 20px; z-index: 9999; min-width: 300px; max-width: 500px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                    ${this.escapeHtml(message)}
                </div>
            `);

      $("body").append($notice);

      setTimeout(() => {
        $notice.fadeOut(400, () => $notice.remove());
      }, 4000);
    },

    /**
     * Process basic markdown
     */
    processMarkdown: function (text) {
      if (!text) return "";

      // Code blocks
      text = text.replace(
        /```(\w+)?\n([\s\S]*?)```/g,
        '<div class="rs-code-block"><pre>$2</pre></div>',
      );

      // Inline code
      text = text.replace(
        /`([^`]+)`/g,
        '<code style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px; font-family: monospace;">$1</code>',
      );

      // Bold
      text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

      // Italic
      text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");

      // Line breaks
      text = text.replace(/\n/g, "<br>");

      return text;
    },

    /**
     * Escape HTML
     */
    escapeHtml: function (text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    },

    /**
     * Save query history to localStorage
     */
    saveQueryHistory: function (query, response) {
      try {
        let history = JSON.parse(
          localStorage.getItem("rs_cursor_history") || "[]",
        );

        history.unshift({
          query: query,
          response: response,
          timestamp: new Date().toISOString(),
        });

        // Keep last 50 queries
        history = history.slice(0, 50);

        localStorage.setItem("rs_cursor_history", JSON.stringify(history));
      } catch (e) {
        console.error("Error saving history:", e);
      }
    },

    /**
     * Load query history from localStorage
     */
    loadQueryHistory: function () {
      try {
        const history = JSON.parse(
          localStorage.getItem("rs_cursor_history") || "[]",
        );
        this.addLog(
          `Historial cargado: ${history.length} queries previos`,
          "info",
        );
      } catch (e) {
        console.error("Error loading history:", e);
      }
    },
  };

  // Initialize on document ready
  $(document).ready(function () {
    if ($(".rs-cursor-developer").length) {
      CursorDeveloper.init();
    }
  });

  // Expose to global scope
  window.CursorDeveloper = CursorDeveloper;
})(jQuery);
