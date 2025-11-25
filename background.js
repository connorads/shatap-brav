// Shatap Brav - Background Service Worker

(() => {
  'use strict';

  // Handle extension installation/update
  chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
      console.log('[Shatap Brav] Extension installed');
    } else if (details.reason === 'update') {
      const version = chrome.runtime.getManifest().version;
      console.log(`[Shatap Brav] Extension updated to v${version}`);
    }
  });
})();
