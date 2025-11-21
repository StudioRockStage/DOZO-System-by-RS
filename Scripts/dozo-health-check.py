#!/usr/bin/env python3
"""
🏥 DOZO Health Check System
Fase 16.9.4 - System Order Enforcement

Verifies workspace integrity and generates health report.
"""

import os
import json
import datetime
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
    print("║       🏥 DOZO Health Check - Phase 16.9.4           ║")
    print("╚═══════════════════════════════════════════════════════╝")
    print(f"{Colors.END}\n")

def check_critical_directories(root):
    """Check if critical directories exist"""
    critical_dirs = [
        'AppBuild',
        'Core',
        'Dashboard',
        'DistributionBuild',
        'Scripts',
        'Reports',
        'Claude AI/UI'
    ]
    
    issues = []
    for dir_name in critical_dirs:
        dir_path = root / dir_name
        if not dir_path.exists():
            issues.append(f"Missing directory: {dir_name}")
    
    return issues

def check_critical_files(root):
    """Check if critical files exist"""
    critical_files = [
        'package.json',
        'release-manifest.json',
        'AppBuild/main.js',
        'AppBuild/package.json'
    ]
    
    issues = []
    for file_name in critical_files:
        file_path = root / file_name
        if not file_path.exists():
            issues.append(f"Missing file: {file_name}")
        elif file_path.stat().st_size == 0:
            issues.append(f"Empty file: {file_name}")
    
    return issues

def count_files_by_type(root):
    """Count files by extension"""
    exclude_dirs = {'node_modules', 'Backup', 'Archive', '.git', 'Plugins', 'wordpress'}
    
    counts = {}
    for file_path in root.rglob('*'):
        if any(exc in file_path.parts for exc in exclude_dirs):
            continue
        
        if file_path.is_file():
            ext = file_path.suffix.lower() or 'no_extension'
            counts[ext] = counts.get(ext, 0) + 1
    
    return counts

def main():
    print_header()
    
    root = Path.home() / 'Documents' / 'DOZO System by RS'
    workflow_db = root / 'Workflow DB'
    workflow_db.mkdir(parents=True, exist_ok=True)
    
    print(f"{Colors.CYAN}🔍 Checking workspace health...{Colors.END}\n")
    
    # Check critical directories
    dir_issues = check_critical_directories(root)
    
    # Check critical files
    file_issues = check_critical_files(root)
    
    # Count files
    file_counts = count_files_by_type(root)
    
    # Determine overall health
    total_issues = len(dir_issues) + len(file_issues)
    
    if total_issues == 0:
        status = "healthy"
        status_emoji = "✅"
        status_color = Colors.GREEN
    elif total_issues < 5:
        status = "warning"
        status_emoji = "⚠️"
        status_color = Colors.YELLOW
    else:
        status = "critical"
        status_emoji = "❌"
        status_color = Colors.RED
    
    # Display results
    print(f"{status_color}{Colors.BOLD}{status_emoji} Workspace Status: {status.upper()}{Colors.END}\n")
    
    if dir_issues:
        print(f"{Colors.YELLOW}Directory Issues:{Colors.END}")
        for issue in dir_issues:
            print(f"  ⚠️  {issue}")
        print()
    
    if file_issues:
        print(f"{Colors.YELLOW}File Issues:{Colors.END}")
        for issue in file_issues:
            print(f"  ⚠️  {issue}")
        print()
    
    if not dir_issues and not file_issues:
        print(f"{Colors.GREEN}✅ No issues detected{Colors.END}\n")
    
    # File type summary
    print(f"{Colors.CYAN}📊 File Type Summary (top 10):{Colors.END}")
    sorted_counts = sorted(file_counts.items(), key=lambda x: x[1], reverse=True)[:10]
    for ext, count in sorted_counts:
        print(f"  {ext:15} {count:5} files")
    print()
    
    # Generate health report
    report = {
        "workspace_check": status,
        "last_verified": datetime.datetime.now().isoformat(),
        "issues_detected": total_issues,
        "directory_issues": dir_issues,
        "file_issues": file_issues,
        "file_type_counts": dict(sorted_counts),
        "total_files_scanned": sum(file_counts.values()),
        "cleanup_status": "stable" if total_issues == 0 else "needs_attention"
    }
    
    # Save to Workflow DB
    health_file = workflow_db / 'DOZO-Health.json'
    with open(health_file, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"{Colors.GREEN}✅ Health report saved to: {Colors.END}{health_file}\n")
    print(f"{Colors.BOLD}{Colors.GREEN}DOZO Health Check Complete.{Colors.END}\n")
    
    return 0 if total_issues == 0 else 1

if __name__ == '__main__':
    exit(main())



