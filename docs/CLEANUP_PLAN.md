# AU5 Project Cleanup Plan

## Overview
This document outlines the cleanup and reorganization plan for the AU5 GRC application.

## Issues Identified

### 1. Root Directory - Test Files (Move to tests/)
- `e2e-comprehensive.test.js` → `tests/e2e/`
- `risk-management.test.js` → `tests/unit/`
- `puppeteer_comprehensive_test.js` → `tests/e2e/`
- `test-ai-integration.cjs` → `tests/integration/`
- `test-script.js` → `tests/utilities/`
- `test-user-loading.js` → `tests/utilities/`

### 2. Root Directory - Database Scripts (Move to scripts/)
- `create_compliance_tables.js` → Already in scripts pattern, consolidate
- `create_tables_direct.mjs` → Remove (duplicate functionality)
- `create_tables.js` → Remove (duplicate functionality)
- `create_tables.mjs` → Remove (duplicate functionality)

### 3. Root Directory - Documentation (Consolidate in docs/)
- `aitodo.md` → Remove (outdated TODO)
- `plan.md` → `docs/archives/` (Risk Control Matrix plan - historical)
- `test.md` → `docs/testing/` (Test plan)
- `TODO.md` → Keep in root (main TODO)
- `DEVELOPMENT_SUMMARY.md` → `docs/development/`
- `REPORT.MD` → `docs/specifications/`
- `SETUP.md` → Keep in root (setup guide)
- `Multilang.md` → `docs/development/` (i18n documentation)
- `reporttodo.md` → Remove (outdated)
- `testresults.md` → Remove (outdated test results)

### 4. Root Directory - Log/Output Files (Remove)
- `dev.log` → Remove (should be in .gitignore)
- `risk_management_test_report.json` → Remove (test output)
- `puppeteer_test_report.md` → Remove (test output)

### 5. src/services - Duplicate Files (Consolidate)
- `userManagementService-debug.ts` → Remove
- `userManagementService-fixed.ts` → Remove
- `userManagementService-fixed2.ts` → Remove  
- `userManagementService-fixed3.ts` → Remove
- `controlService-fixed.ts` → Consolidate into controlService.ts

### 6. src/services/src - Nested src folder
- Remove nested `src/services/src/` directory

### 7. Test Directories
- `test_screenshots/` → Keep for visual regression tests
- `testsprite_tests/` → Consolidate into tests/

## Execution Order

### Phase 1: Remove Unnecessary Files
1. Remove outdated documentation files
2. Remove log files and test outputs
3. Remove duplicate service files

### Phase 2: Reorganize Files
1. Move test files to proper test directories
2. Move documentation to docs/
3. Consolidate database scripts

### Phase 3: Update Imports
1. Update imports in files using removed services
2. Fix any broken references

### Phase 4: Clean Up Empty Directories
1. Remove any empty directories after cleanup

## Files to Keep in Root
- `package.json`, `package-lock.json`
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- `vite.config.ts`, `postcss.config.js`, `tailwind.config.js`, `eslint.config.js`
- `index.html`
- `.env`, `.gitignore`
- `TODO.md`, `SETUP.md`

## Post-Cleanup Structure
```
au5/
├── docs/
│   ├── development/
│   │   ├── DEVELOPMENT_SUMMARY.md
│   │   └── Multilang.md
│   ├── specifications/
│   │   └── REPORT.MD
│   ├── testing/
│   │   └── test.md
│   └── archives/
│       └── plan.md
├── scripts/
│   └── (database scripts)
├── sql/
│   └── (SQL files)
├── src/
│   ├── services/
│   │   └── (cleaned services - no duplicates)
│   └── ...
├── tests/
│   ├── e2e/
│   ├── unit/
│   ├── integration/
│   └── utilities/
└── (config files in root)
```
