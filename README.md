# 🔇 Shatap Brav

A Chrome extension that automatically mutes and blurs YouTube ads, plus adds a replay button to YouTube Music for looping songs without ads. Built with Manifest V3 for modern Chrome browsers.

<p align="center">
  <img src="icons/icon.png" alt="Shatap Brav Icon" width="512" height="512">
</p>

## Features

### Ad Muting & Blur (YouTube & YouTube Music)

- 🔇 **Auto-mute ads**: Instantly mutes video when YouTube ads start playing
- 🫧 **Auto-blur ads**: Visually blurs the video during ads for extra distraction reduction (blur amount is configurable or can be disabled)
- 🌐 **Works on both platforms**: Functions on both YouTube and YouTube Music

### YouTube Music Replay Button

- ♻️ **Loop songs without ads**: Click the "SB" button in player controls to automatically replay songs
- 🎵 **Skip ads between loops**: Avoids having to listen to ads when replaying the same song
- 🎨 **Seamless integration**: Button appears directly in YouTube Music's player controls
- 💾 **Per-tab state**: Replay state resets on page reload (off by default)

### General

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

**On YouTube:**

1. Go to any YouTube video: `https://www.youtube.com/watch?v=[VIDEO_ID]`
2. Wait for an ad to play (may need to refresh or try different videos)
3. **Expected**: Video should automatically mute and blur when ad starts
4. **Expected**: Video should unmute and unblur when ad ends
5. Check browser console for `[Shatap Brav]` log messages

**On YouTube Music:**

1. Go to `https://music.youtube.com/` and play a song
2. Wait for an ad (if applicable)
3. **Expected**: Same muting and blurring behavior as YouTube

### Test YouTube Music Replay Button

1. Navigate to `https://music.youtube.com/` and play a song
2. Look for the "SB" loop button in the bottom-right player controls
3. Click the button - it should turn blue (replay enabled)
4. Let the song play close to the end - it should automatically restart ~1.5 seconds before ending
5. Navigate to a different song - the button should stay blue and the new song should also replay
6. Hard refresh the page (Cmd+Shift+R) - the button should reset to gray (disabled)
7. **Verify**: If an ad plays near the end of a song, the song should NOT restart during the ad

## How It Works

- **Ad Muting/Blur**: Detects YouTube's native `.ad-showing` class on the video player and applies muting + blur effects client-side
- **Replay Button**: Monitors video playback time and restarts the song by setting `currentTime = 0` before it ends
- **Ad Avoidance**: Both features check for the `.ad-showing` class to avoid interfering with ads

## Disclaimer

This extension modifies the user experience of YouTube and YouTube Music by muting ads and allowing song loops without ads between replays. While this is done client-side and doesn't block or remove ads (they still load and are played), it may upset someone. Use at your own risk and responsibility.
