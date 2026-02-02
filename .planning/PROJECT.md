# HTML Document Converter

## What This Is

A CLI tool that converts HTML documents (particularly structured documents with chapters, use cases, and styled elements) into both PDF and DOCX formats. HTML remains the source of truth; PDF provides pixel-perfect output for distribution; DOCX provides fully editable documents for Word users.

## Core Value

Both outputs must be high quality: PDF with visual fidelity to the HTML source, DOCX with real document structure (headings, paragraphs, tables) that enables genuine editing in Word.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] HTML → PDF conversion with full CSS support (print styles, gradients, colors)
- [ ] HTML → DOCX conversion with editable structure (real headings, tables, paragraphs)
- [ ] CLI interface for single-file conversion
- [ ] Support for chapter-based HTML documents (TOC, sections, use case boxes)
- [ ] Cross-platform operation (macOS, Windows, Linux)
- [ ] Offline operation (no cloud dependencies)

### Out of Scope

- GUI/web interface — CLI only for v1
- Batch processing — single file at a time for v1
- Template customization — fixed output format for v1
- DOCX → HTML round-trip — one-way conversion only
- PDF → DOCX conversion — both outputs derive from HTML source

## Context

**Source document reference:** `/Users/tamer/Work/AI/Claude/InfraSizingCalculator/docs/srs/SRS_InfraSizingCalculator.html`

The SRS document uses:
- Print-optimized CSS (`@page`, `@media print`)
- Gradient headers for use cases
- Color-coded boxes (requirements, alt flows, exceptions)
- Multi-level TOC with chapter hierarchy
- Tables with alternating row colors
- A4 page sizing with specific margins

**Technical approach decided:**
- Puppeteer for HTML → PDF (uses Chrome's print engine for perfect CSS)
- LibreOffice CLI for HTML → DOCX (preserves document structure)
- Node.js orchestration layer

## Constraints

- **Tech stack**: Node.js with TypeScript — maintainability and type safety
- **PDF engine**: Puppeteer/Chromium — only tool that renders complex CSS correctly
- **DOCX engine**: LibreOffice CLI — best HTML→DOCX fidelity for editability
- **Offline**: All processing local — no cloud services
- **Cross-platform**: Must work on macOS, Windows, Linux

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| HTML as single source | Avoids lossy PDF→DOCX conversion; maintains structure | — Pending |
| Puppeteer for PDF | Only tool with full CSS support (gradients, print styles) | — Pending |
| LibreOffice for DOCX | Best editability vs alternatives (pandoc, html-to-docx) | — Pending |
| Node.js + TypeScript | Easy to maintain, good ecosystem for both tools | — Pending |

---
*Last updated: 2026-02-02 after initialization*
