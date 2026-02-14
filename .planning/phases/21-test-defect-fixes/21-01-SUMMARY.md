---
phase: 21-test-defect-fixes
plan: 01
subsystem: testing
tags: [vitest, expect-assertions, behavioral-tests, pdf-magic-bytes, race-condition]

# Dependency graph
requires:
  - phase: 17-error-handling-unification
    provides: throw-on-failure pattern, ConversionError thrown by convertToDOCX
  - phase: 20-silent-failure-fixes
    provides: findSoffice EACCES handling, loadHTML error cause chains
provides:
  - Silent pass-through test guarded with expect.assertions
  - Race condition in CLI test eliminated (await fs.writeFile)
  - Source-scanning tests replaced with behavioral error-path tests
  - PDF magic byte validation in E2E tests
affects: [22-test-coverage-expansion]

# Tech tracking
tech-stack:
  added: []
  patterns: [expect-assertions-guard, behavioral-over-source-scanning, magic-byte-validation]

key-files:
  created: []
  modified: [tests/cli.test.ts, tests/docx-converter.test.ts, tests/e2e/conversion.test.ts]

key-decisions:
  - "expect.assertions(1) only on try/catch tests with silent pass-through risk, not all tests"
  - "Replaced 2 source-scanning tests with 2 behavioral error-path tests (net count unchanged)"
  - "PDF magic bytes checked on both result.buffer and fs.readFile output (double validation)"

patterns-established:
  - "expect.assertions guard: Always use expect.assertions(N) in try/catch tests where non-throw silently passes"
  - "Behavioral over source-scanning: Test API contracts and error paths, not import strings"
  - "Magic byte validation: Verify file format headers in E2E tests, not just file size"

issues-created: []

# Metrics
duration: 5min
completed: 2026-02-14
---

# Phase 21-01: Test Defect Fixes Summary

**Fixed CLI test silent pass-through and race condition, replaced fragile source-scanning DOCX tests with behavioral tests, added PDF magic byte validation to E2E**

## Performance

- **Duration:** ~5 min
- **Tasks:** 3/3
- **Files modified:** 3

## Accomplishments
- CLI test `'errors with helpful message for missing input'` now guarded with `expect.assertions(1)` - prevents silent pass when execFileSync doesn't throw
- `fs.writeFile` properly awaited in `'errors on non-HTML file'` test - eliminates race condition
- 2 source-scanning tests (reading .ts source to check import strings) replaced with 2 behavioral error-path tests
- PDF magic byte validation (`%PDF-`) added to 3 E2E tests - both buffer and file checked (6 new assertions)

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix CLI test silent pass-through and un-awaited writeFile** - `5a82ab3` (test)
2. **Task 2: Replace source-scanning DOCX tests with behavioral tests** - `eae2921` (test)
3. **Task 3: Add PDF magic byte validation to E2E tests** - `646468c` (test)

## Files Created/Modified
- `tests/cli.test.ts` - Added expect.assertions(1) and await fs.writeFile
- `tests/docx-converter.test.ts` - Replaced 2 source-scanning tests with behavioral tests, removed unused fs import
- `tests/e2e/conversion.test.ts` - Added %PDF- magic byte validation to 3 PDF conversion tests

## Decisions Made
None - followed plan as specified.

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None.

## Next Phase Readiness
- All test defects from the review are fixed
- Test suite: 141 passed, 2 skipped (143 total) - stable
- Ready for Phase 22: Test Coverage Expansion

---
*Phase: 21-test-defect-fixes*
*Completed: 2026-02-14*
