# 🔇 Shatap Brav

A Chrome extension that automatically mutes and blurs YouTube ads. Built with Manifest V3 for modern Chrome browsers.

<p align="center">
  <img src="icons/icon.png" alt="Shatap Brav Icon" width="512" height="512">
</p>

## Features

- 🔇 **Auto-mute ads**: Instantly mutes video when YouTube ads start playing
- 🫧 **Auto-blur ads**: Visually blurs the video during ads for extra distraction reduction (blur amount is configurable or can be disabled)
- 🚀 **Lightweight**: Uses efficient MutationObserver instead of polling
- 🔒 **Minimal permissions**: Only requests necessary permissions for functionality

## Installation (Development/Private Use)

### Prerequisites

- Google Chrome 88+ (Manifest V3 support)
- Developer mode enabled in Chrome extensions

### Load Unpacked Extension

1. **Download/Clone** this repository to your local machine
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top-right corner)
4. **Click "Load unpacked"** and select the extension directory
5. **Verify installation** - you should see "Shatap Brav" in your extensions list

## Manual Testing

### Test Ad Muting & Blurring

1. Go to any YouTube video: `https://www.youtube.com/watch?v=[VIDEO_ID]`
2. Wait for an ad to play (may need to refresh or try different videos)
3. **Expected**: Video should automatically mute and blur when ad starts (blur amount can be changed in the code, or set to 0 to disable)
4. **Expected**: Video should unmute and unblur when ad ends
5. Check browser console for `[Shatap Brav]` log messages

## Disclaimer

This extension modifies the user experience of YouTube by muting ads. While this is done client-side and doesn't block or remove ads (they still load and are played), it may upset someone. Use at your own risk and responsibility.
