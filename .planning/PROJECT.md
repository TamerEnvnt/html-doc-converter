# HTML Document Converter

## What This Is

A CLI tool that converts HTML documents (particularly structured documents with chapters, use cases, and styled elements) into both PDF and DOCX formats. HTML remains the source of truth; PDF provides pixel-perfect output for distribution; DOCX provides fully editable documents for Word users. Production-hardened with robust error handling, race-safe browser management, and comprehensive test coverage.

## Core Value

Both outputs must be high quality: PDF with visual fidelity to the HTML source, DOCX with real document structure (headings, paragraphs, tables) that enables genuine editing in Word.

## Requirements

### Validated

- HTML -> PDF conversion with full CSS support (print styles, gradients, colors) -- v1.0
- HTML -> DOCX conversion with editable structure (real headings, tables, paragraphs) -- v1.0
- CLI interface for single-file conversion -- v1.0
- Support for chapter-based HTML documents (TOC, sections, use case boxes) -- v1.0
- Cross-platform operation (macOS, Windows, Linux) -- v1.0
- Offline operation (no cloud dependencies) -- v1.0
- Command injection prevention (execFile, no shell) -- v1.1
- Path traversal protection (validatePath against cwd) -- v1.1
- Overwrite protection with --force escape hatch -- v1.1
- Race-safe browser singleton with crash recovery -- v1.2
- Unified error handling (ConversionError with 12 ErrorCodes) -- v1.2
- Clean public API with proper exports field -- v1.2
- Graceful signal handling (SIGINT/SIGTERM cleanup) -- v1.2
- 82%+ statement coverage, 185 tests -- v1.2
- All P1 bugs fixed (signal handlers, error masking, silent no-op) -- v1.3
- Code deduplication and dead code removal (16 unused functions removed) -- v1.3
- Type safety improvements (discriminated unions, type guards, readonly) -- v1.3
- 194 tests with 82.2% statements, 86.46% branches -- v1.3
- Critical bug fixes: signal handler hang, browser launch timeout, DOCX nullish coalescing -- v1.4
- Silent failure elimination: 5 catch-all blocks tightened with error discrimination -- v1.4
- Process lifecycle hardening: deferred exit, unhandledRejection handler -- v1.4
- API cleanup: removed getBrowser, centralized timeout constants, O(n^2) fix -- v1.4
- Type safety: 13 readonly fields, named ValidatedInput, narrowed OutputFormat -- v1.4
- 211 tests with 81.18% statements, 85.21% branches, 95.45% functions -- v1.4

### Active

(No active requirements -- all shipped)

### Out of Scope

- GUI/web interface -- CLI only for v1
- Batch processing -- single file at a time for v1
- Template customization -- fixed output format for v1
- DOCX -> HTML round-trip -- one-way conversion only
- PDF -> DOCX conversion -- both outputs derive from HTML source

## Context

**Current state (post v1.4):**
- 14 source files, ~1,852 lines TypeScript
- 14 test files, 211 tests (209 passed, 2 skipped)
- Coverage: 81.18% statements, 85.21% branches, 95.45% functions
- All 26 review findings from second 5-agent review addressed (v1.4)
- Total findings addressed across all milestones: 79 (v1.2: 29, v1.3: 24, v1.4: 26)

**Source document reference:** `/Users/tamer/Work/AI/Claude/InfraSizingCalculator/docs/srs/SRS_InfraSizingCalculator.html`

The SRS document uses:
- Print-optimized CSS (`@page`, `@media print`)
- Gradient headers for use cases
- Color-coded boxes (requirements, alt flows, exceptions)
- Multi-level TOC with chapter hierarchy
- Tables with alternating row colors
- A4 page sizing with specific margins

**Technical approach:**
- Puppeteer for HTML -> PDF (uses Chrome's print engine for perfect CSS)
- LibreOffice CLI for HTML -> DOCX (preserves document structure)
- Node.js orchestration layer with TypeScript

## Constraints

- **Tech stack**: Node.js with TypeScript -- maintainability and type safety
- **PDF engine**: Puppeteer/Chromium -- only tool that renders complex CSS correctly
- **DOCX engine**: LibreOffice CLI -- best HTML->DOCX fidelity for editability
- **Offline**: All processing local -- no cloud services
- **Cross-platform**: Must work on macOS, Windows, Linux

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| HTML as single source | Avoids lossy PDF->DOCX conversion; maintains structure | Good |
| Puppeteer for PDF | Only tool with full CSS support (gradients, print styles) | Good |
| LibreOffice for DOCX | Best editability vs alternatives (pandoc, html-to-docx) | Good |
| Node.js + TypeScript | Easy to maintain, good ecosystem for both tools | Good |
| execFile over shell execution | Prevents command injection (OWASP) | Good |
| Promise-lock singleton | Prevents browser race conditions under concurrent calls | Good |
| Throw-on-failure pattern | Consistent error handling across both converters | Good |
| Named exports in index.ts | Explicit API surface control, no leaky internals | Good |
| Extract-to-test pattern | Enables vitest instrumentation without refactoring CLI tests | Good |
| TypeScript never exhaustiveness | Compile-time enforcement when adding new ErrorCodes | Good |
| Discriminated unions over boolean+optional | Eliminates invalid state combinations at type level | Good |
| Type guard functions over unsafe casts | Runtime validation with TypeScript type narrowing | Good |
| Shared exec utility (exec.ts) | Single promisify(execFile) source, DRY across 3 consumers | Good |
| Dead code removal via grep verification | Verify unused before removing, prevents accidental API breakage | Good |
| Nullish coalescing for timeouts | ?? preserves explicit 0 vs \|\| which coerces to default | Good |
| Centralized timeout constants | utils/constants.ts eliminates magic numbers across 5+ locations | Good |
| Array-join over string concat | O(n) vs O(n^2) for chapter content extraction | Good |
| Named return types | ValidatedInput interface over anonymous object type | Good |

---
*Last updated: 2026-02-22 after v1.4 milestone*
