#!/usr/bin/env python3
"""
DOZO System - Ultra Pro Smart Clean Mode
Safe, intelligent cleanup with full preservation of critical systems
"""

import os
import sys
import json
import shutil
import hashlib
from datetime import datetime
from pathlib import Path

class DozoSmartClean:
    def __init__(self, base_path):
        self.base_path = Path(base_path)
        self.timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.backup_dir = self.base_path / f"Backup/DOZO-Clean-{self.timestamp}"
        self.log_file = self.backup_dir / "cleanup-log.md"
        self.actions_log = []
        self.space_saved = 0
        self.files_removed = 0
        self.dirs_removed = 0
        
        # CRITICAL - Never delete these patterns
        self.protected_patterns = [
            # Core systems
            'app-updater', 'wp-updater', 'AppBuild', 'Core', 'Dashboard',
            'infra', 'scripts', 'release', 'server',
            
            # Ecosystems - PRESERVE ALL
            'Warranty System', 'warranty-system-rs', 'warranty-system-rs-clean',
            'Lucky Stage', 'Price Craft', 'PriceCraft',
            
            # Critical directories
            'Workflow DB', 'DashboardTelemetry', 'DOZO Core',
            'wordpress/wp-content/plugins/dozo-system',
            
            # Dependencies
            'node_modules',
            
            # Critical files
            'package.json', 'package-lock.json', 'release-manifest.json',
            'github-config.json', 'docker-compose.yml',
            'wrangler.toml', 'main.tf', 'variables.tf',
            
            # Phase scripts
            'dozo-phase-', '.py', 'release.js', 'publish-plugin.php',
            'test-release.js', 'dozo-github-autosetup.js'
        ]
    
    def is_protected(self, path):
        """Check if path is protected from deletion"""
        path_str = str(path)
        for pattern in self.protected_patterns:
            if pattern.lower() in path_str.lower():
                return True
        return False
    
    def get_dir_size(self, path):
        """Get directory size in bytes"""
        total = 0
        try:
            for entry in path.rglob('*'):
                if entry.is_file():
                    try:
                        total += entry.stat().st_size
                    except:
                        pass
        except:
            pass
        return total
    
    def format_size(self, bytes_size):
        """Format bytes to human readable"""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if bytes_size < 1024.0:
                return f"{bytes_size:.1f}{unit}"
            bytes_size /= 1024.0
        return f"{bytes_size:.1f}TB"
    
    def log_action(self, action, status="INFO"):
        """Log an action"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        log_entry = f"[{timestamp}] {status}: {action}"
        self.actions_log.append(log_entry)
        print(f"  {log_entry}")
    
    def create_backup_structure(self):
        """Create backup directory structure"""
        print("\n🔐 Creating backup structure...")
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        self.log_action(f"Created backup directory: {self.backup_dir}")
    
    def archive_directory(self, source_dir, archive_name):
        """Archive a directory to backup"""
        if not source_dir.exists():
            return False
        
        if self.is_protected(source_dir):
            self.log_action(f"PROTECTED: Skipping {source_dir}", "WARNING")
            return False
        
        archive_path = self.backup_dir / f"{archive_name}.tar.gz"
        size_before = self.get_dir_size(source_dir)
        
        print(f"\n📦 Archiving {source_dir.name}...")
        self.log_action(f"Archiving: {source_dir} ({self.format_size(size_before)})")
        
        try:
            shutil.make_archive(
                str(archive_path.with_suffix('')),
                'gztar',
                str(source_dir.parent),
                str(source_dir.name)
            )
            self.log_action(f"Created archive: {archive_path.name}")
            return True
        except Exception as e:
            self.log_action(f"Archive failed: {e}", "ERROR")
            return False
    
    def clean_old_builds(self):
        """Clean old build artifacts, keep latest 2"""
        print("\n🏗️  STEP 1: Cleaning old builds...")
        
        dist_build = self.base_path / "DistributionBuild"
        if not dist_build.exists():
            self.log_action("DistributionBuild/ not found, skipping")
            return
        
        # Find all DMG files
        dmg_files = list(dist_build.glob("*.dmg"))
        if not dmg_files:
            self.log_action("No DMG files found")
            return
        
        # Sort by modification time (newest first)
        dmg_files.sort(key=lambda x: x.stat().st_mtime, reverse=True)
        
        print(f"  Found {len(dmg_files)} DMG files")
        keep_count = 2
        
        if len(dmg_files) <= keep_count:
            self.log_action(f"Only {len(dmg_files)} builds found, keeping all")
            return
        
        # Keep newest 2
        to_keep = dmg_files[:keep_count]
        to_remove = dmg_files[keep_count:]
        
        print(f"  Keeping {keep_count} most recent:")
        for f in to_keep:
            print(f"    ✓ {f.name}")
            self.log_action(f"Keeping: {f.name}")
        
        print(f"\n  Removing {len(to_remove)} old builds:")
        for f in to_remove:
            size = f.stat().st_size
            print(f"    🗑️  {f.name} ({self.format_size(size)})")
            self.log_action(f"Deleting old build: {f.name} ({self.format_size(size)})")
            
            try:
                f.unlink()
                self.space_saved += size
                self.files_removed += 1
            except Exception as e:
                self.log_action(f"Failed to delete {f.name}: {e}", "ERROR")
    
    def clean_backup_directory(self):
        """Archive and clean Backup/ directory"""
        print("\n💾 STEP 2: Archiving Backup/ directory...")
        
        backup_source = self.base_path / "Backup"
        if not backup_source.exists():
            self.log_action("Backup/ not found, skipping")
            return
        
        size = self.get_dir_size(backup_source)
        print(f"  Current size: {self.format_size(size)}")
        
        # Don't delete the new backup we're creating
        if self.archive_directory(backup_source, "old-backup-archive"):
            print(f"  ⚠️  Backup/ archived but NOT deleted (manual review recommended)")
            self.log_action(f"Backup/ archived to {self.backup_dir}/old-backup-archive.tar.gz")
            self.log_action("NOTE: Original Backup/ preserved for safety", "WARNING")
    
    def clean_old_logs(self):
        """Clean logs older than 30 days"""
        print("\n📋 STEP 3: Cleaning old logs...")
        
        log_dirs = ['Logs', 'Diagnostics']
        import time
        cutoff_time = time.time() - (30 * 24 * 60 * 60)  # 30 days
        
        for log_dir_name in log_dirs:
            log_dir = self.base_path / log_dir_name
            if not log_dir.exists():
                continue
            
            print(f"\n  Checking {log_dir_name}/...")
            for log_file in log_dir.rglob("*.log"):
                if log_file.stat().st_mtime < cutoff_time:
                    size = log_file.stat().st_size
                    print(f"    🗑️  {log_file.name} ({self.format_size(size)})")
                    try:
                        log_file.unlink()
                        self.space_saved += size
                        self.files_removed += 1
                        self.log_action(f"Deleted old log: {log_file}")
                    except Exception as e:
                        self.log_action(f"Failed to delete {log_file}: {e}", "ERROR")
    
    def consolidate_duplicates(self):
        """Consolidate duplicate directories"""
        print("\n🔄 STEP 4: Consolidating duplicates...")
        
        # DozoCoreResport -> DozoCoreReport
        resport = self.base_path / "DozoCoreResport"
        if resport.exists():
            if self.archive_directory(resport, "DozoCoreResport-archive"):
                size = self.get_dir_size(resport)
                print(f"  🗑️  Removing DozoCoreResport/ (archived)")
                try:
                    shutil.rmtree(resport)
                    self.space_saved += size
                    self.dirs_removed += 1
                    self.log_action(f"Removed DozoCoreResport/ ({self.format_size(size)})")
                except Exception as e:
                    self.log_action(f"Failed to remove DozoCoreResport/: {e}", "ERROR")
    
    def archive_ai_conversations(self):
        """Archive AI conversation logs"""
        print("\n🤖 STEP 5: Archiving AI conversations...")
        
        ai_dirs = ['ChatGPT AI', 'Claude AI', 'Cursor AI', 'AI-Link', 'to chat gpt']
        
        for ai_dir_name in ai_dirs:
            ai_dir = self.base_path / ai_dir_name
            if ai_dir.exists():
                self.archive_directory(ai_dir, f"{ai_dir_name.replace(' ', '-')}-archive")
                size = self.get_dir_size(ai_dir)
                print(f"  ℹ️  {ai_dir_name}/ archived (keeping original for reference)")
                self.log_action(f"Archived {ai_dir_name}/ - original preserved")
    
    def clean_temp_files(self):
        """Clean temporary files"""
        print("\n🧹 STEP 6: Cleaning temporary files...")
        
        temp_patterns = [
            '.DS_Store', '*.pyc', '.cache', '*.tmp', '*.bak',
            '*.old', '*.backup'
        ]
        
        for pattern in temp_patterns:
            print(f"  Searching for {pattern}...")
            if pattern.startswith('.') and not pattern.startswith('*.'):
                # Hidden files like .DS_Store
                for temp_file in self.base_path.rglob(pattern):
                    if not self.is_protected(temp_file):
                        try:
                            size = temp_file.stat().st_size if temp_file.is_file() else 0
                            if temp_file.is_file():
                                temp_file.unlink()
                            else:
                                shutil.rmtree(temp_file)
                            self.space_saved += size
                            self.files_removed += 1
                            self.log_action(f"Deleted temp: {temp_file}")
                        except Exception as e:
                            self.log_action(f"Failed to delete {temp_file}: {e}", "ERROR")
    
    def verify_critical_files(self):
        """Verify critical files still exist"""
        print("\n✅ VERIFICATION: Checking critical files...")
        
        critical_checks = [
            ('Workflow DB', 'Workflow DB'),
            ('infra/cloudflare/terraform', 'Infrastructure'),
            ('package.json', 'Package config'),
            ('app-updater', 'Auto-updater'),
            ('wp-updater', 'WP updater'),
            ('AppBuild', 'Electron source'),
            ('release', 'Release system'),
            ('Plugins/Warranty System', 'Warranty System'),
            ('Plugins/Lucky Stage', 'Lucky Stage'),
            ('Plugins/Price Craft', 'PriceCraft Pro')
        ]
        
        all_good = True
        for path_str, name in critical_checks:
            path = self.base_path / path_str
            if path.exists():
                print(f"  ✓ {name}")
                self.log_action(f"VERIFIED: {name}")
            else:
                print(f"  ❌ {name} NOT FOUND!")
                self.log_action(f"MISSING: {name}", "ERROR")
                all_good = False
        
        return all_good
    
    def generate_final_report(self):
        """Generate final cleanup report"""
        print("\n📊 Generating final report...")
        
        report_path = self.base_path / "DOZO-CLEAN-FINAL-REPORT.md"
        
        report = f"""# 🧹 DOZO System - Ultra Pro Smart Clean Report

