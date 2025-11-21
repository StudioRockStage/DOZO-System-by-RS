/**
 * DOZO System - Update Checker
 * Phase 16.7 - Check for available updates
 */

import https from 'https';

/**
 * Compare semantic versions
 */
function compareVersions(v1, v2) {
  const parts1 = v1.replace(/^v/, '').split('.').map(Number);
  const parts2 = v2.replace(/^v/, '').split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    if (parts1[i] > parts2[i]) return 1;
    if (parts1[i] < parts2[i]) return -1;
  }
  return 0;
}

/**
 * Fetch manifest from update server
 */
function fetchManifest(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, res => {
        let data = '';

        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }

        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(new Error('Invalid JSON response'));
          }
        });
      })
      .on('error', reject);
  });
}

/**
 * Check for updates
 */
export async function checkForUpdates(endpoint, currentVersion) {
  try {
    const manifest = await fetchManifest(endpoint);

    if (!manifest.version || !manifest.desktop) {
      throw new Error('Invalid manifest format');
    }

    const comparison = compareVersions(manifest.version, currentVersion);

    if (comparison > 0) {
      return {
        available: true,
        version: manifest.version,
        url: manifest.desktop.url,
        sha256: manifest.desktop.sha256,
        file: manifest.desktop.file,
        releaseDate: manifest.releaseDate || new Date().toISOString(),
      };
    }

    return {
      available: false,
      currentVersion,
    };
  } catch (error) {
    throw new Error(`Failed to check for updates: ${error.message}`);
  }
}
