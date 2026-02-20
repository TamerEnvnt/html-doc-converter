# Phase 34-01: Type Safety

## Status: COMPLETE

- **Started**: 2026-02-20
- **Completed**: 2026-02-20

## Tasks

### Task 1: Add readonly to html-parser types and name validateInputFile return type
- **Commit**: `e28af00`
- html-parser.ts: Added `readonly` to all 13 fields across Chapter (5), DocumentMetadata (4), ParsedDocument (4)
- cli-helpers.ts: Created named `ValidatedInput` interface with readonly fields, replaced anonymous return type
- index.ts: Exported `ValidatedInput` type from public API

### Task 2: Narrow CLIOptions.format and document DependencyCheckResult.allFound
- **Commit**: `3f755a2`
- cli.ts: Created `OutputFormat = 'pdf' | 'docx' | 'both'` union type, narrowed CLIOptions.format
- dependencies.ts: Added JSDoc to `allFound` documenting it as derived convenience field

## Verification

| Check | Result |
|-------|--------|
| `tsc --noEmit` | Passed (0 errors) |
| `vitest run` | 192 passed, 2 skipped, 13 test files |

## Files Modified

| File | Changes |
|------|---------|
| `src/parsers/html-parser.ts` | Added readonly to Chapter, DocumentMetadata, ParsedDocument (13 fields) |
| `src/cli-helpers.ts` | Named ValidatedInput interface with readonly fields |
| `src/index.ts` | Exported ValidatedInput type |
| `src/cli.ts` | OutputFormat union type, narrowed CLIOptions.format |
| `src/utils/dependencies.ts` | JSDoc on DependencyCheckResult.allFound |

## Findings Addressed: 4

1. Chapter, DocumentMetadata, ParsedDocument missing readonly (0/13 fields -> 13/13)
2. DependencyCheckResult.allFound derived/redundant (documented as derived convenience field)
3. validateInputFile return type anonymous (now named ValidatedInput)
4. CLIOptions.format unconstrained string (now OutputFormat union)
