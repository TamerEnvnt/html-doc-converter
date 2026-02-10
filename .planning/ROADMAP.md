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
- 🚧 **v1.2 Robustness & API Quality** - Phases 16-23 (in progress)

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

### 🚧 v1.2 Robustness & API Quality (In Progress)

**Milestone Goal:** Address all findings from comprehensive 5-agent code review. Fix critical concurrency bugs, unify error handling, clean up type design, improve test coverage for public APIs, and prepare package for production consumers.

**Source:** Full codebase review (2026-02-10) using code-reviewer, silent-failure-hunter, test-analyzer, type-design-analyzer, and architecture-explorer agents. 29 findings across P0/P1/P2 priorities.

#### Phase 16: Browser Singleton Hardening
**Goal:** Fix race condition in getBrowser(), add crash recovery with disconnected handler, make closeBrowser() safe in finally blocks
**Depends on:** Milestone 2 complete
**Research:** Unlikely (Puppeteer API well-known)
**Priority:** P0 - CRITICAL
**Files:** `src/converters/pdf-converter.ts`
**Plans:** TBD

Findings addressed:
- P0: Browser singleton race condition (concurrent launches)
- P0: No crash recovery (stale browserInstance after Chromium crash)
- P0: closeBrowser() throws in finally block, masking original error

Plans:
- [ ] 16-01: TBD (run /gsd:plan-phase 16 to break down)

#### Phase 17: Error Handling Unification
**Goal:** Make both converters use consistent error handling (throw ConversionError). Fix DOCX converter to throw instead of returning success objects. Add specific error types for timeout, missing output, rename failures.
**Depends on:** Phase 16
**Research:** Unlikely (internal refactoring)
**Priority:** P0/P1 - CRITICAL
**Files:** `src/converters/docx-converter.ts`, `src/converters/pdf-converter.ts`, `src/cli.ts`
**Plans:** TBD

Findings addressed:
- P0: DOCX converter returns {success: false} instead of throwing (asymmetric with PDF)
- P1: No output file verification after LibreOffice execution
- P1: Missing rename error handling (orphaned files)
- P1: Timeout errors not distinguished (ErrorCodes.TIMEOUT never used in PDF path)

Plans:
- [ ] 17-01: TBD

#### Phase 18: Type Design Cleanup
**Goal:** Remove dead type fields, replace boolean+optional anti-patterns with discriminated unions, fix unsafe Platform cast, add HeadingLevel type
**Depends on:** Phase 17 (DOCXResult changes)
**Research:** Unlikely (internal refactoring)
**Priority:** P2
**Files:** `src/converters/pdf-converter.ts`, `src/converters/docx-converter.ts`, `src/utils/dependencies.ts`, `src/utils/platform.ts`, `src/parsers/html-parser.ts`
**Plans:** TBD

Findings addressed:
- PDFResult.pageCount never populated (dead field)
- DOCXOptions.preserveStyles never read (dead field)
- DOCXResult allows invalid states (discriminated union needed)
- DependencyStatus same boolean+optional anti-pattern
- Platform unsafe cast (process.platform as Platform)
- Chapter.level typed as number instead of 1|2|3|4|5|6

Plans:
- [ ] 18-01: TBD

#### Phase 19: Architecture & Packaging
**Goal:** Break circular dependency, fix public API exports, add package.json exports field, dynamic CLI version
**Depends on:** Phase 18 (type changes affect exports)
**Research:** Unlikely (Node.js packaging conventions)
**Priority:** P2
**Files:** `src/index.ts`, `src/utils/dependencies.ts`, `src/converters/docx-converter.ts`, `package.json`, `src/cli.ts`
**Plans:** TBD

Findings addressed:
- Circular dependency: dependencies.ts imports from docx-converter.ts
- ConversionError/ErrorCodes not exported from index.ts
- Missing exports field in package.json
- CLI version hardcoded as '1.0.0'
- findSoffice/verifyLibreOffice unnecessarily exposed in public API

Plans:
- [ ] 19-01: TBD

