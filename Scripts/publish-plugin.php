#!/usr/bin/env php
<?php
/**
 * DOZO System - WordPress Plugin Publisher
 * Phase 16.7 - Package and publish WordPress plugin
 */

// Configuration
define('PLUGIN_DIR', __DIR__ . '/../wordpress/plugins/dozo-system');
define('RELEASE_DIR', __DIR__ . '/../release/releases');
define('MANIFEST_FILE', __DIR__ . '/../release-manifest.json');

/**
 * Print colored output
 */
function printLine($message, $type = 'info') {
    $colors = [
        'info' => "\033[0;36m",
        'success' => "\033[0;32m",
        'error' => "\033[0;31m",
        'warning' => "\033[0;33m",
        'reset' => "\033[0m"
    ];
    
    $color = $colors[$type] ?? $colors['info'];
    echo $color . $message . $colors['reset'] . "\n";
}

/**
 * Get plugin version
 */
function getPluginVersion() {
    $pluginFile = PLUGIN_DIR . '/dozo-system.php';
    
    if (!file_exists($pluginFile)) {
        printLine("❌ Plugin file not found: $pluginFile", 'error');
        exit(1);
    }
    
    $content = file_get_contents($pluginFile);
    if (preg_match('/Version:\s*([0-9.]+)/', $content, $matches)) {
        return $matches[1];
    }
    
    return '1.0.0';
}

/**
 * Create ZIP archive
 */
function createZip($source, $destination) {
    if (!extension_loaded('zip')) {
        printLine("❌ ZIP extension not loaded", 'error');
        return false;
    }
    
    $zip = new ZipArchive();
    
    if ($zip->open($destination, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
        printLine("❌ Cannot create ZIP file: $destination", 'error');
        return false;
    }
    
    $source = realpath($source);
    $files = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($source),
        RecursiveIteratorIterator::LEAVES_ONLY
    );
    
    foreach ($files as $file) {
        if (!$file->isDir()) {
            $filePath = $file->getRealPath();
            $relativePath = substr($filePath, strlen($source) + 1);
            
            // Skip hidden files and node_modules
            if (strpos($relativePath, '.') === 0 || 
                strpos($relativePath, 'node_modules') !== false) {
                continue;
            }
            
            $zip->addFile($filePath, 'dozo-system/' . $relativePath);
        }
    }
    
    $zip->close();
    return true;
}

/**
 * Calculate SHA256 hash
 */
function calculateHash($filePath) {
    return hash_file('sha256', $filePath);
}

/**
 * Update manifest
 */
function updateManifest($version, $zipFile, $hash) {
    $manifest = [];
    
    if (file_exists(MANIFEST_FILE)) {
        $manifest = json_decode(file_get_contents(MANIFEST_FILE), true);
    }
    
    if (!isset($manifest['wordpress'])) {
        $manifest['wordpress'] = [];
    }
    
    $manifest['version'] = $version;
    $manifest['releaseDate'] = date('c');
    $manifest['wordpress']['file'] = basename($zipFile);
    $manifest['wordpress']['sha256'] = $hash;
    $manifest['wordpress']['url'] = 'https://updates.rockstage.mx/' . basename($zipFile);
    $manifest['wordpress']['size'] = filesize($zipFile);
    
    file_put_contents(MANIFEST_FILE, json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    
    return true;
}

/**
 * Upload to R2
 */
function uploadToR2($filePath, $remoteName) {
    $cmd = sprintf(
        'cd %s/infra/cloudflare/terraform && npx wrangler r2 object put dozo-updates/%s --file="%s" --remote',
        dirname(__DIR__),
        $remoteName,
        $filePath
    );
    
    printLine("📤 Uploading to R2: $remoteName", 'info');
    exec($cmd, $output, $returnCode);
    
    return $returnCode === 0;
}

/**
 * Main execution
 */
function main() {
    printLine("\n🚀 DOZO WordPress Plugin Publisher\n", 'info');
    
    // Check plugin directory
    if (!is_dir(PLUGIN_DIR)) {
        printLine("❌ Plugin directory not found: " . PLUGIN_DIR, 'error');
        exit(1);
    }
    
    // Get version
    $version = getPluginVersion();
    printLine("📦 Plugin version: $version", 'info');
    
    // Ensure release directory exists
    if (!is_dir(RELEASE_DIR)) {
        mkdir(RELEASE_DIR, 0755, true);
    }
    
    // Create ZIP
    $zipFile = RELEASE_DIR . "/dozo-wp-$version.zip";
    printLine("\n📦 Creating ZIP archive...", 'info');
    
    if (file_exists($zipFile)) {
        unlink($zipFile);
    }
    
    if (!createZip(PLUGIN_DIR, $zipFile)) {
        printLine("❌ Failed to create ZIP", 'error');
        exit(1);
    }
    
    printLine("✅ ZIP created: $zipFile", 'success');
    
    // Calculate hash
    $hash = calculateHash($zipFile);
    $shortHash = substr($hash, 0, 16);
    printLine("✅ SHA256: $shortHash...", 'success');
    
    // Update manifest
    printLine("\n📝 Updating manifest...", 'info');
    updateManifest($version, $zipFile, $hash);
    printLine("✅ Manifest updated", 'success');
    
    // Upload to R2
    printLine("\n☁️  Uploading to Cloudflare R2...\n", 'info');
    
    $success = true;
    if (!uploadToR2($zipFile, basename($zipFile))) {
        printLine("❌ Failed to upload plugin ZIP", 'error');
        $success = false;
    }
    
    if (!uploadToR2(MANIFEST_FILE, 'manifest.json')) {
        printLine("❌ Failed to upload manifest", 'error');
        $success = false;
    }
    
    if ($success) {
        printLine("\n🎉 WordPress plugin v$version published successfully!\n", 'success');
        printLine("📍 Download URL: https://updates.rockstage.mx/dozo-wp-$version.zip", 'info');
        printLine("📍 Manifest URL: https://updates.rockstage.mx/manifest.json\n", 'info');
    } else {
        printLine("\n❌ Publication failed\n", 'error');
        exit(1);
    }
}

// Run
main();




