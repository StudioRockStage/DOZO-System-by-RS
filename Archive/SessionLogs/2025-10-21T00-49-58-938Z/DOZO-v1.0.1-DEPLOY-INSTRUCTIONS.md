# 🚀 Instrucciones de Deploy - Warranty System RS v1.0.1

**Generado:** 2025-10-19T08:20:17.340Z  
**Sistema:** DOZO v7.9 by RockStage Solutions

---

## ✅ Archivos Preparados

Todos los archivos necesarios para el deploy están listos en:

```
~/Documents/DOZO System by RS/Empaquetado/Ready/
├── warranty-system-rs-v1.0.1.zip  (2.66 MB)
└── update.json
```

---

## 🔐 Información del Paquete

- **SHA256:** `1c11f2270be7d29217223cf746a5ca2ae2b93a588f4136d77c2259cceeece02e`
- **Tamaño:** 2.66 MB
- **Versión:** 1.0.1
- **Características:** SmartCategoryPanel v1.1.0 integrado

---

## 📡 Opción 1: Deploy Manual via FTP

### Paso 1: Conectar al servidor FTP

**Opciones de cliente FTP:**
- FileZilla (recomendado)
- Cyberduck
- Transmit (macOS)
- Terminal: `ftp ftp.vapedot.mx`

**Credenciales sugeridas:**
```
Host: ftp.vapedot.mx
Port: 21
Usuario: u461169968.vapedotmx
Password: RS@2025secure
```

**⚠️ IMPORTANTE:** Si las credenciales anteriores no funcionan:
1. Verifica con tu proveedor de hosting
2. Revisa el panel de control (cPanel/Plesk)
3. Genera nuevas credenciales FTP si es necesario

### Paso 2: Navegar al directorio correcto

```
/public_html/updates/warranty-system-rs/
```

**Si el directorio no existe, créalo.**

### Paso 3: Subir archivos

Arrastra o sube los siguientes archivos:
1. `warranty-system-rs-v1.0.1.zip`
2. `update.json`

**Modo de transferencia:** Binary (importante para ZIPs)

### Paso 4: Verificar permisos

Asegúrate de que los archivos tengan permisos:
- `warranty-system-rs-v1.0.1.zip` → 644 (rw-r--r--)
- `update.json` → 644 (rw-r--r--)

---

## 🌐 Opción 2: Verificar URLs después de subir

Una vez subidos los archivos, verifica que sean accesibles:

### ZIP del Plugin
```
https://updates.vapedot.mx/warranty-system-rs/warranty-system-rs-v1.0.1.zip
```

Debe descargar el archivo (2.66 MB)

### update.json
```
https://updates.vapedot.mx/warranty-system-rs/update.json
```

Debe mostrar:
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

## 🔧 Opción 3: Troubleshooting Credenciales FTP

Si las credenciales no funcionan, sigue estos pasos:

### A. Verificar en cPanel

1. Accede a cPanel: `https://vapedot.mx:2083`
2. Ve a "FTP Accounts"
3. Busca la cuenta para `updates.vapedot.mx`
4. Verifica usuario y password
5. Si es necesario, cambia el password o crea nueva cuenta

### B. Probar conexión FTP desde Terminal

```bash
ftp ftp.vapedot.mx
# Ingresa usuario y password cuando se solicite
# Si conecta: cd /public_html/updates/warranty-system-rs/
# Si falla: verifica credenciales
```

### C. Usar FileZilla para debug

1. Abre FileZilla
2. Ingresa credenciales
3. Activa "Show debug info" en settings
4. Intenta conectar
5. Lee los mensajes de error para diagnosticar

### D. Contactar con hosting

Si nada funciona:
- Soporte de hosting: support@tu-proveedor.com
- Solicita: "Verificar acceso FTP al subdominio updates.vapedot.mx"
- Pide credenciales válidas o ayuda para crear cuenta FTP

---

## ✅ Checklist Post-Deploy

Después de subir los archivos, verifica:

- [ ] ZIP accesible via URL pública
- [ ] update.json accesible y con formato correcto
- [ ] Tamaño del ZIP remoto coincide con local (2.66 MB)
- [ ] No hay archivos duplicados en el directorio
- [ ] Permisos correctos (644)
- [ ] Sin errores 404 o 403

---

## 🧪 Probar Actualización en WordPress

Una vez confirmado el deploy:

1. Instala Warranty System RS v1.0.0 en un WordPress de prueba
2. Ve a `Plugins → Actualizaciones`
3. Debe aparecer update disponible a v1.0.1
4. Haz clic en "Actualizar"
5. Verifica que actualice correctamente

---

## 📊 Próximos Pasos

Después del deploy exitoso:

1. Documentar las credenciales FTP correctas
2. Actualizar scripts con credenciales verificadas
3. Crear backup de los archivos subidos
4. Monitorear logs de actualizaciones

---

## 📞 Soporte

**Desarrollado por:** RockStage Solutions  
**Sistema DOZO:** v7.9  
**Fecha:** 2025-10-19

---

*Generado automáticamente por DOZO Local Prepare System*
