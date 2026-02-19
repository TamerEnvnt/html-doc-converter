---
phase: 28-test-coverage-verification
plan: 01
subsystem: tests
tags: [test-coverage, P1, soffice, pdf-converter, docx-converter, html-parser]
status: complete
---

# Plan 28-01: P1 Test Coverage Gaps -- Summary

**Filled all 4 P1 test coverage gaps: soffice.ts branch coverage (8 new tests), pdf-converter non-timeout error rethrow (2 tests), docx-converter non-Error throw (1 test), and html-parser non-ENOENT error (1 test).**

## Performance

- Duration: ~3 minutes
- Started: 2026-02-19T09:52:08Z
- Completed: 2026-02-19T09:56:00Z
- Tasks: 3/3 completed

## Accomplishments

- Created `tests/utils/soffice.test.ts` with 8 tests covering all findSoffice() branches: EACCES throw, ENOENT continue, which/where fallback success, which/where fallback failure, win32 'where' binary, immediate success, and verifyLibreOffice true/false paths
- Added 2 non-timeout error rethrow tests to pdf-converter.test.ts: goto error in convertToPDF (line 200) and setContent error in convertHTMLStringToPDF (line 313), verifying raw errors are NOT wrapped in ConversionError
- Added 1 non-Error throw test to docx-converter-mocked.test.ts: string rejection from execFile triggers String(error) path (line 105)
- Added 1 non-ENOENT error test to html-parser.test.ts: EACCES error triggers "Failed to load HTML file" path (lines 53-54) with error cause chain verification

## Task Commits

| Task | Commit | Hash |
|------|--------|------|
| 1. soffice.ts EACCES + which/where tests | `test(28-01): soffice.ts EACCES path + which/where fallback tests` | `52c4c81` |
| 2. pdf-converter non-timeout rethrow | `test(28-01): pdf-converter non-timeout error rethrow tests` | `91dedcf` |
| 3. docx non-Error + html-parser non-ENOENT | `test(28-01): docx-converter non-Error throw + html-parser non-ENOENT error` | `2410794` |

## Files Created/Modified

| File | Action | Changes |
|------|--------|---------|
| `tests/utils/soffice.test.ts` | Created | 8 tests covering all findSoffice/verifyLibreOffice branches |
| `tests/pdf-converter.test.ts` | Modified | +2 non-timeout error rethrow tests (29 -> 31 tests) |
| `tests/docx-converter-mocked.test.ts` | Modified | +1 non-Error throw test (9 -> 10 tests) |
| `tests/html-parser.test.ts` | Modified | +1 non-ENOENT error test (22 -> 23 tests) |

## Test Results

- Total: 189 tests (187 passed, 2 skipped) -- up from 177
- 13 test files, all passing
- New tests: 12 added across 4 files

## Deviations

1. **html-parser test approach**: Plan suggested `vi.spyOn` on fs/promises readFile, but ESM named exports are non-configurable. Used `vi.resetModules()` + `vi.doMock()` + dynamic import instead. Same coverage outcome, different mechanism.

## Issues Encountered

None. All tests passed on first run (except the html-parser spyOn approach which required the deviation above).

## Next Plan Readiness

Ready for 28-02 (P2 test coverage + final verification).
