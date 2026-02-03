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
- [ ] **Phase 3: PDF Converter** - Puppeteer integration for HTML→PDF
- [ ] **Phase 4: DOCX Converter** - LibreOffice CLI integration for HTML→DOCX
- [ ] **Phase 5: CLI Interface** - Command-line interface with options
- [ ] **Phase 6: Output Handling** - File naming, output directories, error handling
- [ ] **Phase 7: Cross-Platform** - Platform detection, dependency checks
- [ ] **Phase 8: Testing** - Unit tests, E2E tests with sample HTML
- [ ] **Phase 9: Documentation** - README, usage examples, installation guide
- [ ] **Phase 10: Polish** - Error messages, edge cases, logging

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
- [ ] 03-01: Puppeteer setup and browser management
- [ ] 03-02: PDF generation with print options
- [ ] 03-03: CSS print stylesheet handling

### Phase 4: DOCX Converter
**Goal**: Convert HTML to DOCX using LibreOffice CLI
**Depends on**: Phase 2
**Research**: Likely (LibreOffice CLI parameters)
**Research topics**: soffice CLI options, HTML→DOCX conversion flags, filter options
**Plans**: TBD

Plans:
- [ ] 04-01: LibreOffice CLI integration
- [ ] 04-02: DOCX conversion with structure preservation

### Phase 5: CLI Interface
**Goal**: Create user-friendly command-line interface
**Depends on**: Phase 3, Phase 4
**Research**: Unlikely (standard CLI patterns)
**Plans**: TBD

Plans:
- [ ] 05-01: CLI argument parsing (input file, output format, options)
- [ ] 05-02: Help text and usage examples

### Phase 6: Output Handling
**Goal**: Manage output files, directories, and error conditions
**Depends on**: Phase 5
**Research**: Unlikely (file system operations)
**Plans**: TBD

Plans:
- [ ] 06-01: Output file naming and directory handling
- [ ] 06-02: Error handling and user feedback

### Phase 7: Cross-Platform
**Goal**: Ensure tool works on macOS, Windows, and Linux
**Depends on**: Phase 4
**Research**: Likely (platform-specific behavior)
**Research topics**: LibreOffice paths per OS, Chromium detection, PATH handling
**Plans**: TBD

Plans:
- [ ] 07-01: Platform detection and path resolution
- [ ] 07-02: Dependency verification (LibreOffice, Chromium)

### Phase 8: Testing
**Goal**: Comprehensive test coverage with real HTML samples
**Depends on**: Phase 6, Phase 7
**Research**: Unlikely (standard testing patterns)
**Plans**: TBD

Plans:
- [ ] 08-01: Unit tests for parser and converters
- [ ] 08-02: E2E tests with SRS sample document
- [ ] 08-03: Cross-platform test verification

### Phase 9: Documentation
**Goal**: Complete documentation for installation and usage
**Depends on**: Phase 8
**Research**: Unlikely (markdown documentation)
**Plans**: TBD

Plans:
- [ ] 09-01: README with installation and usage
- [ ] 09-02: Troubleshooting and platform-specific notes

### Phase 10: Polish
**Goal**: Refinement, edge cases, improved error messages
**Depends on**: Phase 9
**Research**: Unlikely (refinement of existing code)
**Plans**: TBD

Plans:
- [ ] 10-01: Error message improvements
- [ ] 10-02: Edge case handling and logging

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 1/1 | Complete | 2026-02-03 |
| 2. HTML Parser | 1/1 | Complete | 2026-02-03 |
| 3. PDF Converter | 0/3 | Not started | - |
| 4. DOCX Converter | 0/2 | Not started | - |
| 5. CLI Interface | 0/2 | Not started | - |
| 6. Output Handling | 0/2 | Not started | - |
| 7. Cross-Platform | 0/2 | Not started | - |
| 8. Testing | 0/3 | Not started | - |
| 9. Documentation | 0/2 | Not started | - |
| 10. Polish | 0/2 | Not started | - |
