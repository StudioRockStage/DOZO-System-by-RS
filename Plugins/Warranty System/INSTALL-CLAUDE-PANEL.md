# 🤖 PANEL DE DESARROLLADOR CLAUDE AI

## Instalación en 5 Minutos

---

## 📦 ARCHIVOS INCLUIDOS

```
claude-developer-integration/
├── class-claude-developer-panel.php  (Backend PHP)
├── claude-developer.css              (Estilos del panel)
├── claude-developer.js               (Funcionalidad del chat)
└── INSTALL-CLAUDE.md                 (Esta guía)
```

---

## 🚀 INSTALACIÓN PASO A PASO

### **PASO 1: Subir Archivos**

Copia los archivos a tu plugin:

```bash
# Archivo PHP
wp-content/plugins/rockstage-warranty-system/includes/
  └── class-claude-developer-panel.php

# Archivos CSS y JS
wp-content/plugins/rockstage-warranty-system/assets/
  ├── css/claude-developer.css
  └── js/claude-developer.js
```

---

### **PASO 2: Incluir la Clase en el Plugin**

Edita: `rockstage-warranty-system.php`

Busca donde se cargan los includes (alrededor de la línea 50-80) y agrega:

```php
// Cargar panel de desarrollador Claude AI
if (is_admin()) {
    require_once plugin_dir_path(__FILE__) . 'includes/class-claude-developer-panel.php';
}
```

---

### **PASO 3: Obtener tu API Key de Anthropic**

1. Ve a: **https://console.anthropic.com/**
2. Crea una cuenta o inicia sesión
3. Ve a "API Keys" en el menú
4. Click en "Create Key"
5. Dale un nombre (ej: "RockStage Plugin")
6. **COPIA LA KEY** (comienza con `sk-ant-api03-...`)
7. ⚠️ **¡GUÁRDALA EN LUGAR SEGURO!** Solo se muestra una vez

---

### **PASO 4: Configurar API Key en WordPress**

**Opción A: Desde el Panel (Fácil)**
1. Ve a WordPress Admin
2. **RockStage > Desarrollador AI**
3. Pega tu API Key
4. Click "Guardar API Key"
5. Click "Probar Conexión"

**Opción B: En wp-config.php (Más Seguro)**

Edita `wp-config.php` y agrega ANTES de `/* That's all, stop editing! */`:

```php
// Claude AI API Key
define('RS_CLAUDE_API_KEY', 'sk-ant-api03-TU_API_KEY_AQUI');
```

---

### **PASO 5: ¡Listo! Úsalo**

1. Ve a **RockStage > Desarrollador AI**
2. Verás el chat con Claude
3. Escribe tu primera solicitud:

```
"Crea un nuevo diseño minimalista en escala de grises 
para el verificador de garantía"
```

4. Claude te responderá con el código completo
5. Usa los botones:
   - 📋 **Copiar Código**
   - 👁️ **Vista Previa**
   - ⬇️ **Aplicar al Plugin**

---

## 💡 EJEMPLOS DE USO

### **Ejemplo 1: Nuevo Diseño**
```
Crea un diseño moderno para el shortcode del verificador.
Usa colores en escala de grises y tipografía grande.
Incluye animaciones sutiles.
```

### **Ejemplo 2: Modificar Estilos**
```
Modifica el CSS del formulario actual para que tenga:
- Más espaciado entre campos
- Botones más grandes
- Efectos hover más suaves
```

### **Ejemplo 3: Nueva Funcionalidad**
```
Agrega un campo de búsqueda de productos en el formulario
que filtre en tiempo real mientras el usuario escribe.
```

### **Ejemplo 4: Optimización**
```
Revisa el JavaScript del formulario y optimízalo:
- Reduce el tamaño del archivo
- Mejora la performance
- Elimina código duplicado
```

### **Ejemplo 5: Crear Shortcode Nuevo**
```
Crea un shortcode [warranty_status] que muestre
una tarjeta con el estado de una garantía específica.
Diseño: moderno, con icono y colores según estado.
```

---

## 🎨 ACCIONES RÁPIDAS

En el panel lateral izquierdo verás botones de "Acciones Rápidas":

- 🎨 **Nuevo Diseño** - Generar diseños completos
- ✏️ **Modificar Estilo** - Ajustar estilos existentes
- 💬 **Agregar Chatbot** - Crear funcionalidades interactivas
- 📊 **Nuevo Shortcode** - Generar shortcodes personalizados
- ⚡ **Optimizar JS** - Mejorar performance
- ⭐ **Ideas UX** - Sugerencias de mejoras

**Haz click en cualquiera** y el prompt se agregará automáticamente al chat.

---

## 💰 COSTOS DE LA API

**Claude Sonnet 4** (Recomendado):
- **Input**: $3 por millón de tokens (~750,000 palabras)
- **Output**: $15 por millón de tokens

**Ejemplo Real**:
- Conversación típica: ~5,000 tokens
- Costo: **$0.015 centavos** (menos de 2 centavos)
- 100 conversaciones: ~$1.50 USD

