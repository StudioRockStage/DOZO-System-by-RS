# 🔧 DOZO FTP Troubleshooting Guide

## Estado Actual

✅ **Servidor FTP alcanzable:** `ftp.vapedot.mx` (82.29.86.182:21)  
❌ **Autenticación:** Login incorrect (Error 530)

---

## 🔍 Diagnóstico

El servidor FTP está **funcionando correctamente** y **aceptando conexiones**, pero las credenciales actuales no son válidas:

```
Usuario: u461169968.vapedotmx
Password: RS@2025secure
```

---

## ✅ Soluciones

### Opción 1: Verificar Credenciales Reales

1. **Accede a tu Panel de Control de Hosting**
   - cPanel / Plesk / DirectAdmin
   - Ve a la sección "FTP Accounts" o "Cuentas FTP"

2. **Verifica o Crea una Cuenta FTP**
   - Usuario FTP correcto
   - Contraseña FTP correcta
   - Directorio: `/public_html/updates/warranty-system/`

3. **Prueba Manualmente con FileZilla**
   - Host: `ftp.vapedot.mx`
   - Puerto: `21`
   - Usuario: [tu usuario FTP]
   - Password: [tu password FTP]
   - Si FileZilla conecta, usa esas mismas credenciales

### Opción 2: Formatos Alternativos de Usuario

Algunos servidores FTP aceptan diferentes formatos:

```bash
# Formato 1: Usuario con dominio (actual)
u461169968.vapedotmx

# Formato 2: Usuario simple
u461169968

# Formato 3: Usuario con @dominio
u461169968@vapedot.mx

# Formato 4: Email completo
ftp@vapedot.mx
```

### Opción 3: Resetear Password FTP

En tu panel de hosting:
1. Ve a "FTP Accounts"
2. Encuentra el usuario FTP
3. Haz clic en "Change Password"
4. Genera una nueva contraseña segura
5. Actualiza `Scripts/ftp-config.json`

---

## 🔄 Actualizar Credenciales

### Edita el archivo de configuración:

```bash
nano Scripts/ftp-config.json
```

O abre con tu editor favorito:

```json
{
  "host": "ftp.vapedot.mx",
  "user": "TU_USUARIO_FTP_CORRECTO",
  "password": "TU_PASSWORD_FTP_CORRECTO",
  "port": 21,
  "secure": false,
  "remotePath": "/public_html/updates/warranty-system/"
}
```

### Luego prueba de nuevo:

```bash
node dozo-phase11.1-update-credentials.js
```

---

## 🧪 Herramientas de Testing

### Script 1: Test Detallado
```bash
node dozo-phase11.1-update-credentials.js
```

Proporciona:
- ✅ Conexión al servidor
- ✅ Acceso al directorio
- ✅ Permisos de escritura
- 📄 Reporte detallado

### Script 2: Setup Automático
```bash
node dozo-phase11.1-ftp-setup.js
```

Configura:
- Credenciales FTP
- Backup cifrado
- Validación automática

---

## 📡 Información del Servidor

Basado en las pruebas realizadas:

```
Host: ftp.vapedot.mx
IP: 82.29.86.182
Puerto: 21
Protocolo: FTP (sin encriptación)
Estado del servidor: ✅ ONLINE y respondiendo
Autenticación: ❌ Credenciales incorrectas
```

---

## 🔐 Seguridad

### Opciones de Seguridad Mejorada

Si tu servidor soporta FTPS o SFTP:

```json
{
  "host": "ftp.vapedot.mx",
  "user": "tu_usuario",
  "password": "tu_password",
  "port": 990,          // Puerto FTPS
  "secure": true        // Habilitar TLS/SSL
}
```

O para SFTP (requiere módulo diferente):

```json
{
  "host": "ftp.vapedot.mx",
  "user": "tu_usuario",
  "password": "tu_password",
  "port": 22,           // Puerto SFTP
  "protocol": "sftp"
}
```

---

## 🆘 Soporte

### Reportes Generados

Todos los tests generan reportes en:

```
to chat gpt/Global/
  - DOZO-FTP-Ready.json          → Estado de setup
  - DOZO-FTP-Test-Report.json    → Resultados detallados de pruebas
```

### Contactar Hosting

Si sigues teniendo problemas, contacta a tu proveedor de hosting con:

1. **Información de tu cuenta**
2. **Dirección del sitio:** vapedot.mx
3. **Problema:** No puedo conectar vía FTP con las credenciales
4. **Pregunta:** ¿Cuál es el formato correcto del usuario FTP?

---

## ✨ Modo Alternativo: Deployment Manual

Si necesitas proceder sin FTP automático, puedes:

1. **Subir Archivos Manualmente**
   - Via cPanel File Manager
   - Via FileZilla
   - Via SFTP

2. **Archivos a Subir:**
   ```
   Empaquetado/Ready/Warranty_System_v7.7.6.zip
   Empaquetado/Ready/update.json
   ```

3. **Destino:**
   ```
   /public_html/updates/warranty-system/
   ```

4. **Verificar URLs:**
   ```
   https://updates.vapedot.mx/warranty-system/update.json
   https://updates.vapedot.mx/warranty-system/Warranty_System_v7.7.6.zip
   ```

---

## 📋 Checklist de Verificación

Antes de contactar soporte, verifica:

- [ ] Usuario FTP es correcto (prueba diferentes formatos)
- [ ] Password FTP es correcto (sin espacios adicionales)
- [ ] Puerto es 21 (FTP estándar)
- [ ] El servidor `ftp.vapedot.mx` resuelve correctamente
- [ ] No hay firewall bloqueando el puerto 21
- [ ] Probaste con cliente FTP gráfico (FileZilla)
- [ ] El directorio destino existe: `/public_html/updates/warranty-system/`

---

**Última actualización:** 2025-10-18  
**DOZO System by RockStage Solutions**

