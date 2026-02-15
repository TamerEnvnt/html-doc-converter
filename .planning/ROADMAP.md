# Roadmap: HTML Document Converter

## Overview

Build a CLI tool that converts HTML documents (with chapters, use cases, styled elements) into high-quality PDF and DOCX outputs. HTML remains the source of truth. Puppeteer handles PDF rendering with full CSS support. LibreOffice handles DOCX conversion for editability. Cross-platform support for macOS, Windows, and Linux.

## Domain Expertise

None

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Foundation** - Project setup, TypeScript config, folder structure
- [x] **Phase 2: HTML Parser** - Parse HTML structure, extract chapters/sections
- [x] **Phase 3: PDF Converter** - Puppeteer integration for HTML→PDF
- [x] **Phase 4: DOCX Converter** - LibreOffice CLI integration for HTML→DOCX
- [x] **Phase 5: CLI Interface** - Command-line interface with options
- [x] **Phase 6: Output Handling** - File naming, output directories, error handling
- [x] **Phase 7: Cross-Platform** - Platform detection, dependency checks
- [x] **Phase 8: Testing** - Unit tests, E2E tests with sample HTML
- [x] **Phase 9: Documentation** - README, usage examples, installation guide
- [x] **Phase 10: Polish** - Error messages, edge cases, logging

## Phase Details

### Phase 1: Foundation
**Goal**: Set up Node.js/TypeScript project with proper structure
**Depends on**: Nothing (first phase)
**Research**: Unlikely (established patterns)
**Plans**: TBD

Plans:
- [x] 01-01: Initialize package.json, tsconfig, dependencies, folder structure (merged 01-02)

### Phase 2: HTML Parser
**Goal**: Parse HTML documents and extract structural information
**Depends on**: Phase 1
**Research**: Unlikely (DOM parsing well-documented)
**Plans**: TBD

Plans:
- [x] 02-01: HTML loading, DOM parsing, chapter extraction, metadata
- [ ] 02-02: (Merged into 02-01)

### Phase 3: PDF Converter
**Goal**: Convert HTML to PDF using Puppeteer with full CSS support
**Depends on**: Phase 2
**Research**: Likely (Puppeteer print API specifics)
**Research topics**: Puppeteer page.pdf() options, print CSS support, page breaks, margin handling
**Plans**: TBD

Plans:
- [x] 03-01: Puppeteer setup, browser management, PDF generation, CSS print handling (consolidated)

### Phase 4: DOCX Converter
**Goal**: Convert HTML to DOCX using LibreOffice CLI
**Depends on**: Phase 2
**Research**: Likely (LibreOffice CLI parameters)
**Research topics**: soffice CLI options, HTML→DOCX conversion flags, filter options
**Plans**: TBD

Plans:
- [x] 04-01: LibreOffice CLI integration, DOCX conversion, structure preservation (consolidated)

### Phase 5: CLI Interface
**Goal**: Create user-friendly command-line interface
**Depends on**: Phase 3, Phase 4
**Research**: Unlikely (standard CLI patterns)
**Plans**: TBD

Plans:
- [x] 05-01: CLI argument parsing, conversion action, validation, help text (consolidated)

### Phase 6: Output Handling
**Goal**: Manage output files, directories, and error conditions
**Depends on**: Phase 5
**Research**: Unlikely (file system operations)
**Plans**: TBD

Plans:
- [x] 06-01: Output file naming, directory handling, error handling, progress feedback (consolidated)

### Phase 7: Cross-Platform
**Goal**: Ensure tool works on macOS, Windows, and Linux
**Depends on**: Phase 4
**Research**: Likely (platform-specific behavior)
**Research topics**: LibreOffice paths per OS, Chromium detection, PATH handling
**Plans**: TBD

Plans:
- [x] 07-01: Platform detection, path resolution, dependency verification (consolidated with 07-02)

### Phase 8: Testing
**Goal**: Comprehensive test coverage with real HTML samples
**Depends on**: Phase 6, Phase 7
**Research**: Unlikely (standard testing patterns)
**Plans**: TBD

Plans:
- [x] 08-01: Unit tests, E2E tests, CLI tests (consolidated 08-02 and 08-03)

