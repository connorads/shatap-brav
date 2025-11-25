# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Shatap Brav is a Chrome extension (Manifest V3) with two main features:

1. **Ad Muting & Blur**: Automatically mutes and blurs YouTube ads on both YouTube and YouTube Music
2. **YouTube Music Replay Button**: Adds an in-page button to loop songs without listening to ads between replays

The extension runs entirely client-side and doesn't block ads - it modifies the user experience by muting audio and applying visual blur effects when YouTube's native `.ad-showing` class appears on the player.

## Architecture

### Core Components

- **manifest.json**: Manifest V3 configuration
  - Defines content script injection for `*.youtube.com/*` (both scripts)
  - Minimal permissions: `scripting` and host permissions for YouTube
  - Runs at `document_idle` for optimal performance

- **content.js**: Ad muting/blurring script (~77 lines)
  - Runs on all `*.youtube.com/*` pages (including YouTube Music)
  - Uses MutationObserver pattern to watch for `.ad-showing` class changes on `.html5-video-player`
  - Handles YouTube SPA navigation via `yt-navigate-finish` event
  - Injects CSS dynamically for GPU-accelerated blur effect
  - State tracking with `weMuted` flag to avoid interfering with user's manual mute preferences

- **content-music.js**: YouTube Music replay button script (~300 lines)
  - Runs only on `music.youtube.com/*` pages
  - Injects "SB" loop button into `.right-controls-buttons.ytmusic-player-bar`
  - In-memory state management (resets on page reload, default: OFF)
  - Monitors video playback and restarts songs 1.5s before end
  - Avoids restarting during ads by checking `.ad-showing` class
  - Handles YouTube Music SPA navigation

- **popup.html/js/css**: Informational popup
  - Explains both features to users
  - No interactive controls (button is in-page on YouTube Music)
  - Shows extension version and feature status

### Key Implementation Details

#### Ad Muting & Blur (content.js)

1. **Ad Detection**: Observes the `.html5-video-player` element's class attribute for `.ad-showing`
   - Single observer per player instance (marked with `__sbObserved` flag)
   - Fires immediately on setup in case page loads mid-ad
   - Works on both YouTube and YouTube Music

2. **Mute Logic**:
   - Only mutes when ad starts AND video isn't already muted
   - Only unmutes if the extension was the one that muted (`weMuted` flag)
   - Respects user's manual mute preferences

3. **Blur Implementation**:
   - CSS filter injected once per page via `<style>` tag with ID `STYLE_ID`
   - GPU-accelerated: `.html5-video-player.ad-showing video { filter: blur(${BLUR_PX}px) }`
   - Configurable via `BLUR_PX` constant (set to 0 to disable)

4. **YouTube SPA Handling**:
   - Listens for `yt-navigate-finish` custom event
   - Reinitializes on navigation without duplicating observers
   - Resets `weMuted` state between page navigations

#### YouTube Music Replay Button (content-music.js)

1. **Button Injection**: Injects styled button into YouTube Music player controls
   - Target: `.right-controls-buttons.ytmusic-player-bar`
   - Retry pattern handles timing issues (waits for player bar)
   - Re-injects on SPA navigation
   - Button includes "SB" text overlay for visibility

2. **Replay Logic**:
   - Monitors video `currentTime` every 500ms when enabled
   - Restarts song by setting `currentTime = 0` at 1.5s before end
   - Uses `hasRestarted` flag to prevent multiple restarts
   - Critically: Checks for `.ad-showing` class to avoid restarting during ads

3. **State Management**:
   - In-memory `replayEnabled` boolean (default: false)
   - State persists across song navigation (stays enabled for new songs)
   - State resets on page reload/tab close
   - Visual button state: gray (off) / blue (on)

4. **Button Design**:
   - 40x40px circular button
   - Material Design loop icon with "SB" text overlay
   - Matches YouTube Music's styling with CSS variables
   - Full accessibility: aria-label, aria-pressed, keyboard support

## Development Workflow

### Testing the Extension

#### Test Ad Muting (YouTube & YouTube Music)

1. Load unpacked extension from `chrome://extensions/` (Developer mode enabled)
2. Navigate to any YouTube video and wait for an ad
3. Open browser console (F12) and filter for `[Shatap Brav]` logs
4. Expected behavior:
   - "Ad detected - muted & blurred" when ad starts
   - "Ad ended - audio restored" when ad finishes
   - No unmute if user manually muted during ad
5. Test on YouTube Music as well - same behavior should apply

#### Test YouTube Music Replay Button

1. Navigate to `music.youtube.com` and play a song
2. Look for "SB" loop button in bottom-right player controls
3. Click button - should turn blue (enabled)
4. Let song play to near end - should restart at 1.5s before ending
5. Navigate to different song - button should stay blue, new song also replays
6. Hard refresh page - button should reset to gray (disabled)
7. If ad plays during song end, verify song doesn't restart during ad

### Configuration

User-configurable constants:

**content.js:**

- `BLUR_PX`: Blur intensity in pixels (default: 20, set to 0 to disable)
- `STYLE_ID`: CSS injection element ID (default: 'sb-yta-style')

**content-music.js:**

- `RESTART_BEFORE_END_SECONDS`: How early to restart (default: 1.5 seconds)
- `CHECK_INTERVAL_MS`: Playback monitoring interval (default: 500ms)
- `BUTTON_CONTAINER_SELECTOR`: Where to inject button (default: '.right-controls-buttons.ytmusic-player-bar')

### Modifying the Extension

- **Changing blur amount**: Edit `BLUR_PX` in content.js
- **After code changes**: Click reload icon on extension card in `chrome://extensions/`
- **Testing changes**: Hard refresh YouTube page (Cmd+Shift+R / Ctrl+Shift+F5)

## Important Notes

- This extension modifies YouTube's user experience but doesn't block ads (ads still load and play)
- Ad muting works on both YouTube and YouTube Music platforms
- The extension uses efficient DOM observation patterns (MutationObserver) rather than polling
- Careful state management prevents interfering with user's manual audio controls
- YouTube SPA navigation requires special handling via custom events
- YouTube Music replay button state is per-tab and resets on page reload
- The replay feature specifically helps avoid ads when looping songs (ads don't play between replays)
