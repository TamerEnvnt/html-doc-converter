---
phase: 27-type-design-safety
plan: 01
subsystem: utils, converters
tags: [type-safety, discriminated-union, validation, dependencies, pdf-options]

requires:
  - phase: 26-code-deduplication-cleanup
    plan: 02
    provides: Dead code removal, clean type surface
provides:
  - DependencyStatus discriminated union (FoundDependency | MissingDependency)
  - PDFOptions library-level validation (scale, timeout)
affects: []

tech-stack:
  added: []
  patterns:
    - "Discriminated union for mutually exclusive states"
    - "Library-level validation at internal helper boundary"

key-files:
  created: []
  modified:
    - src/utils/dependencies.ts
    - src/converters/pdf-converter.ts
    - tests/utils/dependencies.test.ts
    - tests/pdf-converter.test.ts

key-decisions:
  - DependencyBase is not exported (internal inheritance helper)
  - PDFOptions validation placed in buildPdfOptions (single validation point for both public functions)
  - Scale uses INVALID_FORMAT error code (no new error code needed)
  - Changed timeout resolution from || to ?? so 0 reaches validation

patterns-established:
  - "Discriminated union: use literal type discriminant to eliminate invalid states"
  - "Library-level validation: validate at internal helper boundary, not in each public function"

issues-created: []

duration: ~5min
completed: 2026-02-19
---

# Phase 27 Plan 01: DependencyStatus Discriminated Union + PDFOptions Validation Summary

**Converted DependencyStatus to discriminated union eliminating invalid states. Added scale/timeout validation in buildPdfOptions. All 175 tests pass, type check clean.**

## Performance

- **Duration:** ~5 min
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Replaced DependencyStatus interface with FoundDependency | MissingDependency discriminated union
- Refactored checkChromium/checkLibreOffice to return correct variants directly (no mutation)
- Removed unnecessary guards in formatDependencyReport (path always on FoundDependency, installHint always on MissingDependency)
- Added scale (0.1-2.0) and timeout (>0) validation in buildPdfOptions
- Added 6 new PDFOptions validation tests

## Task Commits

1. **Task 1: DependencyStatus discriminated union** - `3e2fc7a` (refactor)
2. **Task 2: PDFOptions library-level validation** - `c4d329c` (feat)

## Files Created/Modified

- `src/utils/dependencies.ts` - DependencyStatus replaced with discriminated union, checkChromium/checkLibreOffice refactored, formatDependencyReport simplified
- `src/converters/pdf-converter.ts` - Scale/timeout validation in buildPdfOptions, || changed to ?? for timeout resolution
- `tests/utils/dependencies.test.ts` - Updated test shapes for discriminated union, imported new types
- `tests/pdf-converter.test.ts` - Added 6 new PDFOptions validation tests

## Test Results

| Metric | Before | After |
|--------|--------|-------|
| Tests | 171 (169 passed, 2 skipped) | 177 (175 passed, 2 skipped) |

## Decisions Made

- DependencyBase not exported (internal only)
- No new ErrorCode for scale validation (INVALID_FORMAT sufficient)
- Timeout resolution changed from `||` to `??` so explicit `0` reaches validation
- Test data uses `as const` for literal type narrowing in discriminated unions

## Deviations from Plan

- Changed `options.timeout || 60000` to `options.timeout ?? 60000` in both public functions (necessary for timeout=0 to reach validation in buildPdfOptions)

## Issues Encountered

None

## Next Plan Readiness

- Plan 27-01 complete, ready for Plan 27-02 (HeadingLevel type guard + readonly types + colors extraction)
- No blockers
