# 🚀 FASE 16.7 Quick Start Guide

## Auto-Updater System - Ready to Use

---

## 📋 Quick Commands

### Test the System

```bash
npm run release:test
```

### Create a Release

```bash
# Desktop app only
npm run release:create 2.7.0 desktop

# WordPress plugin only
npm run release:create 2.7.0 wordpress

# Both at once
npm run release:create 2.7.0 all
```

### Publish WordPress Plugin

```bash
npm run release:plugin
```

### Rollback to Previous Version

```bash
npm run release:rollback
```

---

## 🎯 What You Need

### For Desktop Releases

1. **Build your app:**

   ```bash
   npm run build:mac
   ```

2. **Copy DMG to releases:**

   ```bash
   cp DistributionBuild/*.dmg release/releases/dozo-desktop-2.7.0.dmg
   ```

3. **Publish:**
   ```bash
   npm run release:create 2.7.0 desktop
   ```

### For WordPress Plugin Releases

1. **Ensure plugin exists:**

   ```
   wordpress/plugins/dozo-system/
   ```

2. **Publish:**
   ```bash
   npm run release:plugin
   ```

---

## 🔌 Integration

### Add to Electron App

**File:** `AppBuild/main.js`

```javascript
import { DozoUpdater } from "../app-updater/updater.js";

app.whenReady().then(() => {
  const mainWindow = createWindow();

  // Initialize auto-updater
  const updater = new DozoUpdater(app, mainWindow);
  updater.initialize();
});
```

### Add to WordPress Plugin

**File:** `wordpress/plugins/dozo-system/dozo-system.php`

```php
// Include update checker
require_once plugin_dir_path(__FILE__) . 'wp-updater/plugin-update-checker.php';

// Initialize updater
$dozo_updater = new DOZO_Plugin_Update_Checker(__FILE__);
```

---

## 🧪 Testing Flow

### 1. Test Current System

```bash
npm run release:test
```

Expected output: **25/25 tests passed**

### 2. Check Manifest

```bash
curl https://updates.rockstage.mx/manifest.json
```

Expected: Valid JSON with version info

### 3. Test Release Creation

```bash
# Create test files
echo "test" > release/releases/dozo-desktop-0.0.1.dmg
echo "test" > release/releases/dozo-wp-0.0.1.zip

# Create release
npm run release:create 0.0.1 all
```

Expected: Files uploaded to R2, manifest updated

### 4. Verify CDN

```bash
curl https://updates.rockstage.mx/dozo-desktop-0.0.1.dmg
curl https://updates.rockstage.mx/dozo-wp-0.0.1.zip
```

---

## 📦 Release Checklist

- [ ] Build desktop app (`npm run build:mac`)
- [ ] Copy DMG to `release/releases/`
- [ ] Rename to version format: `dozo-desktop-X.X.X.dmg`
- [ ] Run `npm run release:create X.X.X desktop`
- [ ] Verify upload success
- [ ] Test download from CDN
- [ ] Update app and test auto-updater

---

## 🔄 Update Flow Diagram

```
User App (v2.6.0)
    ↓
Check for updates (every hour)
    ↓
Fetch manifest.json from CDN
    ↓
Compare versions (2.6.0 vs 2.7.0)
    ↓
Update available! ✨
    ↓
Download new version
    ↓
Verify SHA256 integrity
    ↓
Notify user
    ↓
User restarts → v2.7.0 🎉
```

---

## 🌐 Endpoints

| Endpoint                                              | Purpose             |
| ----------------------------------------------------- | ------------------- |
| `https://updates.rockstage.mx/`                       | Root (status check) |
| `https://updates.rockstage.mx/manifest.json`          | Version manifest    |
| `https://updates.rockstage.mx/dozo-desktop-X.X.X.dmg` | Desktop app         |
| `https://updates.rockstage.mx/dozo-wp-X.X.X.zip`      | WordPress plugin    |

---

## 🛠️ Troubleshooting

### Tests Failing

```bash
# Clear cache and retry
npm run release:test
```

### Upload Failing

```bash
# Check wrangler auth
cd infra/cloudflare/terraform
npx wrangler whoami

# Re-authenticate if needed
npx wrangler login
```

### Manifest Not Updating

```bash
# Manually upload
cd infra/cloudflare/terraform
npx wrangler r2 object put dozo-updates/manifest.json \
  --file="../../release-manifest.json" --remote
```

### Download Returns 404

```bash
# List R2 bucket contents
cd infra/cloudflare/terraform
npx wrangler r2 object get dozo-updates/dozo-test.txt

# Re-upload if needed
```

---

## 📞 Support

**Issues?** Check these files:

- `🎉-FASE-16.7-COMPLETE.md` - Full documentation
- `app-updater/updater.js` - Electron updater
- `wp-updater/plugin-update-checker.php` - WP updater
- `scripts/release.js` - Release manager

**Test First:**

```bash
npm run release:test
```

---

## ✅ Success Criteria

You'll know it's working when:

- ✅ `npm run release:test` shows 25/25 passed
- ✅ `curl https://updates.rockstage.mx/manifest.json` returns JSON
- ✅ Uploading a test file succeeds
- ✅ Downloading from CDN works
- ✅ SHA256 hashes match

---

## 🚀 Go Live

### Production Release

1. **Build production app:**

   ```bash
   npm run build:mac
   ```

2. **Create release:**

   ```bash
   npm run release:create 2.7.0 all
   ```

3. **Test update:**
   - Install v2.6.0
   - Wait for auto-check (or trigger manually)
   - Verify update notification
   - Download and install
   - Confirm v2.7.0 running

4. **Monitor:**

   ```bash
   # Check manifest
   curl https://updates.rockstage.mx/manifest.json

   # Check download
   curl -I https://updates.rockstage.mx/dozo-desktop-2.7.0.dmg
   ```

---

**Ready to ship! 🚀**

Questions? Check `🎉-FASE-16.7-COMPLETE.md` for detailed documentation.
