# 📑 FASE 16.7 - Complete File Index

## Auto-Updater System Files

### Electron Desktop Updater

```
app-updater/
├── updater.js              Main updater orchestrator (DozoUpdater class)
├── check-updates.js        Version checker, manifest fetcher, semver comparison
└── apply-update.js         Download manager, SHA256 verification
```

**Purpose:** Automatic updates for DOZO Electron desktop application  
**Features:** Background checks, integrity verification, user notifications  
**Dependencies:** None (native Node.js HTTPS/crypto/fs)

---

### WordPress Plugin Updater

```
wp-updater/
├── updater-endpoint.php         REST API endpoint (/wp-json/dozo/v1/check-update)
└── plugin-update-checker.php    WP update hooks integration
```

**Purpose:** Automatic updates for DOZO WordPress plugin  
**Features:** Native WP update UI, transient caching, version comparison  
**Dependencies:** WordPress 6.0+, PHP 7.4+

---

### Release Management

```
scripts/
├── release.js              Node.js release creator and publisher
├── publish-plugin.php      WordPress plugin packager and uploader
└── test-release.js         Comprehensive test suite (25 tests)
```

**Purpose:** Create, package, and publish releases to Cloudflare R2  
**Features:** SHA256 generation, automatic upload, rollback support

---

### Configuration Files

```
Root Directory:
├── release-manifest.json   Central version manifest (synced to CDN)
└── package.json            NPM scripts for release management
```

**Manifest Structure:**

- `version`: Current release version
- `releaseDate`: ISO 8601 timestamp
- `desktop`: Desktop app metadata (file, sha256, url, size)
- `wordpress`: WordPress plugin metadata (file, sha256, url, size)
- `rollback`: Previous version info for rollback capability

---

### Documentation

```
Documentation Files:
├── 🎉-FASE-16.7-COMPLETE.md      Complete documentation (architecture, usage, API)
├── FASE-16.7-QUICK-START.md      Quick start guide (commands, integration)
└── FASE-16.7-INDEX.md            This file (complete file index)
```

---

## NPM Scripts Added

```json
{
  "release:create": "node scripts/release.js create",
  "release:rollback": "node scripts/release.js rollback",
  "release:test": "node scripts/test-release.js",
  "release:plugin": "php scripts/publish-plugin.php"
}
```

---

## Infrastructure Files

### Cloudflare Integration

```
infra/cloudflare/terraform/
├── worker.js           Cloudflare Worker (serves files from R2)
├── wrangler.toml       Worker configuration
└── main.tf             Terraform infrastructure
```

**CDN Endpoints:**

- `https://updates.rockstage.mx/` (root status)
- `https://updates.rockstage.mx/manifest.json` (version manifest)
- `https://updates.rockstage.mx/dozo-desktop-X.X.X.dmg` (desktop app)
- `https://updates.rockstage.mx/dozo-wp-X.X.X.zip` (WordPress plugin)

---

## Release Directory Structure

```
release/
├── releases/               Compiled release files (.dmg, .zip)
├── desktop/                Desktop app placeholder
├── wp/                     WordPress plugin placeholder
├── manifests/              Historical manifests
├── scripts/                Legacy release scripts
├── update.json             Legacy update manifest
└── ReleaseLogs.json        Release history log
```

---

## File Dependencies

### Electron Updater Chain

```
AppBuild/main.js
    ↓ imports
app-updater/updater.js
    ↓ imports
app-updater/check-updates.js  →  HTTPS fetch manifest.json
app-updater/apply-update.js   →  Download + verify DMG
```

### WordPress Updater Chain

```
wordpress/plugins/dozo-system/dozo-system.php
    ↓ includes
wp-updater/plugin-update-checker.php
    ↓ fetches
https://updates.rockstage.mx/manifest.json
    ↓ hooks into
WordPress update system (pre_set_site_transient_update_plugins)
```

### Release Pipeline Chain

```
npm run release:create X.X.X
    ↓ executes
scripts/release.js
    ↓ reads
release/releases/*.dmg | *.zip
    ↓ generates
SHA256 hashes
    ↓ updates
release-manifest.json
    ↓ uploads via
npx wrangler r2 object put
    ↓ publishes to
https://updates.rockstage.mx/
```

---

## API Endpoints

### REST API (WordPress)

```
GET /wp-json/dozo/v1/check-update
Query Params:
  - version: Current plugin version
  - slug: Plugin slug (dozo-system)

Response:
{
  "update_available": true,
  "version": "2.7.0",
  "package": "https://updates.rockstage.mx/dozo-wp-2.7.0.zip",
  "sha256": "abc123...",
  "tested": "6.4",
  "requires": "6.0",
  "requires_php": "7.4"
}
```

### CDN Endpoints (Cloudflare)

