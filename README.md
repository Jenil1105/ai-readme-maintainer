# AI README Maintainer

[![GitHub Action](https://img.shields.io/badge/action-AI%20README-blue?logo=github)](https://github.com/Jenil1105/ai-readme-maintainer)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen)](tests/)
[![TypeScript](https://img.shields.io/badge/typescript-5.0%2B-blue)](tsconfig.json)
[![License](https://img.shields.io/badge/license-ISC-blue)](LICENSE)

Automatically analyze your repository changes and generate intelligent README updates using Google's Gemini AI. This GitHub Action detects when documentation updates are needed and creates pull requests with AI-generated changes.

## Features

- **Intelligent Analysis**: Uses Gemini 2.5 Flash to analyze code changes
- **Smart Updates**: Only updates README when necessary
- **Validation**: Comprehensive validation ensures README integrity
- **Configurable**: Customize branch names, commit messages, and more
- **Dry Run Mode**: Preview changes without creating PRs
- **Error Handling**: Graceful error handling with meaningful logs
- **Well-Tested**: Comprehensive test suite for reliability

## Quick Start

### Installation

Add this action to your GitHub workflow:

```yaml
name: Update README

on:
  push:
    branches:
      - main

jobs:
  update-readme:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write

    steps:
      - uses: actions/checkout@v4

      - name: Update README with AI
        uses: Jenil1105/ai-readme-maintainer@v1
        with:
          gemini-api-key: ${{ secrets.GEMINI_API_KEY }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

## Inputs

### Required Inputs

- **`gemini-api-key`** (string, required)  
  Google Gemini API key for AI analysis. Get one from [Google AI Studio](https://aistudio.google.com/app/apikey)

- **`github-token`** (string, required)  
  GitHub token for creating pull requests. Use `${{ secrets.GITHUB_TOKEN }}`

### Optional Inputs

- **`model`** (string, default: `"gemini-2.5-flash"`)  
  Gemini model version to use for analysis

- **`branch-prefix`** (string, default: `"readme-ai"`)  
  Prefix for automatically created branches (e.g., `readme-ai/abc1234-1234567890`)

- **`commit-message`** (string, default: `"docs: update README"`)  
  Message for the commit containing README changes

- **`pr-title`** (string, default: `"docs: update README"`)  
  Title for the created pull request

- **`base-branch`** (string, default: `"main"`)  
  Target branch for the pull request

- **`dry-run`** (boolean, default: `"false"`)  
  Run analysis without creating a pull request (preview changes)

## Outputs

The action provides information through GitHub Actions logging:

- Repository analysis results
- Files analyzed and statistics
- README changes detected
- PR creation status

## Configuration Examples

### Basic Setup

```yaml
- uses: Jenil1105/ai-readme-maintainer@v1
  with:
    gemini-api-key: ${{ secrets.GEMINI_API_KEY }}
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Advanced Configuration

```yaml
- uses: Jenil1105/ai-readme-maintainer@v1
  with:
    gemini-api-key: ${{ secrets.GEMINI_API_KEY }}
    github-token: ${{ secrets.GITHUB_TOKEN }}
    model: "gemini-2.5-flash"
    branch-prefix: "docs"
    commit-message: "chore: auto-update documentation"
    pr-title: "Auto-generated documentation update"
    base-branch: "main"
```

### Dry Run Mode

Preview changes without creating a pull request:

```yaml
- uses: Jenil1105/ai-readme-maintainer@v1
  with:
    gemini-api-key: ${{ secrets.GEMINI_API_KEY }}
    github-token: ${{ secrets.GITHUB_TOKEN }}
    dry-run: "true"
```

## Architecture

The action follows a modular architecture with clear separation of concerns:

```
Repository Push
    ↓
Context Builder (collects files, diffs, README)
    ↓
Gemini Analyzer (determines if update needed)
    ↓
    ├─→ No Update Needed → Exit
    ↓
README Updater (generates new README)
    ↓
Validator (ensures README integrity)
    ↓
Git Operations (branch, commit, push)
    ↓
Pull Request Creator (opens PR for review)
```

### Project Structure

```
src/
├── ai/                    # AI client and prompts
│   ├── gemini.ts         # Gemini API client
│   ├── promptLoader.ts   # Prompt loading and caching
│   └── types.ts          # AI-related types
│
├── analyzer/             # Repository analysis
│   ├── analyzer.ts       # Main analyzer logic
│   ├── schema.ts         # Response schemas
│   └── types.ts          # Analysis types
│
├── context/              # Context building
│   ├── builder.ts        # Context assembly
│   ├── git.ts            # Git information extraction
│   ├── readme.ts         # README handling
│   └── types.ts          # Context types
│
├── updater/              # README updating
│   └── updater.ts        # Update generation
│
├── validator/            # Update validation
│   ├── validator.ts      # Validation logic
│   └── types.ts          # Validation types
│
├── git/                  # Git operations
│   ├── git.ts            # Git commands
│   └── pullRequest.ts    # GitHub PR creation
│
├── config/               # Configuration
│   └── config.ts         # Config loading and validation
│
├── logger/               # Logging
│   └── logger.ts         # Structured logging
│
├── errors/               # Error handling
│   └── errors.ts         # Custom error types
│
├── prompts/              # AI prompts
│   ├── analyze.md        # Analysis prompt
│   └── update.md         # Update prompt
│
└── index.ts              # Main entry point
```

## Testing

Run the test suite:

```bash
npm run test
npm run test:ui  # Open test UI
```

Tests cover:
- README validation
- Configuration loading
- Error handling
- Git operations

## How It Works

1. **Analysis Phase**
   - Collects changed files and diffs
   - Loads current README
   - Sends context to Gemini AI

2. **Decision Phase**
   - Gemini analyzes changes
   - Determines if README update needed
   - Returns reason and update instructions

3. **Update Phase**
   - Generates updated README
   - Validates Markdown integrity
   - Checks for meaningful changes

4. **Git Phase**
   - Creates feature branch
   - Commits changes
   - Pushes to repository

5. **PR Phase**
   - Creates pull request
   - Includes analysis summary
   - Ready for review

## Error Handling

The action gracefully handles:
- **Gemini Timeouts**: Retryable errors with clear messages
- **API Rate Limits**: Informative messages
- **Invalid JSON**: Helpful error descriptions
- **Git Failures**: Detailed git error messages
- **Validation Errors**: Specific validation failure reasons

## Example Workflow

```yaml
name: Keep README Fresh

on:
  push:
    branches:
      - main
    paths:
      - 'src/**'
      - 'docs/**'
      - 'package.json'
  workflow_dispatch:

jobs:
  update-readme:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2

      - name: Update README
        uses: Jenil1105/ai-readme-maintainer@v1
        with:
          gemini-api-key: ${{ secrets.GEMINI_API_KEY }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          branch-prefix: "docs-update"
          commit-message: "docs: sync README with latest changes"
```

## Security

- No credentials stored in logs
- API keys handled via GitHub Secrets
- Tokens never exposed in outputs
- Safe error messages without sensitive data

## What Gets Analyzed

The action intelligently analyzes:
- **Source code changes**: New features, functions, classes
- **Configuration changes**: Package versions, settings
- **Documentation existing**: Current README state
- **File statistics**: Types of files changed, scope of changes

The action **ignores**:
- Generated files (dist, build, etc.)
- CI/CD workflows (.github/workflows/)
- Dependencies (node_modules/)
- Version control (.git/)

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

ISC

## Support

- 📖 [Documentation](./docs)
- 🐛 [Report Issues](https://github.com/Jenil1105/ai-readme-maintainer/issues)
- 💬 [Discussions](https://github.com/Jenil1105/ai-readme-maintainer/discussions)

---

Made with ❤️ by Jenil
