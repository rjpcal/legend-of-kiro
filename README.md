# Legend of Kiro

A 2D top-down adventure game inspired by the original Legend of Zelda, built with Phaser.js.

## Getting Started

### Quick Start (No Setup)

1. Open `index.html` in a web browser

### Development Setup

For development with linting, formatting, and testing:

1. See [SETUP.md](SETUP.md) for detailed setup instructions
2. Quick version:
    ```bash
    npm install
    npm start
    ```

## Development Setup

Install dependencies:

```bash
npm install
```

This will also set up Git hooks for automatic linting and formatting.

## Testing

Run the test suite:

```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

## Code Quality

This project uses ESLint and Prettier to maintain consistent code style.

### Linting

```bash
npm run lint          # Check for linting errors
npm run lint:fix      # Fix linting errors automatically
```

### Formatting

```bash
npm run format        # Format all JS, JSON, and MD files
npm run format:check  # Check if files are formatted correctly
```

### Pre-commit Hooks

The project uses Husky and lint-staged to automatically:

- Run ESLint and fix issues
- Format code with Prettier
- Check all staged files before commit

This ensures all committed code follows the project's style guidelines.

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
