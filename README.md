# Legend of Kiro

A 2D top-down adventure game inspired by the original Legend of Zelda, built with Phaser.js.

## Getting Started

1. Open `index.html` in a web browser
2. Or use a local server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js http-server
   npx http-server
   ```
3. Navigate to `http://localhost:8000` in your browser

## Project Structure

```
legend-of-kiro/
├── index.html              # Main HTML file
├── src/
│   ├── main.js            # Game configuration
│   ├── scenes/            # Phaser scenes
│   │   ├── BootScene.js
│   │   ├── MainMenuScene.js
│   │   ├── OverworldScene.js
│   │   ├── DungeonScene.js
│   │   ├── StoreScene.js
│   │   └── GameOverScene.js
│   ├── entities/          # Game entities
│   │   ├── Entity.js
│   │   ├── Player.js
│   │   └── Enemy.js
│   └── systems/           # Game systems
│       ├── CollisionSystem.js
│       └── CombatSystem.js
└── assets/                # Game assets (sprites, audio, etc.)
```

## Controls

- Arrow Keys or WASD: Move Kiro
- (More controls to be added)

## Development

This game is being built incrementally following the spec-driven development approach. See `.kiro/specs/legend-of-kiro/` for requirements, design, and tasks.
