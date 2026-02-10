---
phase: 19-architecture-packaging
plan: 01
subsystem: architecture
tags: [circular-dependency, exports, package-json, public-api, esm]

requires:
  - phase: 18-type-design-cleanup
    plan: 01
    provides: Clean types (HeadingLevel exported, dead fields removed)
  - phase: 17-error-handling-unification
    plan: 01
    provides: ConversionError/ErrorCodes patterns established
provides:
  - Circular dependency broken (dependencies.ts no longer imports from docx-converter)
  - Curated public API via named exports in index.ts
  - ConversionError/ErrorCodes/createError exported for library consumers
  - package.json exports field for proper ESM resolution
  - Dynamic CLI version from package.json
  - findSoffice/verifyLibreOffice extracted to src/utils/soffice.ts
affects: [20-silent-failure-fixes, 22-test-coverage-expansion]

tech-stack:
  added: []
  patterns: [named-exports-over-star, createRequire-for-json, utility-extraction]

key-files:
  created: [src/utils/soffice.ts]
  modified: [src/index.ts, src/converters/docx-converter.ts, src/utils/dependencies.ts, src/cli.ts, package.json]

key-decisions:
  - "Extract findSoffice/verifyLibreOffice to src/utils/soffice.ts (not platform.ts) - they're LibreOffice-specific, not general platform utils"
  - "Use createRequire for package.json import - stable ESM pattern, avoids experimental import assertions"
  - "Export ConversionError/ErrorCodes/createError but NOT formatError/colors - consumers need error types, not CLI cosmetics"
  - "Keep main/types fields alongside exports field for backwards compatibility with older tooling"

patterns-established:
  - "Named exports in index.ts: explicit API surface, no leaky internals"
  - "createRequire pattern for JSON imports in ESM projects"

issues-created: []

duration: 4min
completed: 2026-02-10
---

# Phase 19 Plan 01: Architecture & Packaging Summary

**Break circular dependency, curate public API with named exports, add package.json exports field, dynamic CLI version**

## Performance

- **Duration:** ~4 min
- **Tasks:** 2/2
- **Files modified:** 9

## Accomplishments

- Extracted `findSoffice` and `verifyLibreOffice` to `src/utils/soffice.ts`, breaking the circular dependency where `dependencies.ts` (utility) imported from `docx-converter.ts` (converter)
- Replaced `export *` in `index.ts` with curated named exports - only intended public API is exposed
- Added `ConversionError`, `ErrorCodes`, `createError`, and `ErrorCode` type to public exports
- Added `exports` field to `package.json` for proper ESM/TypeScript resolution
- Made CLI version dynamic via `createRequire` pattern reading from `package.json`

## Task Commits

1. **Task 1: Break circular dependency and fix public API surface** - `520606a` (refactor)
2. **Task 2: Add package.json exports field and dynamic CLI version** - `9a44ebd` (feat)

## Files Created/Modified

- `src/utils/soffice.ts` - New file: extracted findSoffice + verifyLibreOffice from docx-converter
- `src/converters/docx-converter.ts` - Removed findSoffice/verifyLibreOffice, imports from soffice.ts
- `src/utils/dependencies.ts` - Import findSoffice from `./soffice.js` (not `../converters/docx-converter.js`)
- `src/cli.ts` - Import verifyLibreOffice from soffice.ts, dynamic version via createRequire
- `src/index.ts` - Curated named exports replacing `export *`
- `package.json` - Added exports field
- `tests/docx-converter.test.ts` - Updated imports for moved functions
- `tests/e2e/conversion.test.ts` - Updated import for verifyLibreOffice

## Decisions Made

- **soffice.ts location**: Placed in `src/utils/` (not merged into `platform.ts`) because LibreOffice path detection is specific to that dependency, not general platform utilities.
- **createRequire for JSON**: Used `createRequire(import.meta.url)` instead of experimental import assertions (`assert { type: 'json' }`). More stable and doesn't require tsconfig changes.
- **API surface choices**: Exported `ConversionError`/`ErrorCodes`/`createError` (consumers need to catch errors) but kept `formatError`/`colors` internal (CLI cosmetics, not library concerns).

## Deviations from Plan

### Test Import Updates
- **Found during:** Task 2
- **Issue:** Plan said "Do NOT change test imports yet" but tests imported `findSoffice`/`verifyLibreOffice` directly from `docx-converter.ts`. Since those exports were removed in Task 1, tests failed.
- **Fix:** Updated test imports to point to `src/utils/soffice.js`
- **Impact:** Necessary consequence of the refactoring. No scope creep.

## Issues Encountered

None

## Next Phase Readiness

- Phase 19 complete (1/1 plan executed)
- Clean module architecture: utilities don't depend on converters
- Public API curated: consumers see only intended exports
- Ready for Phase 20: Silent Failure Fixes

---
*Phase: 19-architecture-packaging*
*Plan: 01*
*Completed: 2026-02-10*
