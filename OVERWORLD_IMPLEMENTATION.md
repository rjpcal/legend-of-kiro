# Overworld and Screen Transitions Implementation

## Overview
Implemented task 12: Overworld and screen transitions for Legend of Kiro game. The overworld now loads screens from the world configuration JSON file and supports smooth scrolling transitions between screens.

## What Was Implemented

### 12.1 Create Overworld Scene
- **Configuration Loading**: Overworld now loads screen data from `assets/world-config.json`
- **Screen Rendering**: Each screen renders:
  - Terrain background (grass, stone, sand, water)
  - Obstacles from configuration
  - Enemies with proper stats from enemy type definitions
  - Collectibles (coins, health, weapons, armor)
  - Dungeon entrance markers (purple rectangles with "DUNGEON" label)
  - Store entrance markers (gold rectangles with "STORE" label)
- **Screen Management**: Tracks current screen position (x, y) in 6x6 grid
- **Entity Cleanup**: Properly destroys all entities when transitioning between screens

### 12.2 Implement Screen Transition System
- **Edge Detection**: Detects when player reaches screen edge (within 20 pixels)
- **Boundary Checking**: Prevents transitions outside the 6x6 world grid
- **Smooth Scrolling**: Camera smoothly scrolls to adjacent screen over 500ms
- **Player Repositioning**: Player appears on opposite edge of new screen after transition
- **Minimap Updates**: Minimap updates to show new position and marks visited screens
- **Input Blocking**: Player input disabled during transitions to prevent issues

### 12.3 Add Dungeon Entrances
- **Visual Markers**: Purple rectangles mark dungeon entrances on overworld screens
- **Collision Detection**: Detects when player collides with dungeon entrance
- **Scene Transition**: Transitions to DungeonScene when player enters dungeon
- **State Preservation**: Saves player state (health, inventory, stats, return location) to registry
- **Store Entrances**: Also implemented store entrance detection and transitions
- **Minimap Integration**: Dungeon locations marked on minimap at game start

## Key Features

### Configuration-Driven Design
All screen layouts, enemy placements, and collectibles are defined in `world-config.json`:
```json
{
  "x": 0,
  "y": 0,
  "terrain": "grass",
  "obstacles": [...],
  "enemies": [...],
  "collectibles": [...],
  "dungeonEntrance": {"id": 1, "x": 400, "y": 500},
  "storeEntrance": null
}
```

### Screen Transition Flow
1. Player reaches edge of screen
2. System checks if adjacent screen exists
3. Camera smoothly scrolls to new screen
4. Old screen entities destroyed
5. New screen loaded from configuration
6. Player positioned on opposite edge
7. Minimap updated

### Entrance System
- **Dungeon Entrances**: Purple markers that transition to DungeonScene
- **Store Entrances**: Gold markers that transition to StoreScene
- **Collision-Based**: Player must walk into entrance marker to trigger transition
- **State Management**: Player state saved before transitioning to other scenes

## Technical Details

### Constants
- `SCREEN_WIDTH`: 800 pixels
- `SCREEN_HEIGHT`: 600 pixels
- `EDGE_THRESHOLD`: 20 pixels (distance from edge to trigger transition)
- Transition duration: 500ms with Sine.easeInOut easing

### Screen Coordinates
- Overworld is a 6x6 grid (0-5 in both x and y)
- Each screen is 800x600 pixels
- Player starts at screen (0, 0)

### Terrain Colors
- Grass: #2d5016 (dark green)
- Stone: #4a4a4a (gray)
- Sand: #c2b280 (tan)
- Water: #1e3a8a (blue)

## Requirements Validated
- **5.5**: Loads overworld layout from world configuration JSON
- **11.2**: Creates overworld screens based on configuration data
- **5.1**: Transitions to adjacent screen when player reaches edge
- **5.2**: Smooth scrolling transition between screens
- **5.4**: Transitions from overworld to dungeon when entering entrance

## Testing
Run the game with `npm start` and test:
1. Move to screen edges to trigger transitions
2. Verify smooth scrolling between screens
3. Check that enemies and collectibles load correctly on each screen
4. Walk into dungeon entrance markers to test scene transitions
5. Verify minimap updates correctly

## Next Steps
The overworld system is now complete and ready for:
- Task 13: Dungeon system implementation
- Task 16: Store system implementation
- Task 20: Creating detailed world configuration with all 36 screens
