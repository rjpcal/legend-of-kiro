# Game Assets Guide

This document describes the procedurally generated game assets created for Legend of Kiro.

## Overview

All game assets are created programmatically using Phaser's Graphics API in the BootScene. This approach allows for:

- No external asset dependencies (except kiro-logo.png)
- Easy customization through code
- Consistent visual style
- Small file size

**Integration Status:** ✅ All sprites are now integrated and being used throughout the game:

- Doors use proper door sprites (locked/unlocked)
- Health meter uses heart sprites
- Collectibles use coin, health, weapon, and armor sprites
- Dungeon entrances use portal sprites
- Obstacles support type-based sprites (wall, rock, tree)

## Asset Categories

### 1. Kiro Sprite (Player Character)

**File**: `kiro-logo.png` (loaded as 'kiro')
**Features**:

- Uses the existing kiro-logo.png image
- Ripple effect applied via RippleEffect system
- Ghostly appearance with pulsing animation

### 2. Enemy Sprites

**Types**: zombie, skeleton, ghoul, spirit
**Animation Frames**:

- `idle` - Single frame, stationary pose
- `move` - 3 frames for walking animation
- `attack` - Single frame with attack indicator
- `defeat` - Friendly version with smile

**Boss Variants**: Each enemy type has a boss version with:

- Larger size
- Gold crown decoration
- Enhanced visual presence
- Slower animation speed

**Colors**:

- Zombie: Green (#4a7c59)
- Skeleton: Gray (#d4d4d4)
- Ghoul: Purple (#8b4789)
- Spirit: Blue (#6b9bd1)

### 3. Environment Sprites

#### Terrain Tiles (32x32)

- `grass` - Green with texture variation
- `stone` - Gray stone floor
- `dirt` - Brown dirt path
- `water` - Blue water tile

#### Obstacles (32x32)

- `wall` - Brick wall with pattern
- `rock` - Gray boulder
- `tree` - Tree with trunk and foliage

#### Doors (32x32)

- `door_locked` - Brown door with gold lock
- `door_unlocked` - Green door with handle

#### Collectibles (32x32)

- `coin` - Gold coin with shine
- `health` - Red heart
- `weapon` - Silver sword
- `armor` - Blue shield

#### Special

- `dungeon_entrance` - Purple portal with swirl effect

### 4. UI Sprites

#### Health Meter

- `heart_full` - Red filled heart
- `heart_empty` - Dark outline heart
- `heart_half` - Light red half heart

#### Minimap (16x16 cells)

- `minimap_cell` - Dark gray cell
- `minimap_cell_current` - Purple highlighted cell (Kiro purple #790ECB)
- `minimap_cell_visited` - Medium gray visited cell

#### Buttons (120x40)

- `button_normal` - Purple button (#790ECB)
- `button_hover` - Lighter purple (#9a3ee0)
- `button_pressed` - Darker purple (#5a0e9b)

#### Panels

- `store_panel` - 400x300 dark panel with purple border
- `inventory_panel` - 200x400 dark panel with purple border

#### Bars

- `xp_bar_bg` - 200x20 dark background bar
- `xp_bar_fill` - 200x16 purple fill bar

## Color Scheme

The game uses the Kiro brand colors:

- **Primary Purple**: #790ECB
- **Light Purple**: #9a3ee0
- **Dark Purple**: #5a0e9b
- **Dark Background**: #0a0a0a
- **Gold Accents**: #ffd700

## Animation System

Animations are defined in BootScene's `defineAnimations()` method:

- Enemy animations use frame-based sequences
- Kiro uses the ripple effect system instead of frame animation
- All animations run at 60 FPS for smooth gameplay

## Customization

To modify assets:

1. Open `src/scenes/BootScene.js`
2. Find the relevant creation method:
    - `createEnemySprite()` - Enemy appearance
    - `createTerrainTile()` - Terrain tiles
    - `createObstacleSprite()` - Obstacles
    - `createCollectibleSprite()` - Collectibles
    - `createUISprites()` - UI elements
3. Adjust colors, sizes, or drawing logic
4. Reload the game to see changes

## Configuration Constants

All sprite sizes use configuration constants to avoid hard-coded values:

- `SPRITE_CONFIG.SIZE` - Base sprite size (32px)
- `TILE_SIZE` - Tile size (32px)
- `UI_CONFIG` - Various UI element sizes

This makes it easy to scale the entire game by changing a few values.

## Future Enhancements

Potential improvements:

- Add more animation frames for smoother movement
- Create particle effects for special abilities
- Add weather effects (rain, fog)
- Create animated terrain (water ripples, grass sway)
- Add more enemy types with unique appearances
