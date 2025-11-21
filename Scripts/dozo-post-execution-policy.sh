#!/bin/bash

# 🧩 DOZO Post-Execution Policy
# Fase 16.9.4 - System Order Enforcement
#
# This script runs after each significant prompt execution
# to maintain workspace organization and health.

COLORS_CYAN='\033[96m'
COLORS_GREEN='\033[92m'
COLORS_BOLD='\033[1m'
COLORS_RESET='\033[0m'

echo -e "${COLORS_CYAN}${COLORS_BOLD}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║   🧩 DOZO Post-Execution Policy - Phase 16.9.4      ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${COLORS_RESET}"
echo ""

WORKSPACE="$HOME/Documents/DOZO System by RS"
cd "$WORKSPACE" || exit 1

echo -e "${COLORS_CYAN}1. Running Auto-Organize...${COLORS_RESET}"
python3 Scripts/dozo-auto-organize.py
ORGANIZE_STATUS=$?

echo ""
echo -e "${COLORS_CYAN}2. Running Health Check...${COLORS_RESET}"
python3 Scripts/dozo-health-check.py
HEALTH_STATUS=$?

echo ""
if [ $ORGANIZE_STATUS -eq 0 ] && [ $HEALTH_STATUS -eq 0 ]; then
  echo -e "${COLORS_GREEN}${COLORS_BOLD}✅ Post-execution policy completed successfully${COLORS_RESET}"
  echo ""
  echo "Reports updated in: Reports/$(date +%Y-%m-%d)/"
  echo "Health status: Workflow DB/DOZO-Health.json"
else
  echo -e "${COLORS_YELLOW}⚠️  Post-execution completed with warnings${COLORS_RESET}"
  echo "Check logs for details"
fi

echo ""
echo -e "${COLORS_CYAN}═══════════════════════════════════════════════════════${COLORS_RESET}"



