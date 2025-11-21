/**
 * RockStage Warranty System - Redesigned Public Form JavaScript
 * Modern, fluid interactions with enhanced UX
 * Version: 2.0 (DOZO Compliant)
 */

// ============================================
// GLOBAL STATE
// ============================================
let currentStep = 1;
let uploadedFiles = [];
let formData = {};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ RockStage Warranty Form v2.0 - Initialized");

  setupFileUpload();
  setupWhatsAppButton();
  setupTextareaCounter();
  updateProgress();
  addInputAnimations();

  // Prevent form submission on Enter key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
      e.preventDefault();
    }
  });
});

// ============================================
// STEP NAVIGATION
// ============================================
function nextStep(stepNumber) {
  if (!validateStep(currentStep)) {
    shakeInvalidFields();
    return;
  }

  saveStepData(currentStep);

  // Animate current step completion
  const currentStepEl = document.querySelector(
    `.rs-step[data-step="${currentStep}"]`,
  );
  if (currentStepEl) {
    currentStepEl.classList.add("completed");
    currentStepEl.classList.remove("active");

    // Celebration animation for completed step
    confettiEffect(currentStepEl);
  }

  // Hide current content with fade out
  const currentContent = document.getElementById(`step${currentStep}`);
  if (currentContent) {
    currentContent.style.animation = "fadeOut 0.3s ease";
    setTimeout(() => {
      currentContent.classList.remove("active");
      currentContent.style.animation = "";
    }, 300);
  }

  // Update step
  currentStep = stepNumber;

  // Show next content with delay for smooth transition
  setTimeout(() => {
    const nextContent = document.getElementById(`step${stepNumber}`);
    if (nextContent) {
      nextContent.classList.add("active");
    }

    const nextStepEl = document.querySelector(
      `.rs-step[data-step="${stepNumber}"]`,
    );
    if (nextStepEl) {
      nextStepEl.classList.add("active");
    }

    updateProgress();
    smoothScrollToTop();
  }, 300);
}

function prevStep(stepNumber) {
  // Fade out current
  const currentContent = document.getElementById(`step${currentStep}`);
  if (currentContent) {
    currentContent.style.animation = "fadeOut 0.3s ease";
    setTimeout(() => {
      currentContent.classList.remove("active");
      currentContent.style.animation = "";
    }, 300);
  }

  const currentStepEl = document.querySelector(
    `.rs-step[data-step="${currentStep}"]`,
  );
  if (currentStepEl) {
    currentStepEl.classList.remove("active");
  }

  currentStep = stepNumber;

  // Show previous with delay
  setTimeout(() => {
    const prevContent = document.getElementById(`step${stepNumber}`);
    if (prevContent) {
      prevContent.classList.add("active");
    }

    const prevStepEl = document.querySelector(
      `.rs-step[data-step="${stepNumber}"]`,
    );
    if (prevStepEl) {
      prevStepEl.classList.add("active");
      prevStepEl.classList.remove("completed");
    }

    updateProgress();
    smoothScrollToTop();
  }, 300);
}

function updateProgress() {
  const progressLine = document.getElementById("progressLine");
  if (!progressLine) return;

  const progress = ((currentStep - 1) / 3) * 100;
  progressLine.style.width = progress + "%";

  // Update aria attributes
  const progressContainer = document.querySelector(".rs-progress-container");
  if (progressContainer) {
    progressContainer.setAttribute("aria-valuenow", currentStep);
  }
}

