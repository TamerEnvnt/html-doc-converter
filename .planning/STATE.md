# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-02)

**Core value:** Both outputs must be high quality: PDF with visual fidelity, DOCX with real document structure for genuine editing.

## Current Position

Milestone: 3 (v1.2 Robustness & API Quality)
Phase: 23 of 23 (Resilience & Final Polish)
Plan: 1/1 complete
Status: Phase 23 complete - MILESTONE 3 COMPLETE
Last activity: 2026-02-15 — Plan 23-01 executed (3 tasks, signal handlers + exhaustive switch + final verification)

Progress (Milestone 3): ██████████ 100%

## Milestone 3 Overview

| Phase | Directory | Priority | Status |
|-------|-----------|----------|--------|
| 16 | `phases/16-browser-singleton-hardening` | P0 | Complete |
| 17 | `phases/17-error-handling-unification` | P0/P1 | Complete |
| 18 | `phases/18-type-design-cleanup` | P2 | Complete |
| 19 | `phases/19-architecture-packaging` | P2 | Complete |
| 20 | `phases/20-silent-failure-fixes` | P1/P2 | Complete |
| 21 | `phases/21-test-defect-fixes` | P1 | Complete |
| 22 | `phases/22-test-coverage-expansion` | P1 | Complete |
| 23 | `phases/23-resilience-final-polish` | P2 | Complete |

## Final Test Suite (Post-Milestone 3)

- 12 test files, 183 passed, 2 skipped (185 total)
- Coverage: 82.36% statements, 80.69% branches, 96.42% functions, 82.36% lines
- All thresholds met (70% lines/functions/statements, 60% branches)

## Review Findings Source

Full codebase review (2026-02-10) by 5 specialized agents:
- Code reviewer: 3 issues (P0 race condition, P1 TOCTTOU, P1 rename)
- Silent failure hunter: 14 findings across 6 files
- Test coverage analyzer: 11 gaps (cli.ts 0%, untested public APIs)
- Type design analyzer: 12 types analyzed, score 4.9/10
- Architecture explorer: circular dep, leaky API, missing exports

**All 29 findings addressed across Phases 16-23.**

## Baseline State (Post-Milestone 2)

### Test suite
- 10 test files, 141 passed, 2 skipped (143 total)
- Coverage: 74.5% statements, 75.3% branches, 90.6% functions
- Utils coverage: 97.9%

### Source files (12 files, ~1,600 lines)
```
src/
  cli.ts                   - CLI entry point (Commander, signal handlers, path validation)
  cli-helpers.ts           - Extracted CLI validation logic (determineFormats, parseTimeout, validateInputFile)
  index.ts                 - Curated named exports (public API surface)
  converters/
    pdf-converter.ts       - Puppeteer PDF generation (browser singleton)
    docx-converter.ts      - LibreOffice DOCX conversion (execFile, no shell)
  parsers/
    html-parser.ts         - Cheerio HTML parsing (public library API)
  utils/
    dependencies.ts        - Dep checking (execFile, no shell)
    errors.ts              - Error types (12 codes, exhaustive switch)
    logger.ts              - Verbose logging
    output-handler.ts      - Path resolution + validatePath()
    platform.ts            - Platform detection
    soffice.ts             - LibreOffice path detection (findSoffice, verifyLibreOffice)
```

### Test files (12 files)
```
tests/
  html-parser.test.ts           - 22 tests
  pdf-converter.test.ts         - 7 tests (browser management: singleton, concurrency, crash recovery)
  pdf-converter-api.test.ts     - 18 tests (convertToPDF, convertHTMLFileToPDF, convertHTMLStringToPDF)
  cli.test.ts                   - 20 tests (path validation, overwrite, timeout, signal handling)
  cli-helpers.test.ts           - 19 tests (determineFormats, parseTimeout, validateInputFile)
  docx-converter.test.ts        - 5 tests (execFile security)
  docx-converter-mocked.test.ts - 9 tests (convertToDOCX, convertHTMLFileToDOCX)
  e2e/conversion.test.ts        - 9 tests (2 skipped: no LibreOffice/SRS)
  utils/
    errors.test.ts              - 24 tests (includes exhaustiveness check)
    output-handler.test.ts      - 21 tests
    platform.test.ts            - 13 tests
    logger.test.ts              - 13 tests
    dependencies.test.ts        - 11 tests (was removed/merged - verify)
```

## Accumulated Decisions

- HTML as single source (avoids lossy PDF->DOCX)
- Puppeteer for PDF (full CSS support)
- LibreOffice for DOCX (best editability)
- Node.js + TypeScript (maintainability)
- Commander for CLI
- Vitest for testing
- Use execFile (not shell-based) for all process execution [Phase 11]
- Validate paths against cwd to prevent traversal [Phase 12]
- Overwrite protection with --force escape hatch [Phase 13]
- Coverage thresholds: 70% lines/functions/statements, 60% branches [Phase 14]
- Promise-lock pattern for singleton resources, null-before-close for cleanup safety [Phase 16]
- getBrowser() exported as public API [Phase 16]
- Throw-on-failure pattern: converters throw ConversionError, callers use try/catch [Phase 17]
- DOCXResult simplified to { outputPath: string } - "if you got a result, it worked" [Phase 17]
- Timeout detection: wrap Puppeteer calls, detect TimeoutError, re-throw as ConversionError(TIMEOUT) [Phase 17]
- CLI symmetric error handling: ConversionError passthrough before wrapping in generic codes [Phase 17]
- Type narrowing over unsafe casts for platform detection [Phase 18]
- HeadingLevel union literal type for constrained heading domains [Phase 18]
- DependencyStatus refactor deferred - idiomatic for internal status objects [Phase 18]
- Named exports in index.ts over export * - explicit API surface control [Phase 19]
- createRequire pattern for JSON imports in ESM projects [Phase 19]
- findSoffice/verifyLibreOffice in utils/soffice.ts (not converters) [Phase 19]
- Atomic mkdir: fs.mkdir({ recursive: true }) instead of access+mkdir [Phase 20]
- Error cause chains: always pass { cause: error } when re-throwing [Phase 20]
- EACCES detection: distinguish permission errors from not-found in fs checks [Phase 20]
- expect.assertions guard on try/catch tests with silent pass-through risk [Phase 21]
- Behavioral tests over source-scanning: test API contracts, not import strings [Phase 21]
- Magic byte validation: verify file format headers in E2E tests, not just file size [Phase 21]
- Extract-to-test: move inline CLI logic to importable helpers for vitest instrumentation [Phase 22]
- Separate mocked test files when vi.mock conflicts with existing integration tests [Phase 22]
- Signal handlers before program.parse() for full lifecycle coverage [Phase 23]
- TypeScript never type for exhaustive switch enforcement on ErrorCodes [Phase 23]

### Roadmap Evolution

- Milestone v1.0 MVP: Phases 1-10 (shipped 2026-02-04)
- Milestone v1.1 Security & Quality: Phases 11-15 (shipped 2026-02-08)
- Milestone v1.2 Robustness & API Quality: Phases 16-23 (shipped 2026-02-15)

## Session Continuity

Last session: 2026-02-15
Status: Phase 23 complete (1/1 plan). Milestone 3 (v1.2) complete. All 29 review findings addressed.
