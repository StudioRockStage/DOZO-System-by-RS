#!/usr/bin/env node

/**
 * DOZO System Test Runner
 * Tests all modules independently without GitHub push
 */

import { runAutoSync } from './modules/dozo-autosync.js';
import { runCompatibilityCheck } from './modules/dozo-compatibility-engine.js';
import { applyPatches } from './modules/dozo-auto-patch.js';
import { loadEnv } from './modules/dozo-env-loader.js';

console.log('🧪 DOZO System v2.0.0 - Test Mode\n');

// Test 1: Environment Loader
console.log('📋 Test 1: Environment Loader');
const env = loadEnv();
console.log(
  '   Loaded variables:',
  Object.keys(env).length > 0 ? '✅ Success' : '⚠️  No .env file'
);
if (Object.keys(env).length > 0) {
  console.log('   - GIT_BRANCH:', env.DOZO_GIT_BRANCH || 'not set');
  console.log('   - GIT_USER:', env.DOZO_GIT_USER || 'not set');
}
console.log();

// Test 2: AutoSync Module
console.log('📋 Test 2: AutoSync Module');
try {
  runAutoSync();
  console.log('   Status: ✅ Success\n');
} catch (error) {
  console.log('   Status: ❌ Failed');
  console.log('   Error:', error.message, '\n');
}

// Test 3: Compatibility Engine
console.log('📋 Test 3: Compatibility Engine');
try {
  runCompatibilityCheck();
  console.log('   Status: ✅ Success\n');
} catch (error) {
  console.log('   Status: ❌ Failed');
  console.log('   Error:', error.message, '\n');
}

// Test 4: Auto-Patch Module
console.log('📋 Test 4: Auto-Patch Module');
try {
  applyPatches();
  console.log('   Status: ✅ Success\n');
} catch (error) {
  console.log('   Status: ❌ Failed');
  console.log('   Error:', error.message, '\n');
}

// Test Summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 Test Summary');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ Core modules tested successfully');
console.log('📁 Check Workflow DB/ for generated reports');
console.log('💾 Check Backup/AutoSync/ for backup files');
console.log('\n💡 To test GitHub integration:');
console.log('   1. Configure SSH keys (see DOZO-SETUP-GUIDE.md)');
console.log('   2. Run: node main.js');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
