#!/usr/bin/env node

/**
 * DOZO System - Release Manager
 * Phase 16.7 - Create and publish releases
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';

const MANIFEST_PATH = './release-manifest.json';
const RELEASE_DIR = './release/releases';
const UPDATE_ENDPOINT = 'https://updates.rockstage.mx';

/**
 * Calculate SHA256 hash
 */
function calculateHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

/**
 * Upload file to R2
 */
function uploadToR2(filePath, remoteName) {
  try {
    const cmd = `cd infra/cloudflare/terraform && npx wrangler r2 object put dozo-updates/${remoteName} --file="${filePath}" --remote`;
    console.log(`📤 Uploading: ${remoteName}`);
    execSync(cmd, { stdio: 'inherit' });
    console.log(`✅ Uploaded: ${remoteName}`);
    return true;
  } catch {
    console.error('❌ Upload failed');
    return false;
  }
}

/**
 * Create release
 */
function createRelease(version, type = 'desktop') {
  console.log(`\n🚀 Creating ${type} release v${version}\n`);

  // Load current manifest
  let manifest = {};
  if (fs.existsSync(MANIFEST_PATH)) {
    manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  }

  // Update version
  const oldVersion = manifest.version || '0.0.0';
  manifest.version = version;
  manifest.releaseDate = new Date().toISOString();

  // Set up rollback
  if (!manifest.rollback) {
    manifest.rollback = {};
  }
  manifest.rollback.enabled = true;
  manifest.rollback.previousVersion = oldVersion;

  // Initialize sections if not exist
  if (!manifest.desktop) manifest.desktop = {};
  if (!manifest.wordpress) manifest.wordpress = {};
  if (!manifest.changelog) manifest.changelog = [];

  // Ensure release directory exists
  if (!fs.existsSync(RELEASE_DIR)) {
    fs.mkdirSync(RELEASE_DIR, { recursive: true });
  }

  let filesToUpload = [];

  if (type === 'desktop' || type === 'all') {
    const desktopFile = `dozo-desktop-${version}.dmg`;
    const desktopPath = path.join(RELEASE_DIR, desktopFile);

    // Check if desktop file exists
    if (fs.existsSync(desktopPath)) {
      console.log(`📦 Processing desktop app: ${desktopFile}`);
      const hash = calculateHash(desktopPath);
      const stats = fs.statSync(desktopPath);

      manifest.desktop = {
        file: desktopFile,
        sha256: hash,
        url: `${UPDATE_ENDPOINT}/${desktopFile}`,
        size: stats.size,
      };

      filesToUpload.push({ local: desktopPath, remote: desktopFile });
      console.log(`✅ Desktop SHA256: ${hash.substring(0, 16)}...`);
    } else {
      console.log(`⚠️  Desktop file not found: ${desktopPath}`);
      console.log(`   Skipping desktop release...`);
    }
  }

  if (type === 'wordpress' || type === 'all') {
    const wpFile = `dozo-wp-${version}.zip`;
    const wpPath = path.join(RELEASE_DIR, wpFile);

    // Check if WordPress file exists
    if (fs.existsSync(wpPath)) {
      console.log(`📦 Processing WordPress plugin: ${wpFile}`);
      const hash = calculateHash(wpPath);
      const stats = fs.statSync(wpPath);

      manifest.wordpress = {
        file: wpFile,
        sha256: hash,
        url: `${UPDATE_ENDPOINT}/${wpFile}`,
        size: stats.size,
      };

      filesToUpload.push({ local: wpPath, remote: wpFile });
      console.log(`✅ WordPress SHA256: ${hash.substring(0, 16)}...`);
    } else {
      console.log(`⚠️  WordPress file not found: ${wpPath}`);
      console.log(`   Skipping WordPress release...`);
    }
  }

  // Save manifest
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`\n📝 Manifest updated: ${MANIFEST_PATH}`);

  // Upload manifest
  filesToUpload.push({ local: MANIFEST_PATH, remote: 'manifest.json' });

  // Upload all files
  console.log(`\n☁️  Uploading to Cloudflare R2...\n`);
  let uploadSuccess = true;

  for (const file of filesToUpload) {
    if (!uploadToR2(file.local, file.remote)) {
      uploadSuccess = false;
    }
  }

  if (uploadSuccess) {
    console.log(`\n🎉 Release v${version} published successfully!\n`);
    console.log(`📍 Update URL: ${UPDATE_ENDPOINT}/manifest.json`);
    console.log(`🔄 Rollback available: v${oldVersion}\n`);
  } else {
    console.error(`\n❌ Release failed - some uploads were unsuccessful\n`);
    process.exit(1);
  }
}

/**
 * Rollback to previous version
 */
function rollback() {
  console.log('\n🔄 Rolling back to previous version...\n');

  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('❌ No manifest found');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

  if (!manifest.rollback || !manifest.rollback.previousVersion) {
    console.error('❌ No rollback version available');
    process.exit(1);
  }

  const previousVersion = manifest.rollback.previousVersion;
  console.log(`📦 Rolling back to v${previousVersion}`);

  // Create release with previous version
  createRelease(previousVersion, 'all');
}

// CLI Interface
const args = process.argv.slice(2);
const command = args[0];
const version = args[1];
const type = args[2] || 'all';

if (!command) {
  console.log(`
DOZO Release Manager - Phase 16.7

Usage:
  node scripts/release.js create <version> [type]
  node scripts/release.js rollback

Examples:
  node scripts/release.js create 2.7.0 all
  node scripts/release.js create 2.7.0 desktop
  node scripts/release.js create 2.7.0 wordpress
  node scripts/release.js rollback

Types:
  all        - Release desktop + WordPress (default)
  desktop    - Desktop app only
  wordpress  - WordPress plugin only
  `);
  process.exit(0);
}

if (command === 'create') {
  if (!version) {
    console.error('❌ Version required');
    process.exit(1);
  }
  createRelease(version, type);
} else if (command === 'rollback') {
  rollback();
} else {
  console.error(`❌ Unknown command: ${command}`);
  process.exit(1);
}
