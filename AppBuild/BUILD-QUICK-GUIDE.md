# 🚀 DOZO Quick Build Guide

## One-Command Build

```bash
cd ~/Documents/Dozo\ System\ by\ RS/AppBuild
npm run build:dmg
```

That's it! The DMG will be in `../DistributionBuild/`

---

## Build Commands

| Command                       | Purpose                                  |
| ----------------------------- | ---------------------------------------- |
| `npm start`                   | Launch in development mode               |
| `npm run build:dmg`           | Build DMG for Intel Macs (x64)           |
| `npm run build:dmg-arm`       | Build DMG for Apple Silicon (ARM64)      |
| `npm run build:dmg-universal` | Build universal DMG (both architectures) |
| `npm run dozo:release`        | Update manifest + build universal DMG    |

---

## Validation

```bash
./validate-build.sh
```

Checks:

- ✅ DMG file exists
- ✅ Blockmap for delta updates
- ✅ Auto-updater metadata (latest-mac.yml)
- ✅ SHA-256 integrity
- ✅ Version consistency
- ✅ Entitlements file

---

## Before Building

### 1. Update Version

Edit `package.json`:

```json
{
  "version": "2.7.0"
}
```

### 2. Update Manifest (Optional)

Edit `release-manifest.js` to customize changelog

### 3. Build

```bash
npm run dozo:release
```

---

## Build Output

```
DistributionBuild/
├── DOZO-Control-Center-RockStage-{version}.dmg
├── DOZO-Control-Center-RockStage-{version}.dmg.blockmap
├── latest-mac.yml
└── mac/  (temporary build files)
```

---

## Testing the Build

### 1. Open DMG

```bash
open ../DistributionBuild/DOZO-Control-Center-RockStage-2.6.0.dmg
```

### 2. Install

Drag to Applications folder

### 3. Launch

First time: Right-click → Open (because it's not signed)

### 4. Verify

- App launches without errors
- Console shows correct version: `v2.6.0 - Phase 16.9 Build Factory`
- Dashboard loads at 1280x800
- All UI elements render correctly

---

## Common Issues

### "Cannot find valid identity"

**Issue:** No code signing certificate  
**Solution:** For internal builds, this is OK. For production, see `Docs/🚀-NOTARIZE-NOW.md`

### "File not found: index.html"

**Issue:** Dashboard files not found  
**Solution:** Check that `Dashboard/public/index.html` exists

### Build fails with permission error

**Issue:** npm permissions  
**Solution:** Run with sudo or fix npm permissions

---

## Architecture Notes

### Single Architecture Builds

- `--x64`: Intel Macs (64-bit)
- `--arm64`: Apple Silicon (M1/M2/M3)
- Size: ~90 MB each

### Universal Build

- `--universal`: Works on all Macs
- Size: ~180 MB (includes both architectures)
- **Recommended for production**

---

## Distribution

### Local Testing

DMG is in `DistributionBuild/` - ready to share via AirDrop, USB, etc.

### CDN Distribution

1. Upload DMG to Cloudflare R2 or CDN
2. Upload `latest-mac.yml` to same location
3. App will auto-detect updates

### Auto-Updater

Requires:

- DMG hosted at URL in `release-manifest.json`
- `latest-mac.yml` at same location
- electron-updater module (already configured)

---

## File Structure

```
AppBuild/
├── main.js                    # Electron main process
├── package.json               # Build config & dependencies
├── release-manifest.js        # Version metadata generator
├── validate-build.sh          # Build validator
├── build/
│   └── entitlements.mac.plist # macOS permissions
├── assets/
│   └── rockstage-icon.icns   # App icon (512x512)
├── modules/                   # Core functionality
└── public/                    # Fallback HTML
```

---

## Version Management

### Semantic Versioning

- **Major.Minor.Patch** (e.g., 2.6.0)
- Major: Breaking changes
- Minor: New features
- Patch: Bug fixes

### Build Number

- Phase number (e.g., 16.9)
- Stored in `release-manifest.json`

---

## Next Steps After Building

1. ✅ Run `./validate-build.sh`
2. ✅ Test install and launch
3. ✅ Verify all features work
4. ✅ Update changelog
5. ✅ Tag release in git (optional)
6. ✅ Distribute to testers
7. ✅ For production: Code sign & notarize

---

## Documentation

- Full details: `Docs/🏗️-PHASE-16.9-BUILD-FACTORY.md`
- Code signing: `Docs/🚀-NOTARIZE-NOW.md`
- Architecture: `Docs/ARCHITECTURE-SUMMARY.md`
- Getting started: `Docs/🚀-START-HERE.md`

---

**Quick Reference Built:** Phase 16.9 - November 6, 2025