**Es súper económico** para uso de desarrollo.

---

## 🔐 SEGURIDAD

### ⚠️ Importante:

1. **Nunca compartas tu API Key**
2. **Usa wp-config.php para producción**
3. **El panel solo es visible para administradores**
4. **Los códigos se guardan como "borradores" primero**

### Restringir Acceso:

En `class-claude-developer-panel.php` línea 24, cambia:

```php
'manage_options'  // Solo administradores
```

Por:

```php
'edit_plugins'    // Usuarios con permisos de editar plugins
```

---

## 🛠️ TROUBLESHOOTING

### **Problema: "API Key no configurada"**
**Solución**: 
- Verifica que copiaste la key completa
- Debe empezar con `sk-ant-api03-`
- Prueba la conexión

### **Problema: "Error de conexión"**
**Solución**:
- Verifica tu conexión a internet
- Revisa que tu servidor permita conexiones HTTPS externas
- Prueba con: `curl https://api.anthropic.com/v1/messages`

### **Problema: "El panel no aparece"**
**Solución**:
- Verifica que incluiste el archivo PHP
- Revisa que los archivos CSS/JS estén en la ruta correcta
- Limpia el caché de WordPress

### **Problema: "Claude no responde"**
**Solución**:
- Abre la consola del navegador (F12)
- Ve a la pestaña "Network"
- Envía un mensaje
- Revisa si hay errores en la llamada AJAX

---

## 📝 FLUJO DE TRABAJO RECOMENDADO

```
1. Tú: "Quiero un diseño X"
   ↓
2. Claude genera el código
   ↓
3. Copias el código
   ↓
4. Lo pegas en tus archivos
   ↓
5. Pruebas el resultado
   ↓
6. Si necesitas ajustes: "Modifica esto..."
   ↓
7. Claude ajusta el código
   ↓
8. Repites hasta tener el resultado perfecto
```

---

## 🎯 MEJORES PRÁCTICAS

### **Sé Específico**
❌ Malo: "Haz que se vea mejor"
✅ Bueno: "Aumenta el tamaño de fuente a 18px y agrega más padding"

### **Da Contexto**
❌ Malo: "Crea un formulario"
✅ Bueno: "Crea un formulario para el shortcode de verificación que tenga un campo de número de pedido y un botón"

### **Pide Ejemplos**
```
"Dame 3 opciones diferentes de diseño para elegir"
```

### **Itera en Pasos**
```
1. "Crea el HTML básico"
2. "Ahora agrega los estilos CSS"
3. "Finalmente el JavaScript para validación"
```

---

## 🚀 FUNCIONALIDADES AVANZADAS

### **Exportar Conversación**
- Click en el botón "Exportar"
- Se descarga un archivo .txt con toda la conversación
- Útil para documentación

### **Limpiar Chat**
- Click en "Limpiar conversación"
- Borra el historial (útil para empezar de cero)

### **Copiar Código**
- Claude marca automáticamente los bloques de código
- Click en "Copiar Código"
- Se copia al portapapeles

### **Aplicar al Plugin**
- Claude puede guardar el código directamente
- Se guarda como "borrador" primero
- Revisas antes de activar

---

## 📚 RECURSOS ADICIONALES

- **Documentación Claude**: https://docs.anthropic.com/
- **Console de Anthropic**: https://console.anthropic.com/
- **Límites de API**: https://docs.anthropic.com/en/api/rate-limits
- **Precios**: https://www.anthropic.com/pricing

---

## ❓ FAQ

**P: ¿Cuánto cuesta usar Claude?**
R: Muy poco. ~$0.015 por conversación típica. $1.50 por 100 conversaciones.

**P: ¿Puedo usar esto en producción?**
R: Sí, pero solo para desarrollo. No expongas el panel a usuarios finales.

**P: ¿Claude puede modificar archivos directamente?**
R: No automáticamente. Genera el código y tú decides si aplicarlo.

**P: ¿Qué pasa si se me acaba el crédito?**
R: Simplemente agrega más crédito en console.anthropic.com

**P: ¿Es seguro?**
R: Sí, toda la comunicación es HTTPS y tu API Key está protegida.

---

## 🎉 ¡YA ESTÁS LISTO!

Ahora tienes un **asistente de desarrollo AI** directamente en tu WordPress.

**Úsalo para**:
- ✅ Crear diseños nuevos en minutos
- ✅ Modificar estilos sin tocar CSS manualmente
- ✅ Generar nuevas funcionalidades
- ✅ Optimizar código existente
- ✅ Aprender mejores prácticas

**¡Experimenta y crea cosas increíbles!** 🚀

---

## 📞 SOPORTE

¿Problemas con la instalación?

1. Revisa esta guía completa
2. Verifica los logs de error de WordPress
3. Prueba la API Key en console.anthropic.com
4. Revisa la consola del navegador (F12)

---

**Versión**: 1.0
**Fecha**: Enero 2025
**Compatible con**: WordPress 5.8+, PHP 7.4+
