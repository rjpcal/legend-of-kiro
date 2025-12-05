# Save/Load System Implementation Guide

## Overview

The Legend of Kiro game now includes a complete save/load system that automatically saves game progress and allows players to continue from where they left off.

## Features

### Automatic Saving

The game automatically saves in the following situations:

1. **Screen Transitions** - When moving between overworld screens
2. **Entering Dungeons** - Before entering any dungeon
3. **Entering Stores** - Before entering a store
4. **Boss Defeat** - After defeating a dungeon boss
5. **Victory** - When completing all dungeons

### Save Data Structure

The save system stores:

**Player Data:**

- Current and max health
- XP and level
- Coins
- Inventory items
- Equipped weapon and armor
- Current screen position
- Local position within screen

**World State:**

- Collected items
- Defeated enemies
- Completed dungeons
- Unlocked doors
- Visited screens

**Settings:**

- Music enabled/disabled
- Sound effects enabled/disabled

## Usage

### For Players

1. **Starting a New Game**
    - Click "New Game" on the main menu
    - This will clear any existing save data and start fresh

2. **Loading a Saved Game**
    - If a save file exists, a "Load Game" button will appear on the main menu
    - Click "Load Game" to continue from your last save point

3. **Auto-Save**
    - The game saves automatically at key points
    - No manual save action is required
    - Progress is preserved when entering dungeons, stores, or moving between screens

### For Developers

#### Accessing the Save System

```javascript
// Get save system from registry
const saveSystem = this.registry.get('saveSystem');
```

#### Manual Save

```javascript
// Get current game state
const gameState = saveSystem.getCurrentGameState(this);

// Save game
const success = saveSystem.saveGame(
    gameState.playerState,
    gameState.worldState,
    gameState.settings
);
```

#### Manual Load

```javascript
// Load save data
const saveData = saveSystem.loadGame();

if (saveData) {
    // Restore game state to registry
    saveSystem.restoreGameState(this, saveData);
}
```

#### Check for Save Data

```javascript
// Check if save exists
const hasSave = saveSystem.hasSaveData();
```

#### Delete Save

```javascript
// Delete save data
saveSystem.deleteSave();
```

## Implementation Details

### SaveSystem Class

Located in `src/systems/SaveSystem.js`

**Key Methods:**

- `createSaveData(playerState, worldState, settings)` - Creates save data structure
- `validateSaveData(data)` - Validates save data integrity
- `saveGame(playerState, worldState, settings)` - Saves to localStorage
- `loadGame()` - Loads from localStorage
- `restoreGameState(scene, saveData)` - Restores state to registry
- `getCurrentGameState(scene)` - Gets current state from registry
- `hasSaveData()` - Checks if save exists
- `deleteSave()` - Deletes save data

### Storage

- Uses browser `localStorage` for persistence
- Save key: `legend_of_kiro_save`
- Data format: JSON
- Includes version number for future compatibility

### Error Handling

The system handles:

- Missing save data (returns null)
- Corrupted save data (returns null, logs error)
- Invalid save structure (validation fails)
- localStorage errors (caught and logged)

## Testing

Comprehensive unit tests are available in `src/systems/SaveSystem.test.js`

Run tests:

```bash
npm test -- src/systems/SaveSystem.test.js
```

## Integration Points

### BootScene

- Initializes SaveSystem
- Stores in registry for access by other scenes

### MainMenuScene

- Checks for existing save data
- Shows "Load Game" button if save exists
- Handles new game (clears save data from registry)
- Handles load game (restores from localStorage)

### OverworldScene

- Auto-saves on screen transitions
- Auto-saves before entering dungeons
- Auto-saves before entering stores

### DungeonScene

- Auto-saves after boss defeat
- Auto-saves on victory (all dungeons complete)

## Future Enhancements

Possible improvements:

- Multiple save slots
- Cloud save support
- Save file export/import
- Save file timestamps and metadata display
- Autosave frequency settings
- Manual save option in pause menu
