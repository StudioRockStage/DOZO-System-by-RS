/**
 * DOZO System - Electron Auto Updater
 * Phase 16.7 - Main updater module
 */

import { checkForUpdates } from './check-updates.js';
import { applyUpdate } from './apply-update.js';

const UPDATE_CHECK_INTERVAL = 3600000; // 1 hour
const UPDATE_ENDPOINT = 'https://updates.rockstage.mx/manifest.json';

class DozoUpdater {
  constructor(app, mainWindow) {
    this.app = app;
    this.mainWindow = mainWindow;
    this.currentVersion = app.getVersion();
    this.checkInProgress = false;
    this.updateAvailable = null;
  }

  /**
   * Initialize auto-updater
   */
  initialize() {
    console.log(
      `[DOZO Updater] Initialized - Current version: ${this.currentVersion}`
    );

    // Check for updates on startup
    setTimeout(() => this.checkForUpdates(), 5000);

    // Set up periodic checks
    setInterval(() => this.checkForUpdates(), UPDATE_CHECK_INTERVAL);
  }

  /**
   * Manually check for updates
   */
  async checkForUpdates() {
    if (this.checkInProgress) {
      console.log('[DOZO Updater] Update check already in progress');
      return;
    }

    this.checkInProgress = true;

    try {
      console.log('[DOZO Updater] Checking for updates...');
      const updateInfo = await checkForUpdates(
        UPDATE_ENDPOINT,
        this.currentVersion
      );

      if (updateInfo.available) {
        this.updateAvailable = updateInfo;
        this.notifyUpdateAvailable(updateInfo);
      } else {
        console.log('[DOZO Updater] No updates available');
      }
    } catch (error) {
      console.error(
        '[DOZO Updater] Error checking for updates:',
        error.message
      );
    } finally {
      this.checkInProgress = false;
    }
  }

  /**
   * Notify main window about available update
   */
  notifyUpdateAvailable(updateInfo) {
    console.log(`[DOZO Updater] Update available: ${updateInfo.version}`);

    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('update-available', {
        currentVersion: this.currentVersion,
        newVersion: updateInfo.version,
        downloadUrl: updateInfo.url,
        sha256: updateInfo.sha256,
      });
    }
  }

  /**
   * Download and apply update
   */
  async downloadAndInstall() {
    if (!this.updateAvailable) {
      throw new Error('No update available');
    }

    try {
      console.log('[DOZO Updater] Starting download...');
      const updatePath = await applyUpdate(this.updateAvailable);

      console.log(`[DOZO Updater] Update downloaded to: ${updatePath}`);

      // Notify user to restart
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('update-downloaded', {
          version: this.updateAvailable.version,
          path: updatePath,
        });
      }

      return updatePath;
    } catch (error) {
      console.error('[DOZO Updater] Error downloading update:', error.message);
      throw error;
    }
  }

  /**
   * Get current update status
   */
  getStatus() {
    return {
      currentVersion: this.currentVersion,
      updateAvailable: this.updateAvailable,
      checkInProgress: this.checkInProgress,
    };
  }
}

export { DozoUpdater };
