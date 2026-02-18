---
phase: 26-code-deduplication-cleanup
plan: 01
subsystem: converters, utils
tags: [deduplication, refactoring, pdf-converter, exec-utility]

requires:
  - phase: 25-error-handling-gaps
    plan: 02
    provides: Platform fallback warning, validateInputFile TOCTOU fix
provides:
  - 3 internal PDF helpers (isTimeoutError, buildPdfOptions, generatePdf)
  - Shared execFileAsync utility (src/utils/exec.ts)
affects: []

tech-stack:
  added: []
  patterns:
    - "Internal helper extraction for deduplication within modules"
    - "Shared utility pattern for cross-module common operations"

key-files:
  created:
    - src/utils/exec.ts
  modified:
    - src/converters/pdf-converter.ts
    - src/utils/dependencies.ts
    - src/utils/soffice.ts
    - src/converters/docx-converter.ts

key-decisions:
  - CSS injection kept intentionally different between convertToPDF and convertHTMLStringToPDF
  - PDF helpers are module-internal (not exported)
  - exec.ts not added to index.ts public API

patterns-established:
  - "Internal helper extraction: dedup within a module using non-exported functions"
  - "Shared utility pattern: single source for repeated cross-module operations"

issues-created: []

duration: ~5min
completed: 2026-02-18
---

# Phase 26 Plan 01: PDF Deduplication + Promisify Consolidation Summary

**Extracted 3 internal PDF helpers and consolidated execFileAsync into shared utility. All 192 tests pass, type check clean.**

## Performance

- **Duration:** ~5 min
- **Tasks:** 2
- **Files modified:** 5 (1 created)

## Accomplishments

- Extracted 3 internal helpers in pdf-converter.ts (isTimeoutError, buildPdfOptions, generatePdf)
- Eliminated ~46 lines of duplicated timeout detection, PDF options, and generation code
- Created src/utils/exec.ts as shared execFileAsync source
- Updated 3 consumers to import from shared utility

## Task Commits

1. **Task 1: PDF helper extraction** - `419c3f7` (refactor)
2. **Task 2: Promisify consolidation** - `c1f2ce7` (refactor)

## Files Created/Modified

- `src/converters/pdf-converter.ts` - Added 3 internal helpers, refactored both converter functions
- `src/utils/exec.ts` - NEW: shared promisified execFile
- `src/utils/dependencies.ts` - Import execFileAsync from shared utility
- `src/utils/soffice.ts` - Import execFileAsync from shared utility
- `src/converters/docx-converter.ts` - Import execFileAsync from shared utility

## Test Results

| Metric | Before | After |
|--------|--------|-------|
| Tests | 194 (192 passed, 2 skipped) | 194 (192 passed, 2 skipped) |
| Statements | 82.35% | 82.35% |
| Branches | 82.01% | 82.01% |
| Functions | 96.42% | 96.42% |
| Lines | 82.35% | 82.35% |

## Decisions Made

- CSS injection intentionally differs between functions (NOT unified)
- PDF helpers are module-internal, not exported
- exec.ts is internal utility, not in index.ts public API

## Deviations from Plan

None

## Issues Encountered

None

## Next Plan Readiness

- Plan 26-01 complete, ready for Plan 26-02 (dead code removal)
- No blockers