#### Phase 20: Silent Failure Fixes
**Goal:** Fix TOCTOU in overwrite protection and ensureOutputDirectory, fix findSoffice swallowing EACCES, add error cause chains, fix convertHTMLStringToPDF timeout
**Depends on:** Phase 17 (error handling patterns established)
**Research:** Unlikely (Node.js fs patterns)
**Priority:** P1/P2
**Files:** `src/cli.ts`, `src/utils/output-handler.ts`, `src/converters/docx-converter.ts`, `src/converters/pdf-converter.ts`, `src/parsers/html-parser.ts`
**Plans:** TBD

Findings addressed:
- P1: TOCTTOU in overwrite protection (cli.ts:144-152)
- P1: ensureOutputDirectory TOCTOU + EACCES misinterpretation
- P1: findSoffice swallows EACCES (reports "not found" for permission errors)
- P2: convertHTMLStringToPDF ignores options.timeout
- P2: loadHTML loses original error context (no {cause})

Plans:
- [ ] 20-01: TBD

#### Phase 21: Test Defect Fixes
**Goal:** Fix existing test bugs: un-awaited fs.writeFile, silent pass-through tests, replace source-scanning tests with behavioral tests
**Depends on:** Phase 17 (error handling changes affect test expectations)
**Research:** Unlikely (vitest patterns)
**Priority:** P1
**Files:** `tests/cli.test.ts`, `tests/docx-converter.test.ts`, `tests/e2e/conversion.test.ts`
**Plans:** TBD

Findings addressed:
- P1: CLI test silent pass-through (missing expect.assertions)
- P1: Un-awaited fs.writeFile race condition in cli.test.ts
- P2: DOCX tests scan source code instead of behavioral testing
- P2: E2E tests don't validate PDF magic bytes (%PDF-)

Plans:
- [ ] 21-01: TBD

#### Phase 22: Test Coverage Expansion
**Goal:** Add tests for untested public API functions (convertHTMLFileToPDF, convertHTMLStringToPDF, convertHTMLFileToDOCX), improve CLI instrumented coverage
**Depends on:** Phase 21 (test defects fixed first)
**Research:** Unlikely (vitest patterns)
**Priority:** P1
**Files:** `tests/pdf-converter.test.ts` (new), `tests/docx-converter.test.ts` (expand), `tests/cli.test.ts` (expand)
**Plans:** TBD

Findings addressed:
- cli.ts at 0% instrumented coverage
- convertHTMLFileToPDF and convertHTMLStringToPDF completely untested
- convertHTMLFileToDOCX completely untested

Plans:
- [ ] 22-01: TBD

#### Phase 23: Resilience & Final Polish
**Goal:** Add SIGINT/SIGTERM handler for graceful cleanup, add exhaustiveness check in createError switch, final verification
**Depends on:** Phase 22
**Research:** Unlikely (Node.js signal handling)
**Priority:** P2
**Files:** `src/cli.ts`, `src/utils/errors.ts`
**Plans:** TBD

Findings addressed:
- P2: No SIGINT handler (orphaned files, zombie Chromium)
- P2: createError switch has no compile-time exhaustiveness check

Plans:
- [ ] 23-01: TBD

### Milestone 3 Progress

| Phase | Milestone | Plans | Status | Completed |
|-------|-----------|-------|--------|-----------|
| 16. Browser Singleton Hardening | v1.2 | 0/? | Not started | - |
| 17. Error Handling Unification | v1.2 | 0/? | Not started | - |
| 18. Type Design Cleanup | v1.2 | 0/? | Not started | - |
| 19. Architecture & Packaging | v1.2 | 0/? | Not started | - |
| 20. Silent Failure Fixes | v1.2 | 0/? | Not started | - |
| 21. Test Defect Fixes | v1.2 | 0/? | Not started | - |
| 22. Test Coverage Expansion | v1.2 | 0/? | Not started | - |
| 23. Resilience & Final Polish | v1.2 | 0/? | Not started | - |
