---
phase: 22-test-coverage-expansion
plan: 02
type: summary
status: complete
started: 2026-02-15
completed: 2026-02-15
---

# Summary: DOCX Converter Mocked Tests

## Objective
Add deterministic mocked tests for DOCX converter public API functions: convertToDOCX and convertHTMLFileToDOCX.

## What Was Done

### Task 1: Mocked convertToDOCX tests (6 tests)
**Commit:** `f804d72`
**File created:** `tests/docx-converter-mocked.test.ts`

Tests added:
1. Success path (no rename) - verifies result shape and mock interactions
2. Success path (with rename) - verifies rename called with correct paths
3. LIBREOFFICE_MISSING when soffice not found
4. DOCX_FAILED when LibreOffice execution fails
5. DOCX_FAILED when output file missing after conversion
6. DOCX_FAILED when rename fails

### Task 2: Mocked convertHTMLFileToDOCX tests (3 tests)
**Commit:** `f804d72` (combined with Task 1 - same file)

Tests added:
1. Success path - returns { document, docx } with correct shapes
2. Parse error propagation - parseDocument errors not swallowed
3. Conversion error propagation - LIBREOFFICE_MISSING propagates through wrapper

## Design Decision

**Separate test file**: Created `docx-converter-mocked.test.ts` instead of adding to existing `docx-converter.test.ts`. Reason: `vi.mock` is file-scoped in vitest and would have broken the 5 existing integration-style tests that use dynamic `await import()`.

## Mocking Strategy

- `vi.mock('../src/utils/soffice.js')` - findSoffice returns configurable path/null
- `vi.mock('child_process')` - execFile with node callback signature for promisify
- `vi.mock('fs/promises')` - mkdir, access, rename (preserves readFile from actual)
- `vi.mock('../src/parsers/html-parser.js')` - parseDocument returns fake ParsedDocument
- All mocks reset in beforeEach with happy-path defaults

## Test Results

| Metric | Value |
|--------|-------|
| New tests | 9 |
| Total tests | 164 (162 passed, 2 skipped) |
| Test files | 11 passed |
| Regressions | 0 |

## Deviations

- Combined Task 1 and Task 2 into a single commit (both tasks modify the same new file)
- Created separate test file instead of modifying existing one (vi.mock scope conflict)
