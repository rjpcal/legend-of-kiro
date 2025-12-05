---
inclusion: always
---

# Development Guide

## Code Style and Quality

This project uses modern ES6 modules with explicit imports/exports and enforces consistent code style using ESLint and Prettier.

### Automatic Formatting

All code is automatically formatted on commit using pre-commit hooks. You don't need to manually format files, but you can run formatting commands if needed:

```bash
npm run format        # Format all files
npm run format:check  # Check formatting without changing files
```

### Linting

ESLint checks for code quality issues:

```bash
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix issues where possible
```

### Pre-commit Hooks

When you commit code, the following happens automatically:

1. **Staged JS files** are linted with ESLint and auto-fixed
2. **All staged files** (JS, JSON, MD) are formatted with Prettier
3. If any issues can't be auto-fixed, the commit is blocked

This ensures all code in the repository follows consistent style guidelines.

### Configuration

- **Prettier**: `.prettierrc.json` - Code formatting rules
- **ESLint**: `.eslintrc.json` - Code quality rules
- **Husky**: `.husky/pre-commit` - Git hook configuration
- **lint-staged**: `package.json` - Pre-commit file processing

### Style Guidelines

#### JavaScript

- **ES6 Modules**: Use `import`/`export` (no CommonJS `require`)
- Use single quotes for strings
- 4-space indentation
- Semicolons required
- 100 character line width
- ES2021 syntax

**Example:**

```javascript
// Good - ES6 modules
import { Entity } from './Entity.js';
export class Player extends Entity {}

// Bad - Don't use CommonJS
const Entity = require('./Entity');
module.exports = Player;
```

#### Naming Conventions

- Classes: PascalCase (e.g., `Player`, `CollisionSystem`)
- Functions/Methods: camelCase (e.g., `handleInput`, `checkCollision`)
- Constants: UPPER_SNAKE_CASE (e.g., `SCREEN_WIDTH`, `MAX_HEALTH`)
- Private properties: prefix with underscore (e.g., `_defaultWeapon`)

#### Comments

- Use JSDoc comments for functions and classes
- Include parameter types and return types
- Document complex logic with inline comments

#### File Organization

- One class per file
- File name matches class name
- Group related functionality in directories

### Bypassing Hooks (Not Recommended)

If you absolutely need to bypass pre-commit hooks:

```bash
git commit --no-verify -m "message"
```

**Note**: This should only be used in exceptional circumstances. All code should pass linting and formatting checks.

## Testing

Write tests for all new functionality:

- Unit tests for individual functions/classes
- Property-based tests for universal properties
- Integration tests for system interactions

### Writing Tests with ES6 Modules

All test files must import Jest globals:

```javascript
import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { MyClass } from './MyClass.js';

describe('MyClass', () => {
    test('does something', () => {
        expect(true).toBe(true);
    });
});
```

**Important:** Always include `.js` extension in import paths.

See the design document for testing strategy details.
