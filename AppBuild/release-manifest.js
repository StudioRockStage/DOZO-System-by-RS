#!/usr/bin/env node
/**
 * 🚀 DOZO Release Manifest Generator
 * Phase 16.9 - Build Factory & DMG Generator
 *
 * Generates and updates release metadata before building
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

console.log(`${COLORS.cyan}${COLORS.bright}
╔═══════════════════════════════════════════════════════╗
║   🚀 DOZO Release Manifest Generator - Phase 16.9    ║
╚═══════════════════════════════════════════════════════╝
${COLORS.reset}`);

// Read package.json to get current version
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const version = packageJson.version;
const buildNumber = '16.9';
const releaseDate = new Date().toISOString();

console.log(
  `${COLORS.blue}📦 Version: ${COLORS.bright}${version}${COLORS.reset}`
);
console.log(
  `${COLORS.blue}🔢 Build: ${COLORS.bright}${buildNumber}${COLORS.reset}`
);
console.log(
  `${COLORS.blue}📅 Release Date: ${COLORS.bright}${releaseDate}${COLORS.reset}\n`
);

// Path to root release-manifest.json
const rootManifestPath = path.join(__dirname, '..', 'release-manifest.json');

// Generate release manifest
const releaseManifest = {
  version: version,
  build: buildNumber,
  releaseDate: releaseDate,
  type: 'dmg-internal',
  platform: 'macOS',
  desktop: {
    file: `DOZO-Control-Center-RockStage-${version}.dmg`,
    sha256: '',
    url: `https://updates.rockstage.mx/dozo-desktop-${version}.dmg`,
    size: 0,
  },
  wordpress: {
    file: `dozo-wp-${version}.zip`,
    sha256: '',
    url: `https://updates.rockstage.mx/dozo-wp-${version}.zip`,
    size: 0,
  },
  changelog: [
    'Phase 16.9 - Build Factory & DMG Generator implemented',
    'Complete electron-builder configuration',
    'macOS entitlements and code signing setup',
    'Universal binary support (x64 + ARM64)',
    'Auto-updater system ready for testing',
  ],
  minVersion: {
    desktop: '2.0.0',
    wordpress: '1.0.0',
  },
  rollback: {
    enabled: true,
    previousVersion: '2.5.0',
  },
  metadata: {
    productName: packageJson.productName,
    author: packageJson.author,
    description: packageJson.description,
  },
};

// Write release manifest to root
try {
  fs.writeFileSync(
    rootManifestPath,
    JSON.stringify(releaseManifest, null, 2) + '\n'
  );
  console.log(
    `${COLORS.green}✅ Release manifest updated: ${rootManifestPath}${COLORS.reset}`
  );
} catch (error) {
  console.error(
    `${COLORS.yellow}⚠️  Warning: Could not write to root manifest: ${error.message}${COLORS.reset}`
  );
}

// Also save a copy in AppBuild for reference
const localManifestPath = path.join(__dirname, 'release-manifest.json');
try {
  fs.writeFileSync(
    localManifestPath,
    JSON.stringify(releaseManifest, null, 2) + '\n'
  );
  console.log(
    `${COLORS.green}✅ Local manifest created: ${localManifestPath}${COLORS.reset}`
  );
} catch (error) {
  console.error(
    `${COLORS.yellow}⚠️  Warning: Could not write local manifest: ${error.message}${COLORS.reset}`
  );
}

console.log(
  `\n${COLORS.magenta}${COLORS.bright}🎯 Ready to build DMG!${COLORS.reset}`
);
console.log(`${COLORS.cyan}Run: npm run build:dmg-universal${COLORS.reset}\n`);
