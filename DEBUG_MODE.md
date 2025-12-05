# Debug Mode Features

## Overview

Debug mode is enabled during development to make testing and debugging easier. It provides quick navigation and testing tools without needing to manually traverse the entire game world.

## Minimap Teleportation

### How It Works

When debug mode is enabled, the minimap becomes interactive:

- **Hover**: Cells highlight with a green border when you hover over them
- **Click**: Click any cell to instantly teleport to that screen
- **Visual Indicator**: A green "DEBUG" label appears above the minimap

### Features

- ✅ Instant teleportation to any screen in the 6x6 overworld grid
- ✅ Smooth fade transition (200ms fade out/in)
- ✅ Player centered on new screen after teleport
- ✅ Minimap automatically updates to show new position
- ✅ Screen marked as visited after teleport
- ✅ Console logging for debugging: `[DEBUG] Teleporting to screen (x, y)`

### Usage

1. Start the game in the overworld
2. Look at the minimap in the top-right corner
3. You'll see a green "DEBUG" label above it
4. Hover over any cell to see it highlight
5. Click to instantly teleport to that screen

### Enabling/Disabling Debug Mode

**Currently Enabled By Default** in `src/scenes/OverworldScene.js`:

```javascript
// Create HUD with debug mode enabled
this.hud = new HUD(this, {
    debugMode: true, // Enable debug mode for development
    onMinimapTeleport: (gridX, gridY) => this.handleMinimapTeleport(gridX, gridY),
});
```

**To Disable for Production:**
Change `debugMode: true` to `debugMode: false` or remove the option entirely.

## Implementation Details

### Files Modified

- **`src/ui/Minimap.js`**: Added interactive cells, hover effects, click handlers, and debug label
- **`src/ui/HUD.js`**: Added debug mode options and teleport callback support
- **`src/scenes/OverworldScene.js`**: Added `handleMinimapTeleport()` method and enabled debug mode

### Technical Details

- Uses Phaser's `setInteractive()` for clickable cells
- Hover effects use `pointerover` and `pointerout` events
- Click handler uses `pointerdown` event
- Teleport uses same fade transition system as normal screen transitions
- Prevents teleportation during existing transitions
- Validates target screen exists before teleporting

## Benefits for Development

### Faster Testing

- No need to walk through multiple screens to reach a specific location
- Instantly test dungeon entrances at different locations
- Quickly verify screen configurations across the entire map

### Easier Debugging

- Jump to problem areas immediately
- Test edge cases at specific coordinates
- Verify screen transitions from any location

### Improved Workflow

- Saves time during iterative development
- Makes it easier to show specific features to others
- Reduces repetitive navigation during testing

## Future Enhancements

Potential additions to debug mode:

- Toggle debug mode with a keyboard shortcut (e.g., F3)
- Display screen coordinates on hover
- Show dungeon/store information on hover
- Add god mode (invincibility)
- Add speed boost toggle
- Display FPS counter
- Show collision hitboxes
- Teleport to specific dungeons
- Spawn enemies/collectibles on demand

## Notes

- Debug mode only affects the overworld scene (not dungeons)
- Teleportation respects the same transition system as normal movement
- All game state is preserved during teleportation
- The feature is completely non-intrusive when disabled
- No performance impact when debug mode is off
