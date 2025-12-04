# User Context - Legend of Kiro Game

## Technology Preferences
- **Framework**: Phaser.js (HTML5 game framework)
- **Language**: JavaScript
- **Rendering**: HTML5 Canvas via Phaser

## Game Design Preferences

### Combat System
- Default melee swing attack
- Collectible melee weapons (upgrades)
- Ranged attack: throw melee weapon when health is at max
- Attack button required

### Progression & Economy
- **Coins**: Currency for purchasing weapons, armor at in-game stores
- **XP System**: Gained by defeating enemies
- **Leveling**: XP thresholds increase max health meter size
- **Win Condition**: Complete all 4 underworld dungeons

### World Design
- **Overworld**: 6x6 screen grid
- **Dungeons**: 4 dungeons, each with 5-10 rooms (configurable)
- **Configuration**: JSON-based world design for easy tweaking
- **Minimap**: Shows relative position in current area

### Dungeon Features
- Locked doors requiring keys
- Puzzles: push blocks, hidden switches under blocks, defeat all enemies, mazes
- Final boss in last room of each dungeon
- Dungeon completion increases max health

### Visual Style
- Sprite sheets with animations
- Kiro: rippling ghost effect using kiro-logo.png
- Enemies: friendly versions of undead monsters (zombies, skeletons, ghouls, spirits)
- Particle effects for attack hits and collectibles
- Health meter pulses on damage (no screen shake)
- Kiro brand colors: Purple (#790ECB) and dark theme

### Audio
- Optional background music
- Sound effects: coin collect, enemy hit, Kiro hit, health pickup, dungeon enter, dungeon complete
