# Setup Guide

## Initial Setup

1. **Install dependencies**

    ```bash
    npm install
    ```

    This will install all required packages and set up Git hooks automatically.

2. **Verify setup**

    ```bash
    npm run lint
    npm run format:check
    npm test
    ```

    All commands should complete successfully.

3. **Start the game**
    ```bash
    npm start
    ```
    This will start a local server and open the game in your browser.

## What Gets Installed

### Development Tools

- **ESLint**: JavaScript linter for code quality
- **Prettier**: Code formatter for consistent style
- **Husky**: Git hooks manager
- **lint-staged**: Run linters on staged files

### Testing Tools

- **Jest**: Testing framework
- **jest-environment-jsdom**: DOM environment for tests

## Git Hooks

After running `npm install`, Git hooks are automatically configured:

- **pre-commit**: Runs ESLint and Prettier on staged files
    - Automatically fixes issues where possible
    - Blocks commit if unfixable issues exist

## Troubleshooting

### Hooks not running

If pre-commit hooks aren't running:

```bash
npm run prepare
chmod +x .husky/pre-commit
```

### ESLint errors

If you see ESLint errors:

```bash
npm run lint:fix
```

This will auto-fix most issues.

### Prettier formatting

If files aren't formatted correctly:

```bash
npm run format
```

### Clean install

If you encounter issues, try a clean install:

```bash
rm -rf node_modules package-lock.json
npm install
```

## IDE Integration

### VS Code

Install these extensions for the best experience:

- ESLint (dbaeumer.vscode-eslint)
- Prettier (esbenp.prettier-vscode)

Add to your `.vscode/settings.json`:

```json
{
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    }
}
```

### Other IDEs

Most modern IDEs support ESLint and Prettier. Check your IDE's documentation for setup instructions.

## Next Steps

1. Read the [README.md](README.md) for project overview
2. Check [.kiro/steering/development-guide.md](.kiro/steering/development-guide.md) for coding guidelines
3. Review the spec documents in `.kiro/specs/legend-of-kiro/` to understand the project structure
4. Start coding! The pre-commit hooks will ensure your code follows the style guide.
