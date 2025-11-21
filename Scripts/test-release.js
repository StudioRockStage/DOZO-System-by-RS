#!/usr/bin/env node

/**
 * DOZO System - Release Test Suite
 * Phase 16.7 - Test release pipeline
 */

import fs from 'fs';
import path from 'path';
import https from 'https';

const TEST_VERSION = '0.0.1';
const RELEASE_DIR = './release/releases';
const MANIFEST_URL = 'https://updates.rockstage.mx/manifest.json';

/**
 * Test utilities
 */
const test = {
  passed: 0,
  failed: 0,

  assert(condition, message) {
    if (condition) {
      console.log(`✅ ${message}`);
      this.passed++;
    } else {
      console.error(`❌ ${message}`);
      this.failed++;
    }
  },

  summary() {
    console.log(
      `\n📊 Test Results: ${this.passed} passed, ${this.failed} failed\n`
    );
    return this.failed === 0;
  },
};

/**
 * Fetch URL content
 */
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(data);
          } else {
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        });
      })
      .on('error', reject);
  });
}

/**
 * Test 1: Local manifest structure
 */
function testLocalManifest() {
  console.log('\n📝 Test 1: Local Manifest Structure\n');

  const manifestPath = './release-manifest.json';
  test.assert(fs.existsSync(manifestPath), 'Manifest file exists');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  test.assert(manifest.version !== undefined, 'Version field exists');
  test.assert(manifest.desktop !== undefined, 'Desktop section exists');
  test.assert(manifest.wordpress !== undefined, 'WordPress section exists');
  test.assert(manifest.releaseDate !== undefined, 'Release date exists');
  test.assert(manifest.rollback !== undefined, 'Rollback section exists');

  if (manifest.desktop) {
    test.assert(manifest.desktop.url !== undefined, 'Desktop URL defined');
    test.assert(manifest.desktop.file !== undefined, 'Desktop file defined');
  }

  if (manifest.wordpress) {
    test.assert(manifest.wordpress.url !== undefined, 'WordPress URL defined');
    test.assert(
      manifest.wordpress.file !== undefined,
      'WordPress file defined'
    );
  }
}

/**
 * Test 2: Release directory
 */
function testReleaseDirectory() {
  console.log('\n📁 Test 2: Release Directory\n');

  test.assert(fs.existsSync(RELEASE_DIR), 'Release directory exists');

  if (fs.existsSync(RELEASE_DIR)) {
    const files = fs.readdirSync(RELEASE_DIR);
    test.assert(
      files.length >= 0,
      `Release directory accessible (${files.length} files)`
    );
  }
}

/**
 * Test 3: Remote manifest access
 */
async function testRemoteManifest() {
  console.log('\n🌐 Test 3: Remote Manifest Access\n');

  try {
    const data = await fetchUrl(MANIFEST_URL);
    test.assert(true, 'Manifest accessible via CDN');

    const manifest = JSON.parse(data);
    test.assert(manifest.version !== undefined, 'Remote manifest has version');
    test.assert(
      manifest.desktop !== undefined,
      'Remote manifest has desktop section'
    );
    test.assert(
      manifest.wordpress !== undefined,
      'Remote manifest has wordpress section'
    );

    console.log(`   Current version: ${manifest.version}`);
  } catch (error) {
    test.assert(false, `CDN access failed: ${error.message}`);
  }
}

/**
 * Test 4: Version comparison
 */
function testVersionComparison() {
  console.log('\n🔢 Test 4: Version Comparison Logic\n');

  function compareVersions(v1, v2) {
    const parts1 = v1.replace(/^v/, '').split('.').map(Number);
    const parts2 = v2.replace(/^v/, '').split('.').map(Number);

    for (let i = 0; i < 3; i++) {
      if (parts1[i] > parts2[i]) return 1;
      if (parts1[i] < parts2[i]) return -1;
    }
    return 0;
  }

  test.assert(compareVersions('2.0.0', '1.0.0') > 0, '2.0.0 > 1.0.0');
  test.assert(compareVersions('1.0.0', '2.0.0') < 0, '1.0.0 < 2.0.0');
  test.assert(compareVersions('1.5.0', '1.5.0') === 0, '1.5.0 === 1.5.0');
  test.assert(compareVersions('1.0.1', '1.0.0') > 0, '1.0.1 > 1.0.0');
  test.assert(
    compareVersions('v2.0.0', '1.0.0') > 0,
    'v2.0.0 > 1.0.0 (with v prefix)'
  );
}

/**
 * Test 5: Update endpoint availability
 */
async function testUpdateEndpoint() {
  console.log('\n🔌 Test 5: Update Endpoint Availability\n');

  try {
    const data = await fetchUrl('https://updates.rockstage.mx/');
    test.assert(data.includes('DOZO'), 'Root endpoint accessible');
  } catch (error) {
    test.assert(false, `Endpoint failed: ${error.message}`);
  }
}

/**
 * Test 6: Rollback capability
 */
function testRollbackCapability() {
  console.log('\n🔄 Test 6: Rollback Capability\n');

  const manifestPath = './release-manifest.json';
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    test.assert(manifest.rollback !== undefined, 'Rollback section exists');

    if (manifest.rollback) {
      test.assert(
        manifest.rollback.previousVersion !== undefined,
        'Previous version tracked'
      );
      test.assert(
        manifest.rollback.enabled !== undefined,
        'Rollback enabled flag exists'
      );
    }
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('\n🧪 DOZO System - Release Test Suite\n');
  console.log('━'.repeat(50));

  // Run tests
  testLocalManifest();
  testReleaseDirectory();
  await testRemoteManifest();
  testVersionComparison();
  await testUpdateEndpoint();
  testRollbackCapability();

  // Summary
  console.log('\n' + '━'.repeat(50));
  const success = test.summary();

  process.exit(success ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
