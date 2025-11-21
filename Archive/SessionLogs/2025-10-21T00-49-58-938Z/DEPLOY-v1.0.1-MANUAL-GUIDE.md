# 🚀 Guía de Deploy Manual - Warranty System RS v1.0.1

**Fecha:** 2025-10-19  
**Sistema:** DOZO v7.9 by RockStage Solutions  
**Estado:** ✅ Build certificado y listo para deploy

---

## ⚠️ Nota sobre Deploy Automático

Los intentos de deploy automático vía FTP desde Node.js han encontrado problemas de timeout/conexión. Esto puede deberse a:

- Restricciones de red/firewall
- Configuración del servidor FTP
- Limitaciones del sandbox de ejecución

**Solución:** Deploy manual usando uno de los métodos siguientes.

---

## 📦 Archivos a Subir

### Build Certificado

```
Archivo:  warranty-system-rs-v1.0.1.zip
Origen:   ~/Documents/DOZO System by RS/Latest Builds/Warranty System RS/
Tamaño:   2.66 MB
SHA256:   1c11f2270be7d29217223cf746a5ca2ae2b93a588f4136d77c2259cceeece02e
```

### update.json

```json
{
  "version": "1.0.1",
  "download_url": "https://updates.vapedot.mx/warranty-system-rs/warranty-system-rs-v1.0.1.zip",
  "tested": "6.7.1",
  "requires": "6.0",
  "requires_php": "7.4"
}
```

---

## 🔐 Credenciales FTP

```
Host:     82.29.86.182
Port:     21
Usuario:  u461169968
Password: 490?v0Lin9>x8?Mz
```

**Directorio destino:** `/public_html/updates/warranty-system-rs/`

---

## 🚀 Método 1: Script Bash (Recomendado)

### Ejecutar el script automático

```bash
cd "/Users/davidalejandroperezrea/Documents/Dozo System by RS"
./dozo-deploy-ftp-manual.sh
```

Este script:

- ✅ Crea update.json automáticamente
- ✅ Conecta vía FTP nativo
- ✅ Sube ambos archivos
- ✅ Verifica la subida

---

## 🖥️ Método 2: Cliente FTP Gráfico (FileZilla)

### Paso 1: Descargar FileZilla

- Descarga: https://filezilla-project.org/

### Paso 2: Conectar al servidor

1. Abrir FileZilla
2. Ir a: **Archivo → Gestor de Sitios → Nuevo sitio**
3. Configurar:
   ```
   Protocolo:    FTP
   Servidor:     82.29.86.182
   Puerto:       21
   Cifrado:      Solo FTP simple
   Tipo acceso:  Normal
   Usuario:      u461169968
   Contraseña:   490?v0Lin9>x8?Mz
   ```
4. Conectar

### Paso 3: Navegar al directorio

```
/public_html/updates/warranty-system-rs/
```

Si no existe, créalo.

### Paso 4: Subir archivos

1. Panel local: Navega a `~/Documents/DOZO System by RS/Latest Builds/Warranty System RS/`
2. Arrastra `warranty-system-rs-v1.0.1.zip` al panel remoto
3. Crea `update.json` con el contenido mostrado arriba y súbelo

### Paso 5: Verificar permisos

- Ambos archivos deben tener permisos `644` (rw-r--r--)

---

## 🌐 Método 3: FTP desde Terminal macOS

### Conectar manualmente

```bash
ftp 82.29.86.182
# Usuario: u461169968
# Password: 490?v0Lin9>x8?Mz
```

### Una vez conectado:

```ftp
binary
cd /public_html/updates/warranty-system-rs
lcd ~/Documents/DOZO\ System\ by\ RS/Latest\ Builds/Warranty\ System\ RS
put warranty-system-rs-v1.0.1.zip
```

### Para update.json:

```bash
# Crear update.json localmente primero
cat > /tmp/update.json << 'EOF'
{
  "version": "1.0.1",
  "download_url": "https://updates.vapedot.mx/warranty-system-rs/warranty-system-rs-v1.0.1.zip",
  "tested": "6.7.1",
  "requires": "6.0",
  "requires_php": "7.4"
}
EOF

# Luego en FTP:
lcd /tmp
put update.json
```

---

## ✅ Validación Post-Deploy

