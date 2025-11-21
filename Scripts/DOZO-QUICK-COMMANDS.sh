#!/bin/bash

# 🧩 DOZO Quick Commands - Phase 16.9.4
# Quick reference script for common DOZO operations

COLORS_CYAN='\033[96m'
COLORS_GREEN='\033[92m'
COLORS_YELLOW='\033[93m'
COLORS_BOLD='\033[1m'
COLORS_RESET='\033[0m'

show_menu() {
  echo -e "${COLORS_CYAN}${COLORS_BOLD}"
  echo "╔═══════════════════════════════════════════════════════╗"
  echo "║       🧩 DOZO Quick Commands - v16.9.4              ║"
  echo "╚═══════════════════════════════════════════════════════╝"
  echo -e "${COLORS_RESET}"
  echo ""
  echo "Select an option:"
  echo ""
  echo "  1) Auto-organize workspace"
  echo "  2) Run health check"
  echo "  3) Full cleanup (organize + health)"
  echo "  4) View health status"
  echo "  5) View today's stats"
  echo "  6) Open UI Viewer"
  echo "  7) Build DMG"
  echo "  8) Exit"
  echo ""
}

WORKSPACE="$HOME/Documents/DOZO System by RS"
cd "$WORKSPACE" || exit 1

show_menu
read -p "Enter choice [1-8]: " choice

case $choice in
  1)
    echo -e "\n${COLORS_CYAN}Running Auto-Organize...${COLORS_RESET}\n"
    python3 Scripts/dozo-auto-organize.py
    ;;
  2)
    echo -e "\n${COLORS_CYAN}Running Health Check...${COLORS_RESET}\n"
    python3 Scripts/dozo-health-check.py
    ;;
  3)
    echo -e "\n${COLORS_CYAN}Running Full Cleanup...${COLORS_RESET}\n"
    bash Scripts/dozo-post-execution-policy.sh
    ;;
  4)
    echo -e "\n${COLORS_CYAN}Current Health Status:${COLORS_RESET}\n"
    cat "Workflow DB/DOZO-Health.json" 2>/dev/null || echo "Health file not found"
    ;;
  5)
    echo -e "\n${COLORS_CYAN}Today's Stats:${COLORS_RESET}\n"
    cat "Reports/$(date +%Y-%m-%d)/CLEAN-STATS.json" 2>/dev/null || echo "No stats for today"
    ;;
  6)
    echo -e "\n${COLORS_CYAN}Opening UI Viewer...${COLORS_RESET}\n"
    npm run ui:open
    ;;
  7)
    echo -e "\n${COLORS_CYAN}Building DMG...${COLORS_RESET}\n"
    cd AppBuild && npm run build:dmg
    ;;
  8)
    echo -e "\n${COLORS_GREEN}Goodbye!${COLORS_RESET}\n"
    exit 0
    ;;
  *)
    echo -e "\n${COLORS_YELLOW}Invalid option${COLORS_RESET}\n"
    ;;
esac

echo ""
echo -e "${COLORS_GREEN}${COLORS_BOLD}✅ Command completed${COLORS_RESET}\n"



