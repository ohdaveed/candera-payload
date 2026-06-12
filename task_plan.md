# Unused Code Cleanup Analysis Plan

Goal: identify unused code, dead functions, unreachable code, and unused imports in candera-payload, then produce a safe cleanup plan with before/after comparisons.

## Phases

- [x] Phase 1: Initialize analysis notes
- [x] Phase 2: Inspect project config, scripts, and entry points
- [x] Phase 3: Run static unused-code checks
- [x] Phase 4: Verify risky findings manually against routing/config/runtime conventions
- [x] Phase 5: Write final cleanup plan in output/

## Constraints

- Read-only analysis of source files unless user later asks for cleanup implementation.
- Do not remove code in this pass.
- Treat framework conventions, dynamic imports, Payload collection/config registration, and Next.js routing as reachable unless proven otherwise.

## Errors Encountered

| Error                                                                       | Attempt | Resolution                                            |
| --------------------------------------------------------------------------- | ------- | ----------------------------------------------------- |
| rg UNC launch failure                                                       | 1       | Switched to git ls-files and PowerShell Get-ChildItem |
| pnpm unavailable on Windows PATH and Ubuntu PATH                            | 1       | Used local project binaries from node_modules/.bin    |
| apply_patch wrote report to /home/ohdaveed/output instead of project output | 1       | Copied report into project output/                    |
