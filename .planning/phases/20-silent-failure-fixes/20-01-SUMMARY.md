---
phase: 20-silent-failure-fixes
plan: 01
subsystem: error-handling
tags: [toctou, eacces, error-cause, fs, cli, soffice, html-parser]

# Dependency graph
requires:
  - phase: 17-error-handling-unification
    provides: throw-on-failure pattern, ConversionError, CLI symmetric error handling
  - phase: 19-architecture-packaging
    provides: findSoffice/verifyLibreOffice in src/utils/soffice.ts, curated public API
provides:
  - Atomic ensureOutputDirectory (no TOCTOU)
  - Async CLI overwrite check (reduced TOCTOU window)
  - EACCES detection in findSoffice (actionable permission error)
  - Error cause chains in loadHTML (preserved original error context)
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns: [atomic-mkdir, error-cause-chains, eacces-detection]

key-files:
  created: []
  modified: [src/cli.ts, src/utils/output-handler.ts, src/utils/soffice.ts, src/parsers/html-parser.ts]

key-decisions:
  - "Used fs.mkdir({ recursive: true }) as single atomic call instead of access+mkdir"
  - "Kept check-then-act in CLI overwrite (inherent TOCTOU) but switched to async fs.access"
  - "findSoffice throws Error (not ConversionError) on EACCES - utility, not converter"
  - "Used ES2022 { cause } option for error chaining in loadHTML"

patterns-established:
  - "Atomic mkdir: Always use fs.mkdir({ recursive: true }) instead of access+mkdir"
  - "Error cause chains: Always pass { cause: error } when re-throwing"
  - "EACCES detection: Distinguish permission errors from not-found in filesystem checks"

issues-created: []

# Metrics
duration: 8min
completed: 2026-02-10
---

# Phase 20-01: Silent Failure Fixes Summary

**Eliminated TOCTOU races in file operations, surfaced swallowed EACCES in soffice detection, and preserved error cause chains in HTML parser**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-10T21:56:00Z
- **Completed:** 2026-02-10T22:04:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- ensureOutputDirectory uses single atomic `fs.mkdir({ recursive: true })` call, eliminating TOCTOU race
- CLI overwrite check switched from sync `fileExists()` to async `fs.access()`, reducing TOCTOU window
- findSoffice throws on EACCES with actionable message ("lacks execute permission") instead of silent null return
- loadHTML preserves original error context via `{ cause: error }` in both ENOENT and generic catch paths

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix TOCTOU in overwrite protection and ensureOutputDirectory** - `27dc172` (fix)
2. **Task 2: Fix findSoffice EACCES handling and loadHTML error cause chains** - `f6c0371` (fix)

## Files Created/Modified
- `src/utils/output-handler.ts` - Replaced access+mkdir with atomic mkdir({ recursive: true })
- `src/cli.ts` - Switched overwrite check to async fs.access, removed fileExists import
- `src/utils/soffice.ts` - Added EACCES detection in findSoffice path loop
- `src/parsers/html-parser.ts` - Added { cause: error } to both re-throw paths in loadHTML

## Decisions Made
None - followed plan as specified.

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None.

## Next Phase Readiness
- All silent failure patterns from the audit are now fixed
- Error cause chains enable better debugging when loadHTML fails
- EACCES in findSoffice now surfaces actionable permission error to users
- All 141 tests pass, build clean

---
*Phase: 20-silent-failure-fixes*
*Completed: 2026-02-10*
