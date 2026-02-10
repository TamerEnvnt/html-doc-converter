# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-02)

**Core value:** Both outputs must be high quality: PDF with visual fidelity, DOCX with real document structure for genuine editing.

## Current Position

Milestone: 3 (v1.2 Robustness & API Quality)
Phase: 17 of 23 (Error Handling Unification)
Plan: 17-02-PLAN.md (2 tasks remaining)
Status: 17-01 complete, ready for 17-02
Last activity: 2026-02-10 -- Plan 17-01 executed (DOCX throw-based errors + output verification)

Progress (Milestone 3): █░░░░░░░░░ 12.5%

## Milestone 3 Overview

| Phase | Directory | Priority | Status |
|-------|-----------|----------|--------|
| 16 | `phases/16-browser-singleton-hardening` | P0 | Complete |
| 17 | `phases/17-error-handling-unification` | P0/P1 | 1/2 plans done |
| 18 | `phases/18-type-design-cleanup` | P2 | Not started |
| 19 | `phases/19-architecture-packaging` | P2 | Not started |
| 20 | `phases/20-silent-failure-fixes` | P1/P2 | Not started |
| 21 | `phases/21-test-defect-fixes` | P1 | Not started |
| 22 | `phases/22-test-coverage-expansion` | P1 | Not started |
| 23 | `phases/23-resilience-final-polish` | P2 | Not started |

## Review Findings Source

Full codebase review (2026-02-10) by 5 specialized agents:
- Code reviewer: 3 issues (P0 race condition, P1 TOCTTOU, P1 rename)
- Silent failure hunter: 14 findings across 6 files
- Test coverage analyzer: 11 gaps (cli.ts 0%, untested public APIs)
- Type design analyzer: 12 types analyzed, score 4.9/10
- Architecture explorer: circular dep, leaky API, missing exports

## Baseline State (Post-Milestone 2)

### Test suite
- 10 test files, 141 passed, 2 skipped (143 total)
- Coverage: 74.5% statements, 75.3% branches, 90.6% functions
- Utils coverage: 97.9%

### Source files (10 files, ~1,400 lines)
```
src/
  cli.ts                   - CLI entry point (Commander, path validation, overwrite protection)
  index.ts                 - Library re-exports (pdf, docx, html-parser)
  converters/
    pdf-converter.ts       - Puppeteer PDF generation (browser singleton)
    docx-converter.ts      - LibreOffice DOCX conversion (execFile, no shell)
  parsers/
    html-parser.ts         - Cheerio HTML parsing (public library API)
  utils/
    dependencies.ts        - Dep checking (execFile, no shell)
    errors.ts              - Error types (12 codes including security)
    logger.ts              - Verbose logging
    output-handler.ts      - Path resolution + validatePath()
    platform.ts            - Platform detection
```

### Test files (10 files)
```
tests/
  html-parser.test.ts      - 22 tests
  pdf-converter.test.ts    - 7 tests (browser management: singleton, concurrency, crash recovery)
  cli.test.ts              - 19 tests (path validation, overwrite, timeout)
  docx-converter.test.ts   - 5 tests (execFile security)
  e2e/conversion.test.ts   - 9 tests (2 skipped: no LibreOffice/SRS)
  utils/
    errors.test.ts         - 23 tests
    output-handler.test.ts - 21 tests
    platform.test.ts       - 13 tests
    logger.test.ts         - 13 tests
    dependencies.test.ts   - 11 tests
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

### Roadmap Evolution

- Milestone v1.0 MVP: Phases 1-10 (shipped 2026-02-04)
- Milestone v1.1 Security & Quality: Phases 11-15 (shipped 2026-02-08)
- Milestone v1.2 Robustness & API Quality: 8 phases (16-23), created 2026-02-10

## Session Continuity

Last session: 2026-02-10
Status: Plan 17-01 complete. Ready to execute 17-02-PLAN.md (PDF timeout + CLI cleanup).
