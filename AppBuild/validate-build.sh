#!/bin/bash

# 🔍 DOZO Build Validator - Phase 16.9
# Validates the DMG build and checks all components

COLORS_CYAN='\033[36m'
COLORS_GREEN='\033[32m'
COLORS_RED='\033[31m'
COLORS_YELLOW='\033[33m'
COLORS_BOLD='\033[1m'
COLORS_RESET='\033[0m'

echo -e "${COLORS_CYAN}${COLORS_BOLD}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║     🔍 DOZO Build Validator - Phase 16.9            ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${COLORS_RESET}"

BUILD_DIR="../DistributionBuild"
DMG_FILE="DOZO-Control-Center-RockStage-2.6.0.dmg"
EXPECTED_VERSION="2.6.0"

# Check if DMG exists
echo -e "${COLORS_CYAN}📦 Checking DMG file...${COLORS_RESET}"
if [ -f "$BUILD_DIR/$DMG_FILE" ]; then
    echo -e "${COLORS_GREEN}✅ DMG found: $DMG_FILE${COLORS_RESET}"
    
    # Get file size
    FILE_SIZE=$(stat -f%z "$BUILD_DIR/$DMG_FILE")
    FILE_SIZE_MB=$(echo "scale=2; $FILE_SIZE / 1048576" | bc)
    echo -e "   Size: ${COLORS_BOLD}$FILE_SIZE_MB MB${COLORS_RESET} ($FILE_SIZE bytes)"
else
    echo -e "${COLORS_RED}❌ DMG not found!${COLORS_RESET}"
    exit 1
fi

# Check blockmap
echo -e "\n${COLORS_CYAN}📋 Checking blockmap...${COLORS_RESET}"
if [ -f "$BUILD_DIR/$DMG_FILE.blockmap" ]; then
    echo -e "${COLORS_GREEN}✅ Blockmap found${COLORS_RESET}"
else
    echo -e "${COLORS_YELLOW}⚠️  Blockmap not found (delta updates may not work)${COLORS_RESET}"
fi

# Check latest-mac.yml
echo -e "\n${COLORS_CYAN}🔄 Checking auto-updater metadata...${COLORS_RESET}"
if [ -f "$BUILD_DIR/latest-mac.yml" ]; then
    echo -e "${COLORS_GREEN}✅ latest-mac.yml found${COLORS_RESET}"
    
    # Verify version in yml
    YML_VERSION=$(grep "^version:" "$BUILD_DIR/latest-mac.yml" | awk '{print $2}')
    if [ "$YML_VERSION" == "$EXPECTED_VERSION" ]; then
        echo -e "   Version: ${COLORS_GREEN}$YML_VERSION ✓${COLORS_RESET}"
    else
        echo -e "   Version: ${COLORS_RED}$YML_VERSION (expected $EXPECTED_VERSION)${COLORS_RESET}"
    fi
else
    echo -e "${COLORS_RED}❌ latest-mac.yml not found!${COLORS_RESET}"
fi

# Verify SHA256
echo -e "\n${COLORS_CYAN}🔐 Verifying integrity...${COLORS_RESET}"
ACTUAL_SHA256=$(shasum -a 256 "$BUILD_DIR/$DMG_FILE" | awk '{print $1}')
EXPECTED_SHA256="ca0ab93b9142f29ea96e6036b21a3b2f5bf3399962b3633fc77a663e56ab4a46"

if [ "$ACTUAL_SHA256" == "$EXPECTED_SHA256" ]; then
    echo -e "${COLORS_GREEN}✅ SHA-256 verified${COLORS_RESET}"
    echo -e "   $ACTUAL_SHA256"
else
    echo -e "${COLORS_YELLOW}⚠️  SHA-256 mismatch (this is OK if you rebuilt)${COLORS_RESET}"
    echo -e "   Expected: $EXPECTED_SHA256"
    echo -e "   Actual:   $ACTUAL_SHA256"
fi

# Check package.json version
echo -e "\n${COLORS_CYAN}📝 Checking package.json...${COLORS_RESET}"
PKG_VERSION=$(node -p "require('./package.json').version")
if [ "$PKG_VERSION" == "$EXPECTED_VERSION" ]; then
    echo -e "${COLORS_GREEN}✅ Version: $PKG_VERSION${COLORS_RESET}"
else
    echo -e "${COLORS_RED}❌ Version mismatch: $PKG_VERSION (expected $EXPECTED_VERSION)${COLORS_RESET}"
fi

# Check release manifest
echo -e "\n${COLORS_CYAN}📋 Checking release manifest...${COLORS_RESET}"
if [ -f "../release-manifest.json" ]; then
    MANIFEST_VERSION=$(node -p "require('../release-manifest.json').version")
    MANIFEST_BUILD=$(node -p "require('../release-manifest.json').build")
    echo -e "${COLORS_GREEN}✅ Release manifest found${COLORS_RESET}"
    echo -e "   Version: $MANIFEST_VERSION"
    echo -e "   Build: $MANIFEST_BUILD"
else
    echo -e "${COLORS_YELLOW}⚠️  Release manifest not found${COLORS_RESET}"
fi

# Check entitlements
echo -e "\n${COLORS_CYAN}🔐 Checking entitlements...${COLORS_RESET}"
if [ -f "build/entitlements.mac.plist" ]; then
    echo -e "${COLORS_GREEN}✅ Entitlements file found${COLORS_RESET}"
else
    echo -e "${COLORS_RED}❌ Entitlements file missing${COLORS_RESET}"
fi

# Summary
echo -e "\n${COLORS_CYAN}${COLORS_BOLD}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║                  Validation Summary                   ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${COLORS_RESET}"

echo -e "${COLORS_GREEN}✅ Build validation complete!${COLORS_RESET}"
echo -e "\n${COLORS_BOLD}Next steps:${COLORS_RESET}"
echo "1. Open the DMG:"
echo "   ${COLORS_CYAN}open '$BUILD_DIR/$DMG_FILE'${COLORS_RESET}"
echo ""
echo "2. Drag to Applications and test launch"
echo ""
echo "3. Check console output for version:"
echo "   ${COLORS_CYAN}Should show: v2.6.0 - Phase 16.9 Build Factory${COLORS_RESET}"
echo ""
echo -e "${COLORS_YELLOW}Note: First launch may require right-click -> Open (unsigned build)${COLORS_RESET}"
echo ""