function smoothScrollToTop() {
  const formCard = document.querySelector(".rs-form-card");
  if (formCard) {
    formCard.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// ============================================
// VALIDATION
// ============================================
function validateStep(step) {
  switch (step) {
    case 1:
      return validateStep1();
    case 2:
      return validateStep2();
    case 3:
      return validateStep3();
    case 4:
      return validateStep4();
    default:
      return true;
  }
}

function validateStep1() {
  const name = document.getElementById("customer_name");
  const email = document.getElementById("customer_email");
  const phone = document.getElementById("customer_phone");
  const order = document.getElementById("order_number");

  let isValid = true;

  if (!name.value.trim()) {
    markFieldInvalid(name, "El nombre es requerido");
    isValid = false;
  } else {
    markFieldValid(name);
  }

  if (!email.value.trim()) {
    markFieldInvalid(email, "El email es requerido");
    isValid = false;
  } else if (!isValidEmail(email.value)) {
    markFieldInvalid(email, "Email inválido");
    isValid = false;
  } else {
    markFieldValid(email);
  }

  if (!phone.value.trim()) {
    markFieldInvalid(phone, "El teléfono es requerido");
    isValid = false;
  } else {
    markFieldValid(phone);
  }

  if (!order.value.trim()) {
    markFieldInvalid(order, "El número de pedido es requerido");
    isValid = false;
  } else {
    markFieldValid(order);
  }

  if (!isValid) {
    showNotification(
      "Por favor completa todos los campos correctamente",
      "error",
    );
  }

  return isValid;
}

function validateStep2() {
  const product = document.getElementById("product_id");

  if (!product.value) {
    markFieldInvalid(product, "Selecciona un producto");
    showNotification("Debes seleccionar un producto", "error");
    return false;
  }

  markFieldValid(product);
  return true;
}

function validateStep3() {
  const description = document.getElementById("description");
  let isValid = true;

  if (!description.value.trim() || description.value.trim().length < 20) {
    markFieldInvalid(
      description,
      "La descripción debe tener al menos 20 caracteres",
    );
    showNotification(
      "Describe el problema con al menos 20 caracteres",
      "error",
    );
    isValid = false;
  } else {
    markFieldValid(description);
  }

  if (uploadedFiles.length === 0) {
    showNotification(
      "Debes subir al menos 1 foto o video del defecto",
      "error",
    );
    highlightUploadArea();
    isValid = false;
  }

  return isValid;
}

function validateStep4() {
  const termsChecked = document.getElementById("termsCheckbox");

  if (!termsChecked.checked) {
    showNotification("Debes aceptar los términos y condiciones", "error");
    highlightTermsCheckbox();
    return false;
  }

  return true;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function markFieldInvalid(field, message) {
  field.style.borderColor = "var(--rs-error)";
  field.style.animation = "shake 0.4s ease";

  // Remove existing error message
  const existingError = field.parentElement.querySelector(".rs-field-error");
  if (existingError) {
    existingError.remove();
  }

  // Add error message
  const errorMsg = document.createElement("div");
  errorMsg.className = "rs-field-error";
  errorMsg.textContent = message;
  errorMsg.style.cssText = `
        color: var(--rs-error);
        font-size: 0.875rem;
        margin-top: 0.5rem;
        animation: slideDown 0.3s ease;
    `;
  field.parentElement.appendChild(errorMsg);

  setTimeout(() => {
    field.style.animation = "";
  }, 400);
}

function markFieldValid(field) {
  field.style.borderColor = "var(--rs-success)";

  const existingError = field.parentElement.querySelector(".rs-field-error");
  if (existingError) {
    existingError.remove();
  }

  setTimeout(() => {
    field.style.borderColor = "";
  }, 2000);
}

function shakeInvalidFields() {
  const invalidFields = document.querySelectorAll(
    ".rs-form-input:invalid, .rs-form-select:invalid, .rs-form-textarea:invalid",
  );
  invalidFields.forEach((field) => {
    field.style.animation = "shake 0.4s ease";
    setTimeout(() => {
      field.style.animation = "";
    }, 400);
  });
}

function highlightUploadArea() {
  const uploadArea = document.getElementById("fileUploadArea");
  if (uploadArea) {
    uploadArea.style.animation = "pulse 0.6s ease 3";
    uploadArea.style.borderColor = "var(--rs-error)";
    setTimeout(() => {
      uploadArea.style.animation = "";
      uploadArea.style.borderColor = "";
    }, 2000);
  }
}

function highlightTermsCheckbox() {
  const checkbox = document.querySelector(".rs-checkbox-container");
  if (checkbox) {
    checkbox.style.animation = "shake 0.4s ease";
    setTimeout(() => {
      checkbox.style.animation = "";
    }, 400);
  }
}

// ============================================
// SAVE STEP DATA
// ============================================
function saveStepData(step) {
  switch (step) {
    case 1:
      formData.customer = {
        name: document.getElementById("customer_name").value,
        email: document.getElementById("customer_email").value,
        phone: document.getElementById("customer_phone").value,
        orderNumber: document.getElementById("order_number").value,
      };
      break;
    case 2:
      formData.product = {
        id: document.getElementById("product_id").value,
        purchaseDate: document.getElementById("purchase_date").value,
      };
      break;
    case 3:
      formData.problem = {
        description: document.getElementById("description").value,
        files: uploadedFiles,
      };
      break;
  }

  console.log("📦 Step data saved:", step, formData);
}

// ============================================
// FILE UPLOAD
// ============================================
function setupFileUpload() {
  const fileUploadArea = document.getElementById("fileUploadArea");
  const fileInput = document.getElementById("fileInput");

  if (!fileUploadArea || !fileInput) return;

  // Click to upload
  fileUploadArea.addEventListener("click", () => fileInput.click());

  // Keyboard accessibility
  fileUploadArea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInput.click();
    }
  });

  // Drag and drop
  fileUploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    fileUploadArea.classList.add("dragover");
  });

  fileUploadArea.addEventListener("dragleave", () => {
    fileUploadArea.classList.remove("dragover");
  });

  fileUploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    fileUploadArea.classList.remove("dragover");
    handleFiles(e.dataTransfer.files);
  });

  // File input change
  fileInput.addEventListener("change", function () {
    handleFiles(this.files);
  });
}