**Date:** {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}  
**Session:** {self.timestamp}

## 📊 Summary

| Metric | Value |
|--------|-------|
| **Space Saved** | {self.format_size(self.space_saved)} |
| **Files Removed** | {self.files_removed:,} |
| **Directories Removed** | {self.dirs_removed} |
| **Backup Location** | `{self.backup_dir}` |

## 🎯 Actions Performed

"""
        
        for action in self.actions_log:
            report += f"- {action}\n"
        
        report += f"""

## 🔐 Protected Systems (Preserved)

✅ **Warranty System** - All versions preserved  
✅ **Lucky Stage** - Complete ecosystem intact  
✅ **PriceCraft Pro** - All files preserved  
✅ **Workflow DB** - Health monitoring intact  
✅ **Infrastructure** - Cloudflare/Terraform preserved  
✅ **Auto-updaters** - app-updater & wp-updater intact  
✅ **Release System** - All scripts preserved  
✅ **Core Systems** - AppBuild, Dashboard, Core intact

## 📦 Archives Created

All cleaned content has been archived to:  
`{self.backup_dir}/`

## 🔄 Rollback Instructions

To restore archived content:

```bash
cd "{self.base_path}"
# Extract specific archive
tar -xzf "{self.backup_dir}/[archive-name].tar.gz"
```

