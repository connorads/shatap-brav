// Shatap Brav - YouTube Music Autoplay (Loop) Feature

(() => {
  'use strict';

  /* ───── CONFIGURATION ───── */
  const RESTART_BEFORE_END_SECONDS = 1.5;  // Restart 1.5s before song ends
  const CHECK_INTERVAL_MS = 500;            // Check playback every 500ms
  const MAX_RETRY_ATTEMPTS = 8;             // Try to find video element for 4 seconds
  const RETRY_DELAY_MS = 500;

  // Button configuration
  const BUTTON_ID = 'sb-replay-btn';
  const BUTTON_STYLE_ID = 'sb-replay-style';
  const BUTTON_CONTAINER_SELECTOR = '.right-controls-buttons.ytmusic-player-bar';
  const PLAYER_BAR_SELECTOR = 'ytmusic-player-bar';
  const MAX_BUTTON_RETRY_ATTEMPTS = 10;
  const BUTTON_RETRY_DELAY_MS = 500;
  /* ───────────────────────── */

  // In-memory state - resets on tab reload (default: OFF)
  let replayEnabled = false;
  let videoElement = null;
  let checkInterval = null;
  let hasRestarted = false; // Prevent multiple restarts in the same cycle

  /* Restart the song by resetting video currentTime */
  function restartSong() {
    if (!videoElement || hasRestarted) return;

    hasRestarted = true;
    videoElement.currentTime = 0;
    console.log('[Shatap Brav Music] Song restarted via replay');

    // Reset flag after a short delay
    setTimeout(() => {
      hasRestarted = false;
    }, 2000);
  }

  /* Check if we're close to the end and restart if needed */
  function checkPlaybackPosition() {
    if (!videoElement || videoElement.paused) return;

    // CRITICAL: Don't restart if an ad is playing
    const player = document.querySelector('.html5-video-player');
    if (player?.classList.contains('ad-showing')) {
      return; // Skip restart during ads
    }

    const timeRemaining = videoElement.duration - videoElement.currentTime;

    // Restart if we're within the threshold and haven't already restarted
    if (timeRemaining <= RESTART_BEFORE_END_SECONDS && timeRemaining > 0 && !hasRestarted) {
      restartSong();
    }
  }

  /* Start monitoring video playback */
  function startMonitoring() {
    if (checkInterval) return; // Already monitoring

    console.log('[Shatap Brav Music] Monitoring started');
    checkInterval = setInterval(checkPlaybackPosition, CHECK_INTERVAL_MS);
  }

  /* Stop monitoring video playback */
  function stopMonitoring() {
    if (checkInterval) {
      clearInterval(checkInterval);
      checkInterval = null;
      hasRestarted = false;
      console.log('[Shatap Brav Music] Monitoring stopped');
    }
  }

  /* ───── BUTTON SYSTEM ───── */

  /* Inject button styles once on page load */
  function injectButtonStyles() {
    if (document.getElementById(BUTTON_STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = BUTTON_STYLE_ID;
    style.textContent = `
      .sb-replay-button {
        background: transparent;
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        padding: 8px;
        margin: 0 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--yt-spec-text-secondary, #aaa);
        transition: background-color 0.2s, color 0.2s;
      }

      .sb-replay-button:hover {
        background-color: rgba(255, 255, 255, 0.1);
        color: var(--yt-spec-text-primary, #fff);
      }

      .sb-replay-button:active {
        background-color: rgba(255, 255, 255, 0.2);
      }

      .sb-replay-button.active {
        color: var(--yt-spec-call-to-action, #3ea6ff);
      }

      .sb-replay-button.active:hover {
        color: var(--yt-spec-call-to-action, #3ea6ff);
      }

      .sb-replay-button svg {
        width: 24px;
        height: 24px;
        fill: currentColor;
      }

      .sb-replay-button:focus-visible {
        outline: 2px solid var(--yt-spec-call-to-action, #3ea6ff);
        outline-offset: 2px;
      }
    `;

    document.documentElement.appendChild(style);
    console.log('[Shatap Brav Music] Button styles injected');
  }

  /* Wait for player bar to appear in the DOM */
  function waitForPlayerBar(callback, attempts = 0) {
    const playerBar = document.querySelector(PLAYER_BAR_SELECTOR);

    if (playerBar) {
      callback(playerBar);
    } else if (attempts < MAX_BUTTON_RETRY_ATTEMPTS) {
      setTimeout(() => {
        waitForPlayerBar(callback, attempts + 1);
      }, BUTTON_RETRY_DELAY_MS);
    } else {
      console.error('[Shatap Brav Music] Player bar not found after retries');
    }
  }

  /* Create replay button element */
  function createReplayButton() {
    const btn = document.createElement('button');
    btn.id = BUTTON_ID;
    btn.className = 'sb-replay-button';
    btn.title = 'Toggle replay (loop current song)';
    btn.setAttribute('aria-label', 'Toggle replay');
    btn.setAttribute('role', 'button');
    btn.setAttribute('aria-pressed', 'false');

    // Material Design repeat icon with "SB" text overlay
    btn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
        <text x="12" y="15" text-anchor="middle" font-size="8" font-weight="bold" fill="currentColor">SB</text>
      </svg>
    `;

    return btn;
  }

  /* Inject replay button into player controls */
  function injectButton() {
    // Prevent duplicate injection
    if (document.getElementById(BUTTON_ID)) {
      console.log('[Shatap Brav Music] Button already exists');
      return;
    }

    waitForPlayerBar((playerBar) => {
      const container = playerBar.querySelector(BUTTON_CONTAINER_SELECTOR);

      if (!container) {
        console.error('[Shatap Brav Music] Button container not found');
        return;
      }

      const button = createReplayButton();
      button.addEventListener('click', handleButtonClick);
      updateButtonState(button);
      container.insertBefore(button, container.firstChild);
      console.log('[Shatap Brav Music] Replay button injected');
    });
  }

  /* Handle button click - toggle replay state */
  function handleButtonClick(event) {
    event.preventDefault();
    event.stopPropagation();

    replayEnabled = !replayEnabled;
    console.log('[Shatap Brav Music] Replay', replayEnabled ? 'enabled' : 'disabled');

    updateButtonState();

    if (replayEnabled) {
      if (videoElement) {
        startMonitoring();
      } else {
        initMusicPlayer();
      }
    } else {
      stopMonitoring();
    }
  }

  /* Update button visual state based on replayEnabled */
  function updateButtonState(button = null) {
    const btn = button || document.getElementById(BUTTON_ID);
    if (!btn) return;

    if (replayEnabled) {
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
    } else {
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
    }
  }

  /* ───────────────────────── */

  /* Wait for video element to appear in the DOM */
  function waitForVideoElement(callback, attempts = 0) {
    const video = document.querySelector('video');

    if (video) {
      callback(video);
    } else if (attempts < MAX_RETRY_ATTEMPTS) {
      setTimeout(() => {
        waitForVideoElement(callback, attempts + 1);
      }, RETRY_DELAY_MS);
    } else {
      console.error('[Shatap Brav Music] Video element not found after retries');
    }
  }

  /* Initialize music player monitoring */
  function initMusicPlayer() {
    waitForVideoElement((video) => {
      videoElement = video;
      console.log('[Shatap Brav Music] Video element found');

      if (replayEnabled) {
        startMonitoring();
      }
    });
  }

  /* Initialize on page load */
  function init() {
    console.log('[Shatap Brav Music] Active on', location.href);
    console.log('[Shatap Brav Music] Replay initially disabled (default)');

    // Inject button styles once
    injectButtonStyles();

    // Inject replay button into player controls
    injectButton();

    // Find video element (won't start monitoring unless enabled)
    initMusicPlayer();
  }

  /* Handle YouTube Music SPA navigation */
  document.addEventListener('yt-navigate-finish', () => {
    console.log('[Shatap Brav Music] Navigation detected');
    stopMonitoring();
    videoElement = null;
    hasRestarted = false;

    // Re-inject button (may be removed by YouTube's DOM updates)
    injectButton();

    // Re-initialize video element
    initMusicPlayer();

    // Note: replayEnabled state persists across navigation
  });

  /* Start the script */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
