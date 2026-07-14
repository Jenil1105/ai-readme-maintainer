# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-14

### Added

#### Phase 1: Repository Refactoring
- Moved Gemini initialization into reusable `GeminiClient` class
- Created centralized `promptLoader` for prompt loading and caching
- Separated Git utilities from Context Builder into dedicated `context/git.ts`
- Improved module organization with clear separation of concerns

#### Phase 2: Improved Repository Context
- Enhanced context structure with detailed `ChangedFile` objects
- Added file-level statistics (additions, deletions, change type)
- Implemented context summary with file type breakdowns
- Better structured prompts for improved AI understanding

#### Phase 3: Better Analyzer
- Improved prompt formatting with structured file diffs
- Added support for change type detection (added/modified/deleted)
- Enhanced analysis prompt with better instructions

#### Phase 4: Smarter Updater
- Improved update prompt with preservation guidelines
- Better handling of README formatting and structure

#### Phase 5: Validation Layer
- Comprehensive README validation (`validateReadmeContent`)
- Markdown integrity checks (headings, code blocks, links)
- Update validation with before/after comparison
- Warning system for non-critical issues

#### Phase 6: Configuration
- Support for customizable action inputs via `action.yml`
- Configuration loading and validation
- Supported inputs:
  - `gemini-api-key` (required)
  - `github-token` (required)
  - `model` (default: gemini-2.5-flash)
  - `branch-prefix` (default: readme-ai)
  - `commit-message` (default: docs: update README)
  - `pr-title` (default: docs: update README)
  - `base-branch` (default: main)
  - `dry-run` (default: false)

#### Phase 7: Better Pull Requests
- Enhanced PR body generation with analysis summary
- Support for affected sections listing
- Change statistics in PR description
- Better formatted and informative PR messages

#### Phase 8: Better Git
- Branch existence checking to avoid conflicts
- Graceful handling of existing branches
- Empty commit detection
- Better error messages for git operations
- Added utility functions: `getCurrentBranch()`, `getLastCommitSha()`

#### Phase 9: Logging
- Structured logging with `Logger` class
- GitHub Actions group support
- Step-based logging with status indicators (✓, ✗, ⟳)
- Debug, info, warning, and error levels

#### Phase 10: Error Handling
- Custom error types: `AIError`, `ValidationError`, `GitError`
- Comprehensive error handling with specific error codes
- User-friendly error messages
- Error code system for debugging

#### Phase 11: Testing
- Vitest integration for unit testing
- Test files for validator and config modules
- 15+ passing tests covering core functionality
- Test utilities and helpers

#### Phase 12: Documentation
- Comprehensive README.md with:
  - Feature overview
  - Quick start guide
  - Configuration examples
  - Architecture documentation
  - Usage examples
  - Security guidelines
- Development guide (DEVELOPMENT.md)
- Contributing guidelines
- Support and resources

#### Phase 13: Release & Versioning
- Semantic versioning (1.0.0)
- GitHub Actions workflow ready
- Published to GitHub Marketplace
- Changelog documentation

### Changed

- Restructured codebase for better maintainability
- Improved error handling throughout
- Enhanced logging for better debugging
- Better type safety with stricter TypeScript

### Fixed

- Git operations error handling
- Empty response handling from Gemini
- README validation edge cases

### Security

- Credentials handled via GitHub Secrets
- No sensitive data in logs
- Safe error messages without credential leaks

## Future Roadmap

### Planned Features (v1.1+)

- Incremental README updates (modify only affected sections)
- Support for multiple AI providers (OpenAI, Anthropic, Ollama)
- Additional documentation support (CONTRIBUTING.md, CHANGELOG.md, API.md)
- Multi-language documentation support
- Dry run improvements with diff visualization
- Custom validation rules
- Webhook integrations

---
