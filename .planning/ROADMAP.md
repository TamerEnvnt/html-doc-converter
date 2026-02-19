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
- ✅ **v1.3 Polish & Cleanup** - Phases 24-28 (shipped 2026-02-19)
- 🚧 **v1.4 Review Findings** - Phases 29-36 (in progress)

---

### 🚧 v1.4 Review Findings (In Progress)

**Milestone Goal:** Address 28 findings from comprehensive 5-agent codebase review -- fix critical bugs, eliminate silent failures, improve error messages, harden process lifecycle, clean up API surface, strengthen types, and expand test coverage.

**Source:** Full 5-agent review (2026-02-19): Code Review, Silent Failure Hunter, Architecture & Performance, Type Design, Test Coverage.

#### Phase 29: Critical Fixes
**Goal**: Fix 3 P1 bugs: signal handler hang on Ctrl+C, browser launch no timeout, DOCX timeout || vs ??
**Depends on**: Milestone v1.3 complete
**Research**: Unlikely (internal patterns)
**Plans**: TBD

Plans:
- [ ] 29-01: Fix signal handler hang, browser launch timeout, DOCX ?? operator (3 tasks)

Findings addressed:
- P1: Signal handlers can hang forever (no force-exit timeout, no re-entrance guard)
- P1: Browser launch has no timeout (puppeteer.launch() hangs indefinitely)
- P1: DOCX timeout uses || instead of ?? (timeout:0 silently becomes 60000)

#### Phase 30: Error Message Quality
**Goal**: Wrap browser launch errors with specific messages, use ConversionError in html-parser, add verbose logging to silent catch blocks
**Depends on**: Phase 29
**Research**: Unlikely (internal patterns)
**Plans**: TBD

Plans:
- [ ] 30-01: TBD

Findings addressed:
- P1: Browser launch errors give misleading "PDF generation failed" message
- P1: html-parser throws plain Error instead of ConversionError
- P2: closeBrowser() and page.close() silently discard all errors without verbose logging

#### Phase 31: Process Lifecycle Hardening
**Goal**: Refactor process.exit() placement for reliable cleanup, add unhandledRejection handler
**Depends on**: Phase 30
**Research**: Unlikely (Node.js patterns)
**Plans**: TBD

Plans:
- [ ] 31-01: TBD

Findings addressed:
- P2: process.exit() inside try block relies on fragile cleanup ordering
- P2: No unhandledRejection handler (raw stack traces on uncaught rejections)

#### Phase 32: Silent Failure Elimination
**Goal**: Distinguish expected from unexpected errors in 5 catch blocks across soffice, dependencies, CLI, and platform
**Depends on**: Phase 31
**Research**: Unlikely (internal patterns)
**Plans**: TBD

Plans:
- [ ] 32-01: TBD

Findings addressed:
- P1: which/where fallback catches ALL errors as "not found" (EPERM, EMFILE, ENOMEM)
- P1: Chromium detection catches ALL errors as "not installed" (corrupted Puppeteer)
- P2: fs.access catch blocks treat EACCES/EIO as "file doesn't exist"
- P2: Platform fallback to linux only logged at verbose level
- P2: LibreOffice version regex too strict for 4-part versions

#### Phase 33: API & Performance Cleanup
**Goal**: Remove getBrowser() from public API, extract timeout constants, fix O(n^2) string concatenation, add scale NaN validation
**Depends on**: Phase 32
**Research**: Unlikely (internal patterns)
**Plans**: TBD

Plans:
- [ ] 33-01: TBD

Findings addressed:
- P2: getBrowser() exposed in public API (implementation detail)
- P2: Hardcoded timeout magic numbers (60000 in 5+ locations)
- P2: String concatenation O(n^2) in chapter content extraction
- P3: Scale NaN validation gap

#### Phase 34: Type Safety
**Goal**: Add readonly to html-parser types, name anonymous return types, narrow CLIOptions.format
**Depends on**: Phase 33
**Research**: Unlikely (TypeScript patterns)
**Plans**: TBD

Plans:
- [ ] 34-01: TBD

Findings addressed:
- P2: Chapter, DocumentMetadata, ParsedDocument missing readonly (0/13 fields)
- P2: DependencyCheckResult.allFound is derived/redundant field
- P2: validateInputFile return type is anonymous
- P2: CLIOptions.format typed as unconstrained string

#### Phase 35: Test Coverage
**Goal**: Fill test gaps: CLI docx-only path, partial failure exit code, version extraction mocks, isHeadingLevel direct tests
**Depends on**: Phase 34
**Research**: Unlikely (vitest patterns)
**Plans**: TBD

Plans:
- [ ] 35-01: TBD

Findings addressed:
- P2: No CLI test for --docx-only path
- P2: No test for partial failure exit code (exit 2)
- P2: No mocked tests for checkChromium/checkLibreOffice version extraction
- P2: isHeadingLevel type guard not directly tested
- P3: DOCX outputDir success path not tested

#### Phase 36: Verification
**Goal**: Full test suite run, coverage verification, confirm all 28 findings addressed
**Depends on**: Phase 35
**Research**: Unlikely
**Plans**: TBD

Plans:
- [ ] 36-01: TBD

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

<details>
<summary>✅ v1.2 Robustness & API Quality (Phases 16-23) - SHIPPED 2026-02-15</summary>

8 phases, 11 plans. 29 code review findings addressed. 185 tests, 82.36% coverage.
Full details: [milestones/v1.2-ROADMAP.md](milestones/v1.2-ROADMAP.md)

</details>

<details>
<summary>✅ v1.3 Polish & Cleanup (Phases 24-28) - SHIPPED 2026-02-19</summary>

5 phases, 9 plans. 24 remaining review findings addressed. 194 tests, 82.2% statements, 86.46% branches.
Full details: [milestones/v1.3-ROADMAP.md](milestones/v1.3-ROADMAP.md)

</details>
