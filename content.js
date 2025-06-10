// Shatap Brav - YouTube Ad Muter + Blurrer

(() => {
  'use strict';

  /* ───── USER SETTINGS ───── */
  const BLUR_PX   = 20;            // 0 ⇒ disable blurring
  const STYLE_ID  = 'sb-yta-style';
  /* ───────────────────────── */

  let weMuted = false;             // tracks if *we* muted, so we can restore

  /* Injects the CSS rule once per page */
  function injectStyle () {
    if (BLUR_PX === 0 || document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* GPU blur kicks in only while player has .ad-showing */
      .html5-video-player.ad-showing video {
        filter: blur(${BLUR_PX}px) !important;
      }
    `;
    document.documentElement.appendChild(style);
  }

  /* Mute/un-mute exactly when .ad-showing flips on the player element */
  function handleAdState () {
    const player = document.querySelector('.html5-video-player');
    const vid    = player?.querySelector('video');
    if (!player || !vid) return;

    const isAd = player.classList.contains('ad-showing');

    if (isAd && !vid.muted) {
      vid.muted = true;
      weMuted   = true;
      console.log('[Shatap Brav] Ad detected - muted & blurred');
    } else if (!isAd && weMuted) {
      /* Only un-mute if *we* were the ones that muted */
      if (vid.muted) vid.muted = false;
      weMuted = false;
      console.log('[Shatap Brav] Ad ended - audio restored');
    }
  }

  /* Sets up one MutationObserver per player instance */
  function observePlayer () {
    const player = document.querySelector('.html5-video-player');
    if (!player || player.__sbObserved) return;

    player.__sbObserved = true;  // mark to avoid double-observing
    new MutationObserver(handleAdState)
      .observe(player, { attributes: true, attributeFilter: ['class'] });

    /* Fire once in case we landed in the middle of an ad */
    handleAdState();
  }

  /* Called on first load and every SPA navigation */
  function init () {
    injectStyle();
    observePlayer();
    weMuted = false;             // reset between navigations
    console.log('[Shatap Brav] Active on', location.href);
  }

  /* YouTube is an SPA – catch internal navigations */
  document.addEventListener('yt-navigate-finish', init);

  /* Kick things off when the initial DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();