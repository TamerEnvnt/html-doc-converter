# Phase 33-01: API & Performance Cleanup

## Status: COMPLETE

- **Started**: 2026-02-20
- **Completed**: 2026-02-20

## Tasks

### Task 1: Remove getBrowser() from API, fix scale NaN, fix O(n^2) string concat
- **Commit**: `64b87a3`
- index.ts: Removed `getBrowser` from public API exports (kept `closeBrowser`)
- pdf-converter.ts: Added `isNaN(options.scale)` to scale validation guard
- html-parser.ts: Replaced O(n^2) `content += ...` with array-join pattern (`contentParts.push()` + `join('')`)

### Task 2: Extract timeout constants to centralized module
- **Commit**: `2aa3473`
- Created src/utils/constants.ts with `DEFAULT_TIMEOUT_MS` (60000) and `BROWSER_LAUNCH_TIMEOUT_MS` (30000)
- pdf-converter.ts: Replaced 4x `?? 60000` and 1x `timeout: 30000` + error message string
- docx-converter.ts: Replaced 1x `?? 60000`
- cli-helpers.ts: Replaced `'60000'` default string
- cli.ts: Replaced `'60000'` CLI option default

## Verification

| Check | Result |
|-------|--------|
| `tsc --noEmit` | Passed (0 errors) |
| `vitest run` | 192 passed, 2 skipped, 13 test files |

## Files Modified

| File | Changes |
|------|---------|
| `src/index.ts` | Removed `getBrowser` from exports |
| `src/converters/pdf-converter.ts` | Scale NaN validation + timeout constants |
| `src/parsers/html-parser.ts` | Array-join pattern for chapter content |
| `src/utils/constants.ts` | NEW — centralized timeout constants |
| `src/converters/docx-converter.ts` | Timeout constant |
| `src/cli-helpers.ts` | Timeout constant |
| `src/cli.ts` | Timeout constant |

## Findings Addressed: 4

1. getBrowser() exposed in public API (implementation detail leak)
2. Hardcoded timeout magic numbers (60000 in 5+ locations, 30000 in 2)
3. O(n^2) string concatenation in chapter content extraction
4. Scale NaN validation gap (NaN bypassed range check)
