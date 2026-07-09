# 🛠️ Development Guide

This guide covers how to set up and develop the AI README Maintainer action.

## Prerequisites

- Node.js 18+ and npm
- Git
- A Gemini API key (for testing)
- A GitHub token (for testing)

## Getting Started

### 1. Clone and Install

```bash
git clone https://github.com/Jenil1105/ai-readme-maintainer
cd ai-readme-maintainer
npm install
```

### 2. Build the Project

```bash
npm run build
```

This compiles TypeScript to JavaScript and outputs to the `dist/` folder.

### 3. Run Tests

```bash
npm test          # Run all tests
npm test:ui       # Run with interactive UI
npm test -- --coverage  # Generate coverage report
```

## Project Structure

```
src/
├── ai/                 # Gemini integration
├── analyzer/          # Change analysis
├── config/            # Configuration management
├── context/           # Repository context building
├── errors/            # Error handling
├── git/               # Git operations
├── logger/            # Logging utilities
├── prompts/           # AI prompts (Markdown)
├── updater/           # README updates
├── validator/         # Update validation
└── index.ts           # Entry point

tests/
├── config.test.ts     # Config tests
└── validator.test.ts  # Validator tests

dist/
└── index.js           # Compiled output
```

## Development Workflow

### Adding a New Feature

1. **Create the module** in `src/`
2. **Add types** in a `types.ts` file
3. **Write tests** in `tests/`
4. **Update index.ts** if it's a core feature
5. **Build and test**

Example: Adding a new feature to `src/myfeature/`

```bash
mkdir -p src/myfeature
# Create myfeature.ts and types.ts
npm test
npm run build
```

### Modifying AI Prompts

Prompts are stored in `src/prompts/` as Markdown files:

- `analyze.md` - Determines if README needs update
- `update.md` - Instructs AI on how to update README

Changes to prompts require:
1. Update the `.md` file
2. Test the new prompt locally
3. No code rebuild needed (prompts are loaded at runtime)

### Adding Tests

Use Vitest for testing:

```typescript
import { describe, it, expect } from "vitest";
import { myFunction } from "../src/myfeature/myfeature";

describe("MyFeature", () => {
  it("should do something", () => {
    const result = myFunction("input");
    expect(result).toBe("expected");
  });
});
```

Run tests with:

```bash
npm test
npm test -- --coverage  # See coverage
```

## Configuration

### Environment Variables (for local testing)

Create a `.env` file (not committed to git):

```bash
GEMINI_API_KEY=your_api_key_here
GITHUB_TOKEN=your_github_token
GITHUB_REPOSITORY=owner/repo
GITHUB_SHA=abc1234567890
GITHUB_REF_NAME=main
```

## Building and Publishing

### Build for Distribution

The action code is bundled and published to `dist/`:

```bash
npm run build
```

The `dist/index.js` file is what runs in GitHub Actions.

### Local Testing

Test the action locally with:

```bash
npm run dev
```

This runs the compiled code with your environment variables.

## Code Style

The project follows TypeScript best practices:

- Use `const` by default, `let` when needed
- Avoid `any` - use proper types
- Use meaningful variable names
- Add JSDoc comments for public functions
- Keep functions small and focused

### Type Safety

Strict TypeScript is enforced:

```typescript
// ✓ Good
function process(data: string): number {
  return data.length;
}

// ✗ Bad
function process(data: any): any {
  return data.length;
}
```

## Error Handling

Use custom error types from `src/errors/`:

```typescript
import { throwValidationError, throwAIError } from "../errors/errors";

// For validation errors
if (!isValid) {
  throwValidationError("Validation failed");
}

// For AI errors
if (!response) {
  throwAIError("Empty response", "GEMINI_EMPTY_RESPONSE");
}
```

## Logging

Use the logger from `src/logger/`:

```typescript
import { logger } from "../logger/logger";

logger.info("Processing files...");
logger.warning("File is large");
logger.error("Operation failed");
logger.logStep("Compiling", "pending");
logger.logStep("Compilation complete", "success");
```

## Performance Considerations

- **Prompt caching**: Prompts are cached in `promptLoader.ts`
- **Git operations**: Use efficient git commands
- **AI calls**: Minimize API calls with smart context building
- **File reading**: Read files once and reuse

## Debugging

### Enable Debug Logging

GitHub Actions respect `ACTIONS_STEP_DEBUG`:

```yaml
- name: Update README
  env:
    ACTIONS_STEP_DEBUG: true
  uses: ./
```

### Manual Testing

```bash
# Set up environment
export GEMINI_API_KEY="your-key"
export GITHUB_TOKEN="your-token"
export GITHUB_REPOSITORY="owner/repo"

# Run the action
npm run dev
```

## Common Tasks

### Update Dependencies

```bash
npm update              # Update all packages
npm outdated           # Check for updates
npm audit fix          # Fix vulnerabilities
```

### Generate Coverage Report

```bash
npm test -- --coverage
```

Coverage reports are generated in `coverage/`.

### Clean Build

```bash
rm -rf dist node_modules
npm install
npm run build
```

## Troubleshooting

### Build Errors

**Error**: `Cannot find module`
- Solution: Ensure all imports use `.js` extensions
- Example: `import { fn } from "./file.js"`

**Error**: `Type is not assignable`
- Solution: Check types match the interface
- Add type annotations to function parameters

### Test Failures

**Error**: `Test times out`
- Solution: Increase test timeout in vitest config
- Mock external APIs in tests

**Error**: `Module not found in tests`
- Solution: Ensure file paths are relative to test file
- Example: `../src/module` not `src/module`

## Contributing

When contributing:

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes and add tests
3. Run tests: `npm test`
4. Build: `npm run build`
5. Commit: `git commit -am "feat: add my feature"`
6. Push: `git push origin feature/my-feature`
7. Create a pull request

## Release Process

To release a new version:

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Build: `npm run build`
4. Commit: `git commit -am "release: v1.x.x"`
5. Tag: `git tag -a v1.x.x -m "Version 1.x.x"`
6. Push: `git push origin main --tags`

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Google Gemini API](https://aistudio.google.com/)
- [Vitest Documentation](https://vitest.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Getting Help

- Check existing GitHub issues
- Review the main [README.md](./README.md)
- Create a new issue with detailed information

---

Happy coding! 🚀
