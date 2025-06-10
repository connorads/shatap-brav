// Shatap Brav - YouTube Ad Muter
// Content script for muting YouTube ads

(function() {
  'use strict';

  const video = () => document.querySelector('video');
  const moviePlayer = () => document.getElementById('movie_player');

  function handleAdState() {
    const v = video();
    const mp = moviePlayer();
    if (!v || !mp) return;

    const isAd = mp.classList.contains('ad-showing');
    if (isAd && !v.muted) {
      v.muted = true;
      console.log('[Shatap Brav] Ad detected - muting');
    } else if (!isAd && v.muted) {
      v.muted = false;
      console.log('[Shatap Brav] Ad ended - unmuting');
    }
  }

  function init() {
    handleAdState();
    const mp = moviePlayer();
    if (mp) {
      new MutationObserver(handleAdState)
        .observe(mp, { attributes: true, attributeFilter: ['class'] });
    }
    setInterval(handleAdState, 2000);
    console.log('[Shatap Brav] Initialized on', location.href);
  }

  document.addEventListener('yt-navigate-finish', init);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();