### Phase 9: Documentation
**Goal**: Complete documentation for installation and usage
**Depends on**: Phase 8
**Research**: Unlikely (markdown documentation)
**Plans**: 1

Plans:
- [x] 09-01: README with installation, usage, platform notes, troubleshooting (consolidated 09-02)

### Phase 10: Polish
**Goal**: Refinement, edge cases, improved error messages
**Depends on**: Phase 9
**Research**: Unlikely (refinement of existing code)
**Plans**: 1 (consolidated)

Plans:
- [x] 10-01: Error messages, edge cases, verbose logging, npm publishing (consolidated)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 1/1 | Complete | 2026-02-03 |
| 2. HTML Parser | 1/1 | Complete | 2026-02-03 |
| 3. PDF Converter | 1/1 | Complete | 2026-02-03 |
| 4. DOCX Converter | 1/1 | Complete | 2026-02-04 |
| 5. CLI Interface | 1/1 | Complete | 2026-02-04 |
| 6. Output Handling | 1/1 | Complete | 2026-02-04 |
| 7. Cross-Platform | 1/1 | Complete | 2026-02-04 |
| 8. Testing | 1/1 | Complete | 2026-02-04 |
| 9. Documentation | 1/1 | Complete | 2026-02-04 |
| 10. Polish | 1/1 | Complete | 2026-02-04 |

## Milestones

- ✅ **v1.0 MVP** - Phases 1-10 (shipped 2026-02-04)
- ✅ **v1.1 Security & Quality** - Phases 11-15 (shipped 2026-02-08)
- ✅ **v1.2 Robustness & API Quality** - Phases 16-23 (shipped 2026-02-15)
- 🚧 **v1.3 Polish & Cleanup** - Phases 24-28 (in progress)

---

<details>
<summary>✅ v1.0 MVP (Phases 1-10) - SHIPPED 2026-02-04</summary>

All 10 phases finished. Total: 10 plans executed, 43 tests passing.

</details>

<details>
<summary>✅ v1.1 Security & Quality (Phases 11-15) - SHIPPED 2026-02-08</summary>

5 phases: command injection fix, path validation, CLI hardening, unit test coverage, code cleanup.
Final state: 134 tests, 74.5% statements, 97.9% utils coverage.

</details>

---

<details>
<summary>v1.2 Robustness & API Quality (Phases 16-23) - SHIPPED 2026-02-15</summary>

8 phases, 11 plans. 29 code review findings addressed. 185 tests, 82.36% coverage.
Full details: [milestones/v1.2-ROADMAP.md](milestones/v1.2-ROADMAP.md)

</details>

---

### 🚧 v1.3 Polish & Cleanup (In Progress)

**Milestone Goal:** Fix remaining P1 bugs from post-v1.2 review, eliminate code duplication, remove dead code, improve type safety, and fill test coverage gaps.

**Source:** Full 5-agent codebase review (2026-02-15) post-v1.2. 24 unique findings (8 P1 code, 3 P1 test, 13 P2).

#### Phase 24: Critical Bug Fixes
**Goal:** Fix 3 P1 bugs: signal handler async issue, page.close() error masking, invalid format silent no-op
**Depends on:** Milestone 3 complete
**Research:** Unlikely (internal fixes)
**Priority:** P1
**Files:** `src/cli.ts`, `src/converters/pdf-converter.ts`, `src/cli-helpers.ts`
**Plans:** TBD

Findings addressed:
- P1: Signal handler async not awaited (closeBrowser may not complete before process.exit)
- P1: page.close() in finally blocks masks original conversion errors (2 locations)
- P1: Invalid --format value silently produces no output with exit code 0

Plans:
- [x] 24-01: Fix signal handler async, page.close masking, invalid format no-op (3 tasks)

#### Phase 25: Error Handling Gaps
**Goal:** Add missing error handling: check command try/catch, DOCX mkdir error code, addStyleTag wrapping, platform fallback warning, validateInputFile simplification
**Depends on:** Phase 24
**Research:** Unlikely (internal patterns)
**Priority:** P1/P2
**Files:** `src/cli.ts`, `src/converters/docx-converter.ts`, `src/converters/pdf-converter.ts`, `src/utils/platform.ts`, `src/cli-helpers.ts`
**Plans:** TBD