Después de subir los archivos, verifica:

### 1. Verificar ZIP

```bash
curl -I https://updates.vapedot.mx/warranty-system-rs/warranty-system-rs-v1.0.1.zip
```

Debe retornar:

- HTTP/2 200 OK
- Content-Length: ~2792117

### 2. Verificar update.json

```bash
curl https://updates.vapedot.mx/warranty-system-rs/update.json
```

Debe retornar:

```json
{
  "version": "1.0.1",
  "download_url": "https://updates.vapedot.mx/warranty-system-rs/warranty-system-rs-v1.0.1.zip",
  "tested": "6.7.1",
  "requires": "6.0",
  "requires_php": "7.4"
}
```

### 3. Verificar SHA256 (opcional)

```bash
curl -s https://updates.vapedot.mx/warranty-system-rs/warranty-system-rs-v1.0.1.zip | shasum -a 256
```

Debe coincidir con:

```
1c11f2270be7d29217223cf746a5ca2ae2b93a588f4136d77c2259cceeece02e
```

---

## 🧪 Probar Actualización en WordPress

Una vez verificadas las URLs:

### Paso 1: Instalar v1.0.0 en WordPress de prueba

```
WordPress Admin → Plugins → Añadir nuevo → Subir plugin
→ Seleccionar: warranty-system-rs-v1.0.0.zip
→ Instalar y activar
```

### Paso 2: Verificar actualización disponible

```
WordPress Admin → Dashboard → Actualizaciones
```

Debe aparecer:

```
Warranty System RS
Versión 1.0.0 instalada
Actualización a 1.0.1 disponible
```

### Paso 3: Actualizar

- Hacer clic en "Actualizar ahora"
- Verificar que actualice correctamente
- Confirmar que aparezca versión 1.0.1
- Probar menú "Smart Categories"
- Verificar shortcode `[rs_smart_category_panel]`

---

## 📋 Checklist de Deploy

### Pre-Deploy

- [x] Build v1.0.1 certificado
- [x] SHA256 calculado
- [x] update.json generado
- [x] Credenciales FTP verificadas
- [x] Instrucciones de deploy creadas

### Durante Deploy (Manual)

- [ ] Conectar via FTP al servidor
- [ ] Navegar a /public_html/updates/warranty-system-rs/
- [ ] Subir warranty-system-rs-v1.0.1.zip
- [ ] Subir update.json
- [ ] Verificar permisos (644)

### Post-Deploy

- [ ] Verificar URL del ZIP (curl o navegador)
- [ ] Verificar URL del JSON (curl o navegador)
- [ ] Verificar SHA256 del archivo remoto
- [ ] Probar actualización en WordPress staging
- [ ] Documentar deploy exitoso

---

## 🔧 Troubleshooting

### Si FileZilla no conecta:

1. Verifica que estás usando "FTP simple" (no SFTP ni FTPS)
2. Prueba con "Modo activo" y "Modo pasivo"
3. Desactiva temporalmente el firewall
4. Verifica las credenciales en cPanel

### Si las URLs no funcionan:

1. Espera 5-10 minutos (propagación CDN/DNS)
2. Verifica que los archivos estén en el directorio correcto
3. Comprueba permisos de archivos
4. Revisa configuración de .htaccess

### Si WordPress no detecta la actualización:

1. Verifica que update.json esté bien formateado
2. Comprueba la URL en el campo `download_url`
3. Limpia caché de WordPress
4. Verifica configuración del plugin updater

---

## 📞 Soporte

**Desarrollado por:** RockStage Solutions  
**Sistema DOZO:** v7.9  
**Build:** v1.0.1  
**Fecha:** 2025-10-19

---

## ✨ Resumen

El build **Warranty System RS v1.0.1** está completamente preparado, certificado y listo para deploy. Solo requiere subida manual via FTP debido a restricciones de red en el entorno de automatización.

**Usa el método que prefieras:**

1. ✅ Script bash: `./dozo-deploy-ftp-manual.sh`
2. ✅ FileZilla (interfaz gráfica)
3. ✅ FTP desde terminal

**Todos los archivos están listos en `Latest Builds/Warranty System RS/`**

---

_Generado automáticamente por DOZO System - Manual Deploy Guide_