```
GET https://updates.rockstage.mx/
Response: "DOZO Updates Ready ✅"

GET https://updates.rockstage.mx/manifest.json
Response: Full version manifest (JSON)

GET https://updates.rockstage.mx/dozo-desktop-2.7.0.dmg
Response: Binary download with headers:
  - Content-Type: application/x-apple-diskimage
  - Cache-Control: public, max-age=3600
  - Content-Disposition: attachment

GET https://updates.rockstage.mx/dozo-wp-2.7.0.zip
Response: Binary download with ZIP content-type
```

---

## Environment Variables

```bash
# Cloudflare R2 Access (required for upload)
CLOUDFLARE_ACCOUNT_ID="3e98288370da90439354e80204303924"
CLOUDFLARE_R2_TOKEN="your-r2-token-here"
```

**Set via:**

```bash
export CLOUDFLARE_ACCOUNT_ID="..."
export CLOUDFLARE_R2_TOKEN="..."
```

Or configure via `wrangler login`

---

## Test Coverage

**Test Suite:** `scripts/test-release.js`

**Tests Included:**

1. Local manifest structure validation (10 tests)
2. Release directory accessibility (2 tests)
3. Remote CDN manifest access (4 tests)
4. Version comparison logic (5 tests)
5. Update endpoint availability (1 test)
6. Rollback capability (3 tests)

**Total:** 25 tests  
**Status:** ✅ All passing

---

## Security Features

| Feature             | Implementation                 | File                                 |
| ------------------- | ------------------------------ | ------------------------------------ |
| SHA256 Verification | crypto.createHash('sha256')    | app-updater/apply-update.js          |
| HTTPS Only          | Native https module            | app-updater/check-updates.js         |
| File Integrity      | Hash comparison before install | app-updater/apply-update.js          |
| Transient Cache     | WP set_transient()             | wp-updater/plugin-update-checker.php |
| Rollback            | Version tracking in manifest   | release-manifest.json                |

---

## Integration Points

### 1. Electron App Integration

**File to modify:** `AppBuild/main.js`

```javascript
import { DozoUpdater } from "../app-updater/updater.js";

app.whenReady().then(() => {
  const mainWindow = createWindow();
  const updater = new DozoUpdater(app, mainWindow);
  updater.initialize();
});
```

### 2. WordPress Plugin Integration

**File to modify:** `wordpress/plugins/dozo-system/dozo-system.php`

```php
require_once plugin_dir_path(__FILE__) . 'wp-updater/plugin-update-checker.php';
$updater = new DOZO_Plugin_Update_Checker(__FILE__);
```

---

## Command Reference

```bash
# Testing
npm run release:test                    # Run all 25 tests

# Desktop Releases
npm run release:create 2.7.0 desktop    # Desktop only
npm run release:create 2.7.0 all        # Desktop + WordPress

# WordPress Releases
npm run release:plugin                  # Package and publish WP plugin

# Rollback
npm run release:rollback                # Revert to previous version

# Manual Operations
node scripts/release.js create 2.7.0    # Same as npm script
php scripts/publish-plugin.php          # Same as npm script

# CDN Testing
curl https://updates.rockstage.mx/manifest.json
curl https://updates.rockstage.mx/dozo-test.txt
```

---

## Maintenance

### Clear WordPress Update Cache

```bash
# Via WP-CLI
wp transient delete dozo_update_check_dozo-system

# Via PHP
delete_transient('dozo_update_check_dozo-system');
```

### Re-upload Manifest

```bash
cd infra/cloudflare/terraform
npx wrangler r2 object put dozo-updates/manifest.json \
  --file="../../release-manifest.json" --remote
```

### View R2 Objects

```bash
cd infra/cloudflare/terraform
npx wrangler r2 object get dozo-updates/manifest.json
```

---

## Troubleshooting

| Issue                 | Solution                | Reference                    |
| --------------------- | ----------------------- | ---------------------------- |
| Tests failing         | Check CDN accessibility | FASE-16.7-QUICK-START.md     |
| Upload failing        | Verify wrangler auth    | `npx wrangler whoami`        |
| 404 on download       | Check R2 object exists  | `npx wrangler r2 object get` |
| WP update not showing | Clear transient cache   | `delete_transient()`         |
| Hash mismatch         | Re-generate and upload  | `npm run release:create`     |

---

## Version History

| Version | Date       | Changes                   |
| ------- | ---------- | ------------------------- |
| 2.6.0   | 2025-11-04 | Initial release system    |
| 2.7.0   | TBD        | First auto-update release |

---

**Complete File Count:**

- JavaScript modules: 6 files
- PHP modules: 2 files
- Config files: 2 files
- Documentation: 3 files
- Infrastructure: 3 files
- **Total: 16 files**

**Total Lines of Code:** ~1,500 lines

---

This index provides a complete reference for all files created in FASE 16.7.
For usage instructions, see `FASE-16.7-QUICK-START.md`.
For detailed documentation, see `🎉-FASE-16.7-COMPLETE.md`.
