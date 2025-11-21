#!/usr/bin/env python3
"""
🧩 DOZO Auto-Organize System
Fase 16.9.4 - System Order Enforcement

Automatically organizes generated files into appropriate folders
with date-based structure and file type categorization.
"""

import os
import shutil
import datetime
import json
from pathlib import Path

# Colors for terminal output
class Colors:
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_header():
    print(f"{Colors.CYAN}{Colors.BOLD}")
    print("╔═══════════════════════════════════════════════════════╗")
    print("║     🧩 DOZO Auto-Organize - Phase 16.9.4            ║")
    print("╚═══════════════════════════════════════════════════════╝")
    print(f"{Colors.END}\n")

def main():
    print_header()
    
    # Define root and reports directories
    root = Path.home() / 'Documents' / 'DOZO System by RS'
    reports = root / 'Reports'
    today = datetime.date.today().strftime('%Y-%m-%d')
    report_day = reports / today
    unsorted = reports / 'Unsorted'
    
    # Create directories
    report_day.mkdir(parents=True, exist_ok=True)
    unsorted.mkdir(parents=True, exist_ok=True)
    
    print(f"{Colors.CYAN}📁 Reports directory: {Colors.END}{reports}")
    print(f"{Colors.CYAN}📅 Today's folder: {Colors.END}{report_day}\n")
    
    # Define organization rules
    rules = {
        '.md': report_day / 'Docs',
        '.json': report_day / 'Data',
        '.txt': report_day / 'Logs',
        '.log': report_day / 'Logs',
        '.yml': report_day / 'Config',
        '.yaml': report_day / 'Config'
    }
    
    # Create rule directories
    for folder in rules.values():
        folder.mkdir(parents=True, exist_ok=True)
    
    organized_count = 0
    skipped_count = 0
    error_count = 0
    
    # Scan root for files to organize (excluding already organized ones)
    exclude_dirs = {
        'node_modules', 'Reports', 'Backup', 'Archive', '.git',
        'DistributionBuild', 'Plugins', 'wordpress', 'wp-updater'
    }
    
    print(f"{Colors.CYAN}🔍 Scanning workspace for files to organize...{Colors.END}\n")
    
    for folder_path in root.rglob('*'):
        # Skip excluded directories
        if any(exc in folder_path.parts for exc in exclude_dirs):
            continue
            
        if folder_path.is_file():
            ext = folder_path.suffix.lower()
            
            # Check if file matches organization rules
            if ext in rules:
                # Skip if already in Reports
                if 'Reports' in folder_path.parts:
                    continue
                
                # Skip if it's a critical system file
                if folder_path.name in ['package.json', 'package-lock.json', '.gitignore']:
                    continue
                
                # Determine destination
                dest_folder = rules[ext]
                dest_file = dest_folder / folder_path.name
                
                # Handle duplicates
                if dest_file.exists():
                    timestamp = datetime.datetime.now().strftime('%H%M%S')
                    name_without_ext = folder_path.stem
                    dest_file = dest_folder / f"{name_without_ext}_{timestamp}{ext}"
                
                try:
                    shutil.move(str(folder_path), str(dest_file))
                    print(f"  {Colors.GREEN}✅{Colors.END} Moved: {folder_path.name} → {dest_folder.name}/")
                    organized_count += 1
                except Exception as e:
                    # If can't move, try copy to unsorted
                    try:
                        shutil.copy(str(folder_path), str(unsorted / folder_path.name))
                        print(f"  {Colors.YELLOW}⚠️ {Colors.END} Copied to Unsorted: {folder_path.name}")
                        skipped_count += 1
                    except:
                        print(f"  {Colors.RED}❌{Colors.END} Error: {folder_path.name}")
                        error_count += 1
    
    print(f"\n{Colors.CYAN}📊 Organization Summary:{Colors.END}")
    print(f"  Organized: {Colors.GREEN}{organized_count}{Colors.END}")
    print(f"  Skipped:   {Colors.YELLOW}{skipped_count}{Colors.END}")
    print(f"  Errors:    {Colors.RED}{error_count}{Colors.END}\n")
    
    # Update stats JSON
    stats = {
        "last_run": datetime.datetime.now().isoformat(),
        "organized_files": organized_count,
        "skipped_files": skipped_count,
        "error_count": error_count,
        "report_folder": str(report_day),
        "unsorted_count": len(list(unsorted.glob('*'))) if unsorted.exists() else 0
    }
    
    stats_file = report_day / 'CLEAN-STATS.json'
    with open(stats_file, 'w') as f:
        json.dump(stats, f, indent=2)
    
    print(f"{Colors.GREEN}✅ Stats saved to: {Colors.END}{stats_file}")
    print(f"\n{Colors.BOLD}{Colors.GREEN}DOZO Auto-Organize completed successfully!{Colors.END}\n")

if __name__ == '__main__':
    main()



