# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Shatap Brav is a Chrome extension (Manifest V3) that automatically mutes and blurs YouTube ads. The extension runs entirely client-side and doesn't block ads - it modifies the user experience by muting audio and applying visual blur effects when YouTube's native `.ad-showing` class appears on the player.

## Architecture

### Core Components

- **manifest.json**: Manifest V3 configuration
  - Defines content script injection for `*.youtube.com/*`
  - Minimal permissions: `scripting` and host permissions for YouTube
  - Runs at `document_idle` for optimal performance

- **content.js**: Single content script (~77 lines)
  - Uses MutationObserver pattern to watch for `.ad-showing` class changes on `.html5-video-player`
  - Handles YouTube SPA navigation via `yt-navigate-finish` event
  - Injects CSS dynamically for GPU-accelerated blur effect
  - State tracking with `weMuted` flag to avoid interfering with user's manual mute preferences

### Key Implementation Details

1. **Ad Detection**: Observes the `.html5-video-player` element's class attribute for `.ad-showing`
   - Single observer per player instance (marked with `__sbObserved` flag)
   - Fires immediately on setup in case page loads mid-ad

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

## Development Workflow

### Testing the Extension

1. Load unpacked extension from `chrome://extensions/` (Developer mode enabled)
2. Navigate to any YouTube video and wait for an ad
3. Open browser console (F12) and filter for `[Shatap Brav]` logs
4. Expected behavior:
   - "Ad detected - muted & blurred" when ad starts
   - "Ad ended - audio restored" when ad finishes
   - No unmute if user manually muted during ad

### Configuration

User-configurable constants at top of content.js:
- `BLUR_PX`: Blur intensity in pixels (default: 20, set to 0 to disable)
- `STYLE_ID`: CSS injection element ID (default: 'sb-yta-style')

### Modifying the Extension

- **Changing blur amount**: Edit `BLUR_PX` in content.js
- **After code changes**: Click reload icon on extension card in `chrome://extensions/`
- **Testing changes**: Hard refresh YouTube page (Cmd+Shift+R / Ctrl+Shift+F5)

## Important Notes

- This extension modifies YouTube's user experience but doesn't block ads (ads still load and play)
- The extension uses efficient DOM observation patterns (MutationObserver) rather than polling
- Careful state management prevents interfering with user's manual audio controls
- YouTube SPA navigation requires special handling via custom events