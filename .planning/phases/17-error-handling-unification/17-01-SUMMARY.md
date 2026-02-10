---
phase: 17-error-handling-unification
plan: 01
subsystem: converter
tags: [error-handling, docx, throw-based, output-verification]

requires:
  - phase: 16-browser-singleton-hardening
    provides: promise-lock pattern, null-before-close safety
provides:
  - DOCXResult simplified to { outputPath: string }
  - convertToDOCX throws ConversionError on all failure paths
  - Output file verification after LibreOffice execution
  - Rename error handling (no orphaned files)
  - CLI updated for throw-based DOCX handling
affects: [17-02, 18-type-design-cleanup]

tech-stack:
  added: []
  patterns: [throw-on-failure, output-verification, re-throw-known-errors]

key-files:
  created: []
  modified: [src/converters/docx-converter.ts, src/cli.ts, tests/docx-converter.test.ts, tests/e2e/conversion.test.ts]

key-decisions:
  - "DOCXResult is now { outputPath: string } - if you got a result, it worked"
  - "ConversionError re-thrown as-is, unknown errors wrapped in DOCX_FAILED"
  - "Rename failure does NOT delete generated file - lets user recover"
  - "CLI updated in this plan (not 17-02) since DOCX API changed"

patterns-established:
  - "Throw-on-failure: converters throw ConversionError, callers use try/catch"
  - "Output verification: check file exists after external process completes"
  - "Re-throw known errors: catch block passes through ConversionError, wraps others"

issues-created: []

duration: 3min
completed: 2026-02-10
---

# Phase 17 Plan 01: DOCX Converter Error Unification Summary

**Make DOCX converter throw ConversionError instead of returning error objects. Add output verification and rename handling.**

## Performance

- **Duration:** ~3 min
- **Tasks:** 2/2
- **Files modified:** 4

## Accomplishments

- DOCXResult simplified from `{outputPath, success, error?}` to `{outputPath: string}`
- convertToDOCX throws `createError(ErrorCodes.LIBREOFFICE_MISSING)` when soffice not found
- Output file verified with `fs.access()` after LibreOffice execution
- `fs.rename` wrapped in try-catch with descriptive error
- Catch block re-throws ConversionError, wraps unknown errors in DOCX_FAILED
- CLI DOCX section updated to use try/catch (no more result.success checks)
- E2E tests updated for throw-based error handling

## Task Commits

1. **Task 1: DOCX converter throw-based errors** - `3827248` (feat)
2. **Task 2: Update DOCX tests** - `45368b2` (test)

## Files Modified

- `src/converters/docx-converter.ts` - DOCXResult simplified, convertToDOCX throws, output verification, rename handling
- `src/cli.ts` - DOCX section uses try/catch only (no result.success)
- `tests/docx-converter.test.ts` - First test updated for throw-based error handling
- `tests/e2e/conversion.test.ts` - DOCX tests updated for throw-based error handling

## Decisions Made

- **CLI updated here, not in 17-02:** The DOCX API change required immediate CLI updates to avoid broken builds. Plan 17-02 focuses on PDF timeout + CLI simplification.
- **No generated file deletion on rename failure:** If rename fails, the generated file stays at the LibreOffice output path. User can recover it manually.

## Deviations from Plan

### CLI Updated Alongside Converter
- Plan scoped CLI changes to 17-02, but build would break without updating cli.ts references to `result.success`
- Impact: 17-02 Task 2 (CLI unification) partially done; remaining work is PDF timeout detection

## Issues Encountered

None

## Test Results

- 10 test files, 141 passed, 2 skipped (143 total) - no change from baseline
- Build clean, typecheck passes

## Next

- Execute 17-02-PLAN.md (PDF timeout detection + any remaining CLI cleanup)

---
*Phase: 17-error-handling-unification*
*Plan: 01*
*Completed: 2026-02-10*
