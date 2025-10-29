# 🚀 DOZO System - Quick Start Guide

## ⚡ Instant Commands

### Run DOZO System
```bash
cd ~/Documents/Dozo\ System\ by\ RS/AppBuild && node main.js
```

### Test Without GitHub
```bash
cd ~/Documents/Dozo\ System\ by\ RS/AppBuild && node test.js
```

---

## 🔐 SSH Setup (One-Time)

### 1. Generate Keys
```bash
cd ~/Documents/Dozo\ System\ by\ RS/GitSync
ssh-keygen -t ed25519 -C "dozo@rockstage.system" -f ./id_ed25519
```

### 2. Copy Public Key
```bash
cat ~/Documents/Dozo\ System\ by\ RS/GitSync/id_ed25519.pub
```
→ Add to GitHub Settings → SSH Keys

### 3. Configure SSH
```bash
nano ~/.ssh/config
```

Add:
```
Host github.com
  HostName github.com
  User git
  IdentityFile ~/Documents/Dozo\ System\ by\ RS/GitSync/id_ed25519
```

### 4. Test Connection
```bash
ssh -T git@github.com
```

---

## ⚙️ Configuration

### Edit Environment
```bash
nano ~/Documents/Dozo\ System\ by\ RS/.env
```

Update:
```
DOZO_GIT_REMOTE=git@github.com:YourUsername/YourRepo.git
DOZO_GIT_BRANCH=main
DOZO_GIT_USER=YourUsername
```

---

## 📊 View Reports

### AutoSync Report
```bash
cat ~/Documents/Dozo\ System\ by\ RS/Workflow\ DB/DOZO-AutoSyncReport.json | jq
```

### Compatibility Log
```bash
cat ~/Documents/Dozo\ System\ by\ RS/Workflow\ DB/DOZO-CompatibilityLog.json | jq
```

### Git Sync Log
```bash
cat ~/Documents/Dozo\ System\ by\ RS/Workflow\ DB/DOZO-GitSyncReport.json | jq
```

### Check Backups
```bash
ls -lh ~/Documents/Dozo\ System\ by\ RS/Backup/AutoSync/
```

---

## 🎯 Expected Output

```
🧩 DOZO System v2.0.0 initialized.
✅ AutoSync ejecutado correctamente.
🧠 Compatibility check completado.
🩹 Parches aplicados con respaldo generado.
✅ Build subida a GitHub correctamente.
```

---

## 📁 Key Files

| File | Path |
|------|------|
| Main App | `AppBuild/main.js` |
| Test Runner | `AppBuild/test.js` |
| Config | `.env` |
| Full Docs | `DOZO-SETUP-GUIDE.md` |
| Architecture | `ARCHITECTURE-SUMMARY.md` |

---

## 🐛 Troubleshooting

### "Could not read Username"
→ SSH keys not configured. Run SSH setup above.

### "Module not found"
```bash
cd ~/Documents/Dozo\ System\ by\ RS/AppBuild
npm install
```

### "Permission denied (publickey)"
```bash
ssh-add ~/Documents/Dozo\ System\ by\ RS/GitSync/id_ed25519
ssh -T git@github.com
```

---

## 📖 Documentation

- **Quick Start**: This file
- **Full Setup**: `DOZO-SETUP-GUIDE.md`
- **Architecture**: `ARCHITECTURE-SUMMARY.md`
- **Module Docs**: `AppBuild/README.md`

---

✅ **Status**: Production Ready  
📦 **Version**: 2.0.0  
🏢 **RockStage DOZO Ecosystem**



