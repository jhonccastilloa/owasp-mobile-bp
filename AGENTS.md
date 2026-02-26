# AGENTS.md - Developer Guidelines for OWASP Mobile BP

## Project Overview

OWASP Mobile BP is a TypeScript CLI tool for executing OWASP mobile security verification on Android projects. It analyzes AndroidManifest permissions, build.gradle configurations, network security configs, SSL pinning, and more.

## Build & Development Commands

### Build
```bash
npm run build          # Build with esbuild (main build command)
npm run compile        # Compile TypeScript with tsc
npm run start          # Run compiled code (node dist/index.js)
```

### Install/Uninstall CLI
```bash
npm run bp-i           # Install globally as CLI (owasp-bp)
npm run bp-u           # Uninstall global CLI
```

### Testing
```bash
npm test               # Run tests in watch mode
npm test -- --run     # Run tests once
npm test -- --coverage # Run tests with coverage
```

### Linting
```bash
npm run lint          # Type check with tsc
```

## Code Style Guidelines

### TypeScript Configuration
- **Strict mode**: Enabled in tsconfig.json
- **Target**: ES2021
- **Module**: ESM (ES Modules)
- **Path aliases**: Use `@/*` for `src/*` imports

### Formatting (Prettier)
```json
{
  "tabWidth": 2,
  "arrowParens": "avoid",
  "singleQuote": true
}
```

### Imports
- Use path aliases: `import x from '@/path/to/module'`
- Relative imports allowed for local files when appropriate
- Sort imports logically (external, then internal)
- Use `.js` extension for ESM imports (e.g., `'@/utils/logger.js'`)

### Naming Conventions
- **Files**: camelCase (e.g., `androidManifestPermissionAnalyzer.ts`)
- **Directories**: camelCase (e.g., `androidManifestPermission/`)
- **Types/Interfaces**: PascalCase (e.g., `PermissionData`, `OwaspCategory`)
- **Enums**: PascalCase with PascalCase members (e.g., `PermissionStatus.OK`)
- **Functions**: camelCase (e.g., `androidManifestPermissionAnalyze`)
- **Constants**: PascalCase for exported, camelCase for internal

### Type Definitions
- Use interfaces for object shapes
- Use type aliases for unions/intersections
- Enable strict null checks
- Define types in `src/types/` directory

### Error Handling
- Use try-catch blocks for async operations
- Return empty arrays/objects on error rather than throwing
- Use `process.exit(1)` for fatal errors in CLI
- Use the `logger` utility from `@/utils/logger` for colored output
- Example pattern:
  ```typescript
  try {
    // operation
  } catch (error) {
    logger.error(`Error: ${error instanceof Error ? error.message : error}`);
    return [];
  }
  ```

### Code Organization
```
src/
  cli/                 # CLI parsing, help, version
    parser.ts
    help.ts
  commands/            # CLI command implementations
  constants/           # Static constants
  core/               # Business logic (interfaces, services)
    interfaces/
    services/
  platform/            # Platform-specific analyzers
    android/
      <feature>/
        <feature>Analyzer.ts
        <feature>Fixer.ts
        <feature>Utils.ts
  rules/               # OWASP rule definitions
  types/               # TypeScript type definitions
  utils/               # Utility functions
  __tests__/           # Test files
  index.ts             # Entry point
```

### Async/Await
- Prefer async/await over Promise chains
- Use `Promise.all()` for parallel execution
- Always handle async errors with try-catch

### CLI Best Practices
- Entry point in `src/index.ts`
- Use Commander for CLI argument parsing
- Implement `--help` and `--version` flags
- Use proper exit codes (0 for success, 1 for errors)
- Use the `logger` utility for colored output with chalk/ora

### Testing Strategy
- Use Vitest for testing
- Mock `process.argv`, `stdout`, `stderr` for CLI tests
- Test AnalyzerRunner and FixerRunner in isolation
- Use `vi.fn()` for mocking functions

## Key Files

- `esbuild.config.ts` - Build configuration
- `tsconfig.json` - TypeScript configuration
- `.prettierrc` - Code formatting rules
- `vitest.config.ts` - Test configuration
- `src/index.ts` - CLI entry point
- `src/cli/parser.ts` - Argument parsing
- `src/cli/help.ts` - Help text
- `src/utils/logger.ts` - Colored logging
- `src/commands/verify.ts` - Main verification logic
- `src/core/services/analyzerRunner.ts` - Analyzer orchestration
- `src/core/services/fixerRunner.ts` - Fixer orchestration
- `src/core/interfaces/index.ts` - TypeScript interfaces

## Constants

- OWASP categories: M1-M10
- Severity levels: 'E' (Error), 'W' (Warning)
- PermissionStatus enum values: OK, ERROR, NOT_FOUND, WARNING, DUPLICATE

## Dependencies

### Runtime
- `chalk` - Terminal colors
- `ora` - Spinners
- `commander` - CLI argument parsing
- `open` - Cross-platform URL opening
- `pdfmake` - PDF generation (lazy loaded)

### Dev
- `vitest` - Testing framework
- `esbuild` - Bundler

## Notes

- CLI tool intended for global installation
- Primary target: Android projects (Cordova/Ionic based on structure)
- pdfmake is lazy-loaded to reduce cold start time
- Use `logger.setVerbose(true)` for debug output
