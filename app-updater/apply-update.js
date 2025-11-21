/**
 * DOZO System - Update Applicator
 * Phase 16.7 - Download and verify updates
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { app } from 'electron';

/**
 * Calculate SHA256 hash of file
 */
function calculateHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('data', data => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

/**
 * Download file from URL
 */
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);

    https
      .get(url, response => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }

        response.pipe(file);

        file.on('finish', () => {
          file.close();
          resolve(destPath);
        });
      })
      .on('error', error => {
        fs.unlink(destPath, () => {});
        reject(error);
      });

    file.on('error', error => {
      fs.unlink(destPath, () => {});
      reject(error);
    });
  });
}

/**
 * Apply update - download and verify
 */
export async function applyUpdate(updateInfo) {
  const downloadDir = path.join(app.getPath('userData'), 'updates');

  // Ensure download directory exists
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
  }

  const fileName = updateInfo.file || `dozo-update-${updateInfo.version}.dmg`;
  const downloadPath = path.join(downloadDir, fileName);

  console.log(`[DOZO Updater] Downloading from: ${updateInfo.url}`);
  console.log(`[DOZO Updater] Saving to: ${downloadPath}`);

  try {
    // Download file
    await downloadFile(updateInfo.url, downloadPath);

    // Verify integrity if SHA256 is provided
    if (updateInfo.sha256) {
      console.log('[DOZO Updater] Verifying integrity...');
      const fileHash = await calculateHash(downloadPath);

      if (fileHash !== updateInfo.sha256) {
        fs.unlinkSync(downloadPath);
        throw new Error('Hash mismatch - download corrupted');
      }

      console.log('[DOZO Updater] Integrity verified ✅');
    }

    return downloadPath;
  } catch (error) {
    if (fs.existsSync(downloadPath)) {
      fs.unlinkSync(downloadPath);
    }
    throw new Error(`Failed to apply update: ${error.message}`);
  }
}
