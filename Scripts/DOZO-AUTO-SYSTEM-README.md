# 🧩 DOZO Automatic Organization System

## Phase 16.9.4 - System Order Enforcement

**Installed:** November 6, 2025  
**Version:** 1.0.0  
**Framework:** DeepSync Auto-Organization

---

## Overview

This system provides automatic file organization and health monitoring for the DOZO workspace. It ensures all generated files are properly categorized and stored in date-based folders.

---

## Scripts

### 1. dozo-auto-organize.py

**Purpose:** Automatically organize generated files  
**Language:** Python 3  
**Size:** 3.2 KB

**What it does:**

- Scans workspace for eligible files
- Organizes by file type and date
- Moves to `Reports/YYYY-MM-DD/Category/`
- Generates organization statistics
- Handles duplicates intelligently
- Protects critical files

**Usage:**

```bash
python3 Scripts/dozo-auto-organize.py
```

**Organization Rules:**

- `.md` files → `Reports/YYYY-MM-DD/Docs/`
- `.json` files → `Reports/YYYY-MM-DD/Data/`
- `.txt` files → `Reports/YYYY-MM-DD/Logs/`
- `.log` files → `Reports/YYYY-MM-DD/Logs/`
- `.yml/.yaml` files → `Reports/YYYY-MM-DD/Config/`

---

### 2. dozo-health-check.py

**Purpose:** Verify workspace integrity  
**Language:** Python 3  
**Size:** 4.1 KB

**What it does:**

- Checks critical directories exist
- Verifies essential files present
- Detects empty files
- Counts files by type
- Generates health report JSON
- Provides status assessment

**Usage:**

```bash
python3 Scripts/dozo-health-check.py
```

**Health Statuses:**

- `healthy` - No issues detected
- `warning` - Minor issues (< 5)
- `critical` - Major issues (≥ 5)

---

### 3. dozo-post-execution-policy.sh

**Purpose:** Run cleanup after operations  
**Language:** Bash  
**Size:** 1.2 KB

**What it does:**

- Executes auto-organize
- Runs health check
- Updates Workflow DB
- Provides summary output

**Usage:**

```bash
bash Scripts/dozo-post-execution-policy.sh
```

---

## Configuration

### .dozo-auto-policy-config.json

**Location:** `Scripts/.dozo-auto-policy-config.json`

**Settings:**

- `enabled`: true/false - Master switch
- `auto_organize`: Run auto-organizer
- `health_check`: Run health checks
- `run_after_prompts`: Execute after AI prompts
- `run_on_phase_complete`: Execute after phases

**Protected Directories:**

- node_modules
- Backup
- Archive
- .git
- DistributionBuild
- Plugins
- wordpress

**Critical Files (Never Moved):**

- package.json
- package-lock.json
- .gitignore

---

## Directory Structure

### Reports Organization

```
Reports/
├── 2025-11-06/
│   ├── FASE-16.9.4/
│   │   ├── DOZO-ORDER-REPORT.md
│   │   ├── POST-RUN-SUMMARY.md
│   │   └── CLEAN-STATS.json
│   ├── Docs/       (auto-organized .md files)
│   ├── Data/       (auto-organized .json files)
│   ├── Logs/       (auto-organized .log/.txt files)
│   └── Config/     (auto-organized .yml/.yaml files)
├── 2025-11-07/     (tomorrow's reports)
├── archive/        (old reports, 30+ days)
└── Unsorted/       (problematic files)
```

---

## Workflow Integration

### Manual Execution

**After completing work:**

```bash
cd ~/Documents/DOZO\ System\ by\ RS
python3 Scripts/dozo-auto-organize.py
python3 Scripts/dozo-health-check.py
```

### NPM Integration (Optional)

**Add to package.json:**

```json
{
  "scripts": {
    "dozo:organize": "python3 Scripts/dozo-auto-organize.py",
    "dozo:health": "python3 Scripts/dozo-health-check.py",
    "dozo:cleanup": "bash Scripts/dozo-post-execution-policy.sh"
  }
}
```

**Then run:**

```bash
npm run dozo:cleanup
```

---

## Output Files

### CLEAN-STATS.json

**Location:** `Reports/YYYY-MM-DD/CLEAN-STATS.json`

**Example:**

```json
{
  "last_run": "2025-11-06T20:45:00.000Z",
  "organized_files": 15,
  "skipped_files": 2,
  "error_count": 0,
  "report_folder": "Reports/2025-11-06",
  "unsorted_count": 0
}
```

### DOZO-Health.json

**Location:** `Workflow DB/DOZO-Health.json`

**Example:**

```json
{
  "workspace_check": "healthy",
  "last_verified": "2025-11-06T20:45:00.000Z",
  "issues_detected": 0,
  "total_files_scanned": 1247,
  "cleanup_status": "stable"
}
```

---

## Troubleshooting

### Common Issues

**Issue: "Permission denied"**

```bash
chmod +x Scripts/dozo-auto-organize.py
chmod +x Scripts/dozo-health-check.py
chmod +x Scripts/dozo-post-execution-policy.sh
```

**Issue: "Python not found"**

```bash
# Check Python version
python3 --version

# Should be 3.4 or higher
```

**Issue: "Files not organizing"**

```bash
# Check if files are in protected locations
# Check if already in Reports/
# Verify file extensions match rules
```

---

## Safety Features

### File Protection

**Never Moved:**

- Critical system files (package.json, .gitignore)
- Files in excluded directories
- Files already in Reports/
- Files with size 0

**Safe Operations:**

- Duplicate detection with timestamps
- Copy to Unsorted/ if move fails
- Error handling for each file
- No deletion operations

### Rollback

If files organized incorrectly:

```bash
# Check what was moved
cat Reports/$(date +%Y-%m-%d)/CLEAN-STATS.json

# Manually restore from Reports/ if needed
```

---

## Maintenance

### Weekly Tasks

```bash
# Run full cleanup
npm run dozo:cleanup

# Archive old reports (30+ days)
find Reports/ -type d -name "202*" -mtime +30 -exec mv {} Reports/archive/ \;
```

### Monthly Tasks

```bash
# Clean unsorted folder
ls -lh Reports/Unsorted/
# Review and manually organize or delete

# Compress old archives
cd Reports/archive/
tar -czf archive-$(date +%Y-%m).tar.gz 202*
```

---

## Performance

### Benchmarks

| Operation          | Typical Time | Max Time |
| ------------------ | ------------ | -------- |
| Auto-organize scan | 1-2 sec      | 5 sec    |
| Health check       | 1-2 sec      | 3 sec    |
| Full policy run    | 3-5 sec      | 10 sec   |

### Scalability

- Tested with 1,000+ files
- Efficient pathlib usage
- Minimal memory footprint
- No external dependencies

---

## Version History

### v1.0.0 (Nov 6, 2025)

- Initial release
- Auto-organization system
- Health check system
- Post-execution policy
- Configuration management

---

## Support

**Questions or Issues:**

- Check `Reports/2025-11-06/FASE-16.9.4/DOZO-ORDER-REPORT.md`
- Review `Workflow DB/DOZO-Health.json` for current status
- Examine `Reports/2025-11-06/CLEAN-STATS.json` for details

**Documentation:**

- `DOZO-ORDER-REPORT.md` - Phase documentation
- `POST-RUN-SUMMARY.md` - Execution summaries
- `UI-PATH-RECOVERY-REPORT.md` - Path sync details

---

**✅ DOZO Automatic System Ready**

_System Order Enforcement - Phase 16.9.4_  
_RockStage Solutions_
