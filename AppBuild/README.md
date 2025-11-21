# 🧩 DOZO System by RS – FASE 0 EXTENDIDA

## AutoSync + Compatibility Inspector + GitHub Integration System v2.0.0

### 📋 Overview

Production-grade local application for WordPress/WooCommerce plugin management with automatic updates detection, compatibility checking, patch backups, and GitHub synchronization.

### ✨ Features

- 🔄 **AutoSync**: Detects WordPress, WooCommerce, and plugin updates
- 🧠 **Compatibility Inspector**: Validates plugin compatibility
- 🩹 **Auto-Patch**: Generates automatic backups before updates
- 🔗 **GitHub Integration**: Commits and pushes changes automatically
- 📊 **JSON Reports**: Detailed logs in Workflow DB

### 🛠 Setup Instructions

#### 1. Install Dependencies

```bash
cd ~/Documents/Dozo\ System\ by\ RS/AppBuild
npm install simple-git
```

#### 2. Configure Environment

Copy the `.env.example` file to `.env` in the root directory:

```bash
cd ~/Documents/Dozo\ System\ by\ RS/
cp .env.example .env
```

Edit `.env` with your GitHub repository details:

```
DOZO_GIT_REMOTE=git@github.com:YourUsername/YourRepo.git
DOZO_GIT_BRANCH=main
DOZO_GIT_USER=YourGitUsername
```

#### 3. Setup SSH Keys (Required for GitHub Push)

```bash
cd ~/Documents/Dozo\ System\ by\ RS/GitSync
ssh-keygen -t ed25519 -C "dozo@rockstage.system" -f ./id_ed25519
```

Add the public key to GitHub:

1. Copy the public key:
   ```bash
   cat id_ed25519.pub
   ```
2. Go to GitHub → Settings → SSH and GPG keys → New SSH key
3. Paste the public key and save

4. Configure SSH to use this key:
   ```bash
   # Add to ~/.ssh/config
   Host github.com
     HostName github.com
     User git
     IdentityFile ~/Documents/Dozo\ System\ by\ RS/GitSync/id_ed25519
   ```

### 🚀 Running DOZO System

#### Execute Main Application

```bash
cd ~/Documents/Dozo\ System\ by\ RS/AppBuild
node main.js
```

#### Expected Output

```
🧩 DOZO System v2.0.0 initialized.
✅ AutoSync ejecutado correctamente.
🧠 Compatibility check completado.
🩹 Parches aplicados con respaldo generado.
✅ Build subida a GitHub correctamente.
```

### 📁 Directory Structure

```
DOZO System by RS/
├── .env                          # Environment configuration (create from .env.example)
├── .env.example                  # Environment template
├── AppBuild/
│   ├── modules/
│   │   ├── dozo-autosync.js     # Update detection module
│   │   ├── dozo-compatibility-engine.js  # Compatibility checker
│   │   ├── dozo-auto-patch.js   # Patch and backup manager
│   │   ├── dozo-gitsync.js      # GitHub integration
│   │   └── dozo-env-loader.js   # Environment loader
│   ├── assets/
│   │   └── github.svg           # GitHub icon
│   └── main.js                   # Main entry point
├── Workflow DB/
│   ├── DOZO-AutoSyncReport.json # AutoSync logs
│   ├── DOZO-GitSyncReport.json  # Git sync logs
│   ├── DOZO-CompatibilityLog.json # Compatibility results
│   └── ActivePlugin.json        # Active plugins tracking
├── GitSync/
│   ├── id_ed25519              # SSH private key (generated manually)
│   ├── id_ed25519.pub          # SSH public key (generated manually)
│   └── ssh-config.json         # SSH configuration guide
└── Backup/
    └── AutoSync/               # Automatic patch backups
```

### 🔧 Module Details

#### dozo-autosync.js

Scans for updates in:

- WooCommerce
- WordPress Core
- Warranty System
- PriceCraft
- LuckyStage

#### dozo-compatibility-engine.js

Validates compatibility between installed plugins and generates reports.

#### dozo-auto-patch.js

Creates timestamped backups before applying any patches.

#### dozo-gitsync.js

Handles Git operations:

- Stages all changes
- Commits with custom message
- Pushes to configured remote branch
- Logs sync activity

#### dozo-env-loader.js

Loads environment variables from `.env` file.

### 📊 Output Files

All activity is logged in JSON format in the `Workflow DB/` directory:

- **DOZO-AutoSyncReport.json**: Update detection results
- **DOZO-GitSyncReport.json**: Git synchronization history
- **DOZO-CompatibilityLog.json**: Plugin compatibility status
- **ActivePlugin.json**: Currently active plugins

### 🔐 Security Notes

1. **Never commit** `.env` or SSH private keys to version control
2. Keep `id_ed25519` private and secure
3. Use environment variables for sensitive data
4. Review generated reports before pushing to GitHub

### 🎯 Next Steps

1. ✅ Complete initial setup
2. ✅ Test with `node main.js`
3. ⏭ Integrate with Claude AI Control Center Dashboard
4. ⏭ Extend compatibility rules
5. ⏭ Add automated scheduling (cron jobs)

### 📞 Support

Compatible with:

- macOS (Darwin 24.6.0+)
- Node.js v22+
- Cursor AI
- Claude AI
- ChatGPT

### 📄 License

Part of the RockStage DOZO Ecosystem.
© 2025 RockStage Development