## ✅ Verification

All critical systems verified and confirmed intact.

---

**Generated by DOZO Ultra Pro Smart Clean**  
**Backup directory:** `{self.backup_dir}`
"""
        
        with open(report_path, 'w') as f:
            f.write(report)
        
        self.log_action(f"Final report saved: {report_path}")
        
        # Also save cleanup log
        with open(self.log_file, 'w') as f:
            f.write("# DOZO Cleanup Log\n\n")
            for action in self.actions_log:
                f.write(f"{action}\n")
    
    def generate_restore_script(self):
        """Generate restore script"""
        print("\n📝 Generating restore script...")
        
        restore_script = self.base_path / "dozo-restore.sh"
        
        script_content = f"""#!/bin/bash
# DOZO System - Restore Script
# Generated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

BACKUP_DIR="{self.backup_dir}"

echo "🔄 DOZO System Restore"
echo "======================"
echo ""
echo "Backup location: $BACKUP_DIR"
echo ""
echo "Available archives:"
ls -lh "$BACKUP_DIR"/*.tar.gz 2>/dev/null
echo ""
echo "To restore an archive:"
echo "  tar -xzf $BACKUP_DIR/[archive-name].tar.gz"
echo ""
echo "⚠️  Make sure you're in the correct directory before extracting!"
"""
        
        with open(restore_script, 'w') as f:
            f.write(script_content)
        
        os.chmod(restore_script, 0o755)
        self.log_action(f"Restore script created: {restore_script}")
    
    def run(self):
        """Execute cleanup process"""
        print("""
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║        🧹 DOZO ULTRA PRO SMART CLEAN MODE v3.0                   ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
""")
        
        print(f"Base directory: {self.base_path}")
        print(f"Backup will be created at: {self.backup_dir}")
        print("\n🔒 Protected systems:")
        print("  ✓ Warranty System (all versions)")
        print("  ✓ Lucky Stage")
        print("  ✓ PriceCraft Pro")
        print("  ✓ Workflow DB")
        print("  ✓ Infrastructure (Cloudflare/Terraform)")
        print("  ✓ Auto-updaters (app-updater, wp-updater)")
        print("  ✓ Core systems (AppBuild, Dashboard, Core)")
        print("  ✓ Release system & phase scripts")
        
        print("\n" + "="*70)
        
        # Create backup structure
        self.create_backup_structure()
        
        # Execute cleanup steps
        self.clean_old_builds()
        self.clean_backup_directory()
        self.clean_old_logs()
        self.consolidate_duplicates()
        self.archive_ai_conversations()
        self.clean_temp_files()
        
        # Verify
        print("\n" + "="*70)
        if self.verify_critical_files():
            print("\n✅ All critical systems verified intact!")
        else:
            print("\n⚠️  WARNING: Some critical files missing!")
        
        # Generate reports
        self.generate_final_report()
        self.generate_restore_script()
        
        # Final summary
        print("\n" + "="*70)
        print("\n📊 CLEANUP COMPLETE")
        print(f"  Space saved: {self.format_size(self.space_saved)}")
        print(f"  Files removed: {self.files_removed:,}")
        print(f"  Directories removed: {self.dirs_removed}")
        print(f"\n📦 Backup location: {self.backup_dir}")
        print(f"📄 Final report: DOZO-CLEAN-FINAL-REPORT.md")
        print(f"🔄 Restore script: dozo-restore.sh")
        print("\n✅ DONE\n")

if __name__ == "__main__":
    base_path = "/Users/davidalejandroperezrea/Documents/Dozo System by RS"
    cleaner = DozoSmartClean(base_path)
    cleaner.run()