Findings addressed:
- P1: check command has no try/catch (unhandled rejections)
- P1: DOCX mkdir failure throws DOCX_FAILED instead of OUTPUT_DIR_FAILED
- P2: addStyleTag() failure unhandled (raw Puppeteer error)
- P2: Platform silent fallback to linux without warning
- P2: validateInputFile TOCTOU between fs.access and fs.stat/readFile

Plans:
- [ ] 25-01: TBD

#### Phase 26: Code Deduplication & Cleanup
**Goal:** Extract shared helpers in pdf-converter.ts (~80 lines duplicated), remove 13 unused exported functions, consolidate promisify, optimize validateInputFile
**Depends on:** Phase 25 (error handling changes affect refactoring)
**Research:** Unlikely (internal refactoring)
**Priority:** P1/P2
**Files:** `src/converters/pdf-converter.ts`, `src/cli.ts`, `src/utils/platform.ts`, `src/utils/logger.ts`, `src/utils/output-handler.ts`, `src/cli-helpers.ts`
**Plans:** TBD

Findings addressed:
- P1: pdf-converter.ts CSS injection, PDF options, timeout detection duplicated across 2 functions
- P2: CLI PDF/DOCX conversion blocks identical pattern (~50 lines)
- P2: 13 unused exported functions across platform.ts, logger.ts, output-handler.ts
- P2: promisify(execFile) repeated in 3 files
- P2: validateInputFile reads entire file unnecessarily, returns unused content

Plans:
- [ ] 26-01: TBD

#### Phase 27: Type Design & Safety
**Goal:** DependencyStatus discriminated union, PDFOptions library validation, CLI format type narrowing, readonly fields, HeadingLevel safe cast
**Depends on:** Phase 26 (dead code removal affects type surface)
**Research:** Unlikely (TypeScript patterns)
**Priority:** P1/P2
**Files:** `src/utils/dependencies.ts`, `src/converters/pdf-converter.ts`, `src/cli-helpers.ts`, `src/parsers/html-parser.ts`, `src/utils/output-handler.ts`
**Plans:** TBD

Findings addressed:
- P1: DependencyStatus allows invalid states (boolean+optional anti-pattern)
- P1: PDFOptions no library-level validation of scale/timeout
- P2: Mutable data types (Chapter, ParsedDocument, OutputPaths, etc.)
- P2: HeadingLevel unsafe as cast
- P2: Chapter.id can be empty string
- P2: colors utility in errors.ts (module cohesion)
- P2: Inline CLI options type should be named

Plans:
- [ ] 27-01: TBD

#### Phase 28: Test Coverage & Verification
**Goal:** Fill P1 test gaps (soffice EACCES, string-to-pdf timeout, non-Error throws), add P2 tests, final verification
**Depends on:** Phase 27 (type changes affect test expectations)
**Research:** Unlikely (vitest patterns)
**Priority:** P1/P2
**Files:** `tests/` (multiple test files)
**Plans:** TBD

Findings addressed:
- P1: soffice.ts EACCES path + which fallback untested (28.57% branch coverage)
- P1: convertHTMLStringToPDF PDF generation timeout path untested
- P1: Non-Error throw handling in convertToDOCX untested
- P2: Platform fallback to linux untested
- P2: loadHTML non-ENOENT error path untested
- P2: parseTimeout('') edge case untested

Plans:
- [ ] 28-01: TBD

### Milestone 4 Progress

| Phase | Milestone | Plans | Status | Completed |
|-------|-----------|-------|--------|-----------|
| 24. Critical Bug Fixes | v1.3 | 1/1 | Complete | 2026-02-15 |
| 25. Error Handling Gaps | v1.3 | 0/? | Not started | - |
| 26. Code Deduplication & Cleanup | v1.3 | 0/? | Not started | - |
| 27. Type Design & Safety | v1.3 | 0/? | Not started | - |
| 28. Test Coverage & Verification | v1.3 | 0/? | Not started | - |
