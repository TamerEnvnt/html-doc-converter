# Phase 32-01: Silent Failure Elimination

## Status: COMPLETE

- **Started**: 2026-02-19T18:45:00Z
- **Completed**: 2026-02-19T18:47:00Z

## Tasks

### Task 1: Tighten error handling in soffice.ts and platform.ts
- **Commit**: `2675094`
- soffice.ts fs.access catch: discriminate ENOENT from unexpected errors, log unexpected at verbose
- soffice.ts which/where catch: discriminate exit-code-1 (expected) from other errors
- platform.ts: upgraded unknown-platform warning from `verbose()` to `console.warn()` for user visibility
- Removed unused `verbose` import from platform.ts; added `verbose` import to soffice.ts

### Task 2: Fix Chromium catch-all and LibreOffice version regex in dependencies.ts
- **Commit**: `64a89b5`
- dependencies.ts: added verbose logging to 3 silent catch blocks (chromium outer, chromium version, libreoffice version)
- dependencies.ts: fixed version regex to support optional 4th version segment (`\d+\.\d+\.\d+(?:\.\d+)?`)
- docx-converter.ts: fs.access catch now distinguishes EACCES/EPERM (permission) from ENOENT (not found)

## Verification

| Check | Result |
|-------|--------|
| `tsc --noEmit` | Passed (0 errors) |
| `vitest run` | 192 passed, 2 skipped, 13 test files |

## Files Modified

| File | Changes |
|------|---------|
| `src/utils/soffice.ts` | Added verbose import; tightened 2 catch blocks |
| `src/utils/platform.ts` | Removed verbose import; upgraded to console.warn |
| `src/utils/dependencies.ts` | Added verbose import; logged 3 silent catches; fixed version regex |
| `src/converters/docx-converter.ts` | Added EACCES/EPERM discrimination in output verification |

## Findings Addressed: 5

1. soffice.ts fs.access swallowed non-ENOENT errors silently
2. soffice.ts which/where swallowed all errors silently
3. platform.ts unknown-platform fallback hidden behind --verbose flag
4. dependencies.ts 3 bare catch blocks swallowed all errors
5. docx-converter.ts could not distinguish permission errors from missing output
