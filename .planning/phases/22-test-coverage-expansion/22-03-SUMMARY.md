---
phase: 22-test-coverage-expansion
plan: 03
subsystem: testing
tags: [vitest, cli, refactoring, mocking]

requires:
  - phase: 17-error-handling-unification
    provides: ConversionError with ErrorCodes pattern
  - phase: 20-silent-failure-fixes
    provides: INVALID_TIMEOUT error code
provides:
  - CLI validation logic in importable cli-helpers.ts module
  - 100% coverage on extracted CLI helpers
  - 19 new deterministic unit tests
affects: [23-resilience-final-polish]

tech-stack:
  added: []
  patterns:
    - "Extract-to-test: move inline CLI logic to importable helpers for vitest instrumentation"

key-files:
  created:
    - src/cli-helpers.ts
    - tests/cli-helpers.test.ts
  modified:
    - src/cli.ts

key-decisions:
  - "Extract 3 functions (determineFormats, parseTimeout, validateInputFile) from cli.ts action handler"
  - "Separate test file for cli-helpers since cli.test.ts uses subprocess execution"

patterns-established:
  - "CLI helper extraction: keep Commander wiring in cli.ts, move testable logic to cli-helpers.ts"

issues-created: []

duration: 4min
completed: 2026-02-15
---

# Phase 22 Plan 03: CLI Validation Logic Extraction Summary

**Extracted 3 validation functions from cli.ts into cli-helpers.ts with 100% test coverage, bringing total suite to 183 tests across 12 files**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-15T06:35:58Z
- **Completed:** 2026-02-15T06:39:41Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- Extracted `determineFormats`, `parseTimeout`, `validateInputFile` from cli.ts action handler into importable cli-helpers.ts
- 19 new unit tests covering all branches of extracted functions
- cli-helpers.ts at 100% statement/line/function coverage, 95.83% branches
- CLI behavior unchanged (existing 19 subprocess tests prove this)

## Task Commits

1. **Task 1: Extract cli-helpers.ts** - `7c5e685` (refactor)
2. **Task 2: Add unit tests** - `7fb2797` (test)
3. **Task 3: Verify coverage** - (verification only, no commit)

**Plan metadata:** (this commit)

## Files Created/Modified
- `src/cli-helpers.ts` - 3 exported validation functions (determineFormats, parseTimeout, validateInputFile)
- `tests/cli-helpers.test.ts` - 19 unit tests (7 format + 6 timeout + 6 input validation)
- `src/cli.ts` - Updated to import and use helpers instead of inline logic

## Decisions Made
- Extract-to-test pattern: move logic to importable module rather than refactoring tests to avoid subprocess
- Separate test file since cli.test.ts runs CLI as subprocess and cli-helpers.test.ts uses direct imports with mocks

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## Next Phase Readiness
- Phase 22 complete (all 3 plans executed)
- Ready for Phase 23: Resilience & Final Polish

---
*Phase: 22-test-coverage-expansion*
*Completed: 2026-02-15*