function handleFiles(files) {
  Array.from(files).forEach((file) => {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    // Validate file type
    if (!isImage && !isVideo) {
      showNotification("Solo se permiten imágenes y videos", "error");
      return;
    }

    // Get limits from rsWarranty config
    const maxPhotoSize = rsWarranty.fileLimits.maxPhotoSize || 5242880;
    const maxVideoSize = rsWarranty.fileLimits.maxVideoSize || 52428800;

    // Validate file size
    if (isImage && file.size > maxPhotoSize) {
      showNotification(
        `Imagen muy grande (máx ${Math.round(maxPhotoSize / 1024 / 1024)}MB)`,
        "error",
      );
      return;
    }

    if (isVideo && file.size > maxVideoSize) {
      showNotification(
        `Video muy grande (máx ${Math.round(maxVideoSize / 1024 / 1024)}MB)`,
        "error",
      );
      return;
    }

    // Validate photo count
    const currentPhotos = uploadedFiles.filter((f) =>
      f.type.startsWith("image/"),
    ).length;
    const maxPhotos = rsWarranty.fileLimits.maxPhotos || 5;

    if (isImage && currentPhotos >= maxPhotos) {
      showNotification(`Máximo ${maxPhotos} fotos permitidas`, "warning");
      return;
    }

    // Validate video count
    const currentVideos = uploadedFiles.filter((f) =>
      f.type.startsWith("video/"),
    ).length;
    if (isVideo && currentVideos >= 1) {
      showNotification("Solo se permite 1 video", "warning");
      return;
    }

    // Add file
    uploadedFiles.push(file);
    addFileToList(file);
    showNotification(
      `${isVideo ? "Video" : "Imagen"} agregado exitosamente`,
      "success",
    );
  });
}

function addFileToList(file) {
  const fileList = document.getElementById("fileList");
  if (!fileList) return;

  const isVideo = file.type.startsWith("video/");

  const fileItem = document.createElement("div");
  fileItem.className = "rs-file-item";
  fileItem.dataset.filename = file.name;

  const iconSvg = isVideo
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="24" height="24" stroke-width="2">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
            <line x1="7" y1="2" x2="7" y2="22"/>
            <line x1="17" y1="2" x2="17" y2="22"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <line x1="2" y1="7" x2="7" y2="7"/>
            <line x1="2" y1="17" x2="7" y2="17"/>
            <line x1="17" y1="17" x2="22" y2="17"/>
            <line x1="17" y1="7" x2="22" y2="7"/>
        </svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="24" height="24" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
        </svg>`;

  fileItem.innerHTML = `
        <div class="rs-file-icon">${iconSvg}</div>
        <div class="rs-file-info">
            <div class="rs-file-name">${file.name}</div>
            <div class="rs-file-size">${formatFileSize(file.size)}</div>
        </div>
        <button class="rs-file-remove" onclick="removeFile('${escapeHtml(file.name)}')" type="button" aria-label="Eliminar archivo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </button>
    `;

  fileList.appendChild(fileItem);
}

function removeFile(filename) {
  uploadedFiles = uploadedFiles.filter((f) => f.name !== filename);

  const fileItem = document.querySelector(
    `.rs-file-item[data-filename="${CSS.escape(filename)}"]`,
  );
  if (fileItem) {
    fileItem.style.animation = "slideOutLeft 0.3s ease";
    setTimeout(() => {
      fileItem.remove();
    }, 300);
  }

  showNotification("Archivo eliminado", "info");
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// ============================================
// FORM SUBMISSION
// ============================================
function submitForm() {
  if (!validateStep(4)) {
    return;
  }

  saveStepData(4);

  // Get submit button
  const submitBtn = document.querySelector(".rs-btn-submit");
  if (submitBtn) {
    submitBtn.classList.add("loading");
    submitBtn.disabled = true;
  }

  // Show loading notification
  showNotification("Enviando solicitud...", "info");

  // Prepare FormData for file upload
  const ajaxFormData = new FormData();
  ajaxFormData.append("action", "rs_submit_warranty");
  ajaxFormData.append("nonce", rsWarranty.nonce);

  // Add customer data
  ajaxFormData.append("customer_name", formData.customer.name);
  ajaxFormData.append("customer_email", formData.customer.email);
  ajaxFormData.append("customer_phone", formData.customer.phone);
  ajaxFormData.append("order_id", formData.customer.orderNumber);

  // Add product data
  ajaxFormData.append("product_id", formData.product.id);
  ajaxFormData.append("purchase_date", formData.product.purchaseDate);

  // Add problem description
  ajaxFormData.append("description", formData.problem.description);

  // Add uploaded files
  uploadedFiles.forEach((file, index) => {
    const fileType = file.type.startsWith("video/")
      ? "video_demostracion"
      : "foto_defecto";
    ajaxFormData.append(fileType, file);
  });

  // Send AJAX request to WordPress
  jQuery.ajax({
    url: rsWarranty.ajaxUrl,
    type: "POST",
    data: ajaxFormData,
    processData: false,
    contentType: false,
    success: function (response) {
      if (submitBtn) {
        submitBtn.classList.remove("loading");
        submitBtn.disabled = false;
      }

      if (response.success) {
        const warrantyNumber =
          response.data.warranty_number || generateWarrantyNumber();
        showSuccessScreen(warrantyNumber);
        showNotification("¡Solicitud enviada exitosamente!", "success");
        console.log("✅ Warranty Created:", response.data);
      } else {
        showNotification(
          response.data.message || "Error al enviar la solicitud",
          "error",
        );
      }
    },
    error: function (xhr, status, error) {
      if (submitBtn) {
        submitBtn.classList.remove("loading");
        submitBtn.disabled = false;
      }

      console.error("❌ AJAX Error:", error);
      showNotification(
        "Error de conexión. Por favor intenta nuevamente.",
        "error",
      );
    },
  });
}

function showSuccessScreen(warrantyNumber) {
  // Hide all steps
  document.querySelectorAll(".rs-step-content").forEach((content) => {
    content.style.animation = "fadeOut 0.3s ease";
    setTimeout(() => {
      content.classList.remove("active");
    }, 300);
  });

  // Show success screen
  setTimeout(() => {
    const successScreen = document.getElementById("successScreen");
    if (successScreen) {
      successScreen.classList.add("active");

      const warrantyNumberEl = successScreen.querySelector(".warranty-number");
      if (warrantyNumberEl) {
        warrantyNumberEl.textContent = warrantyNumber;
      }

      // Trigger confetti celebration
      celebrationConfetti();
    }

    smoothScrollToTop();
  }, 400);
}

function generateWarrantyNumber() {
  const prefix = "GAR-RS";
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 99999)
    .toString()
    .padStart(5, "0");
  return `${prefix}-${year}-${random}`;
}

// ============================================
// WHATSAPP
// ============================================
function setupWhatsAppButton() {
  // Already handled in HTML
}

function openWhatsApp() {
  let phone = "5215512345678";
  let message = "Hola, tengo una consulta sobre mi garantía";

  if (typeof rsWarranty !== "undefined" && rsWarranty.whatsapp) {
    phone = rsWarranty.whatsapp.number || phone;
    message = rsWarranty.whatsapp.message || message;

    // Replace warranty ID if available
    const warrantyNumberEl = document.querySelector(".warranty-number");
    if (warrantyNumberEl) {
      message = message.replace("{garantia_id}", warrantyNumberEl.textContent);
    }
  }

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

// ============================================
// TEXTAREA CHARACTER COUNTER
// ============================================
function setupTextareaCounter() {
  const textarea = document.getElementById("description");
  const counter = document.getElementById("charCount");

  if (!textarea || !counter) return;

  textarea.addEventListener("input", function () {
    const count = this.value.length;
    counter.textContent = count;

    if (count >= 20) {
      counter.style.color = "var(--rs-success)";
    } else {
      counter.style.color = "var(--rs-text-tertiary)";
    }
  });
}

// ============================================
// INPUT ANIMATIONS
// ============================================
function addInputAnimations() {
  const inputs = document.querySelectorAll(
    ".rs-form-input, .rs-form-select, .rs-form-textarea",
  );

  inputs.forEach((input) => {
    input.addEventListener("focus", function () {
      this.parentElement.classList.add("focused");
    });

    input.addEventListener("blur", function () {
      this.parentElement.classList.remove("focused");
    });
  });
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================
function showNotification(message, type = "info") {
  // Remove existing notifications
  document.querySelectorAll(".rs-notification").forEach((n) => {
    n.style.animation = "slideOutRight 0.3s ease";
    setTimeout(() => n.remove(), 300);
  });

  const notification = document.createElement("div");
  notification.className = "rs-notification rs-notification-" + type;

  const colors = {
    success: "var(--rs-success)",
    error: "var(--rs-error)",
    warning: "var(--rs-warning)",
    info: "var(--rs-info)",
  };

  const icons = {
    success:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    error:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    warning:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  };

  notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <div style="color: ${colors[type]}; flex-shrink: 0;">${icons[type]}</div>
            <div>${message}</div>
        </div>
    `;

  notification.style.cssText = `
        border-color: ${colors[type]};
    `;

  document.body.appendChild(notification);

  // Auto-hide after 4 seconds
  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

// ============================================
// ANIMATION EFFECTS
// ============================================
function confettiEffect(element) {
  // Simple confetti celebration for step completion
  const rect = element.getBoundingClientRect();
  const colors = ["#FF8C00", "#FFA500", "#10b981", "#3b82f6"];

  for (let i = 0; i < 10; i++) {
    const confetti = document.createElement("div");
    confetti.style.cssText = `
            position: fixed;
            width: 8px;
            height: 8px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            top: ${rect.top + rect.height / 2}px;
            left: ${rect.left + rect.width / 2}px;
            border-radius: 50%;
            pointer-events: none;
            z-index: 10000;
        `;
    document.body.appendChild(confetti);

    const angle = Math.random() * Math.PI * 2;
    const velocity = 50 + Math.random() * 50;
    const xVel = Math.cos(angle) * velocity;
    const yVel = Math.sin(angle) * velocity;

    let x = 0,
      y = 0,
      opacity = 1;
    const animate = () => {
      x += xVel / 60;
      y += yVel / 60 + 2;
      opacity -= 0.02;

      confetti.style.transform = `translate(${x}px, ${y}px)`;
      confetti.style.opacity = opacity;

      if (opacity > 0) {
        requestAnimationFrame(animate);
      } else {
        confetti.remove();
      }
    };

    animate();
  }
}

function celebrationConfetti() {
  // Full screen confetti for success
  const colors = ["#FF8C00", "#FFA500", "#10b981", "#3b82f6", "#f59e0b"];
  const confettiCount = 50;

  for (let i = 0; i < confettiCount; i++) {
    setTimeout(() => {
      const confetti = document.createElement("div");
      confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                top: -20px;
                left: ${Math.random() * 100}%;
                border-radius: 50%;
                pointer-events: none;
                z-index: 10000;
            `;
      document.body.appendChild(confetti);

      const rotation = Math.random() * 360;
      let y = 0,
        opacity = 1;
      const speed = 2 + Math.random() * 3;

      const animate = () => {
        y += speed;
        opacity -= 0.01;

        confetti.style.transform = `translateY(${y}px) rotate(${rotation + y}deg)`;
        confetti.style.opacity = opacity;

        if (y < window.innerHeight && opacity > 0) {
          requestAnimationFrame(animate);
        } else {
          confetti.remove();
        }
      };

      animate();
    }, i * 30);
  }
}

// ============================================
// ADD ANIMATION KEYFRAMES
// ============================================
if (!document.getElementById("rs-animation-styles")) {
  const style = document.createElement("style");
  style.id = "rs-animation-styles";
  style.textContent = `
        @keyframes fadeOut {
            to { opacity: 0; transform: translateY(-10px); }
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
        @keyframes slideOutLeft {
            to { transform: translateX(-100%); opacity: 0; }
        }
    `;
  document.head.appendChild(style);
}

// ============================================
// EXPOSE TO GLOBAL SCOPE
// ============================================
window.nextStep = nextStep;
window.prevStep = prevStep;
window.submitForm = submitForm;
window.removeFile = removeFile;
window.openWhatsApp = openWhatsApp;

console.log("✅ RockStage Warranty Form v2.0 - All functions loaded");
