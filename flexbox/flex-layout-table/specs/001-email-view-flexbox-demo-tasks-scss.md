# Implementation Tasks: Email View Flexbox Demo (SCSS Modules Migration)

**Spec**: [001-email-view-flexbox-demo.md](./001-email-view-flexbox-demo.md)
**Plan**: [001-email-view-flexbox-demo-plan-scss.md](./001-email-view-flexbox-demo-plan-scss.md)
**Created**: 2026-02-13
**Type**: Migration from Tailwind CSS to SCSS Modules

## Task Format

Tasks follow: `- [ ] [ID] [P?] Description (filepath)`

- **[ID]**: Sequential task identifier (M001, M002, etc. - M for Migration)
- **[P]**: Parallel execution marker (tasks can run independently)
- **filepath**: Specific file to create/modify

---

## Phase 0: SCSS Environment Setup

### Dependencies & Configuration
- [ ] M001 [P] Install sass package (package.json)
- [ ] M002 [P] Remove Tailwind CSS dependencies (package.json)
- [ ] M003 [P] Remove tailwind.config.js and postcss.config.js
- [ ] M004 [P] Remove Prettier Tailwind plugin from .prettierrc
- [ ] M005 Create SCSS module type definitions (src/types/scss.d.ts)

**Acceptance**: `npm install` runs successfully, Tailwind removed

---

## Phase 1: SCSS Foundation Structure

### Global Styles Setup
- [ ] M006 Create styles directory (src/styles/)
- [ ] M007 Create SCSS variables file (src/styles/variables.scss)
- [ ] M008 Define color palette in variables (src/styles/variables.scss)
- [ ] M009 Define spacing scale in variables (src/styles/variables.scss)
- [ ] M010 Define typography scale in variables (src/styles/variables.scss)
- [ ] M011 Define shadows and z-index in variables (src/styles/variables.scss)
- [ ] M012 Create SCSS mixins file (src/styles/mixins.scss)
- [ ] M013 Define flexbox mixins (src/styles/mixins.scss)
- [ ] M014 Define truncate mixin (src/styles/mixins.scss)
- [ ] M015 Define badge mixin (src/styles/mixins.scss)
- [ ] M016 Define scrollable mixin (src/styles/mixins.scss)
- [ ] M017 Create global styles file (src/styles/globals.scss)
- [ ] M018 Add CSS reset to globals (src/styles/globals.scss)
- [ ] M019 Add base typography to globals (src/styles/globals.scss)
- [ ] M020 Update index.css to import globals (src/index.css)

**Acceptance**: SCSS files compile, variables and mixins accessible

---

## Phase 2: Component Migration (Convert each component)

### App Component
- [ ] M021 Create App.module.scss file (src/components/App.module.scss)
- [ ] M022 Define .app container styles with vertical flexbox (src/components/App.module.scss)
- [ ] M023 Define .main content area styles (src/components/App.module.scss)
- [ ] M024 Update App.tsx to import and use styles (src/components/App.tsx)
- [ ] M025 Remove all Tailwind className from App.tsx (src/components/App.tsx)

### Header Component
- [ ] M026 Create Header.module.scss file (src/components/Header.module.scss)
- [ ] M027 Define .header container with gradient background (src/components/Header.module.scss)
- [ ] M028 Define .container with flexbox layout (src/components/Header.module.scss)
- [ ] M029 Define .title styles (src/components/Header.module.scss)
- [ ] M030 Define .stats flexbox container (src/components/Header.module.scss)
- [ ] M031 Define .badge styles using mixin (src/components/Header.module.scss)
- [ ] M032 Update Header.tsx to import and use styles (src/components/Header.tsx)
- [ ] M033 Remove all Tailwind className from Header.tsx (src/components/Header.tsx)

### Footer Component
- [ ] M034 Create Footer.module.scss file (src/components/Footer.module.scss)
- [ ] M035 Define .footer container styles (src/components/Footer.module.scss)
- [ ] M036 Update Footer.tsx to import and use styles (src/components/Footer.tsx)
- [ ] M037 Remove all Tailwind className from Footer.tsx (src/components/Footer.tsx)

### EmailTable Component
- [ ] M038 Create EmailTable.module.scss file (src/components/EmailTable.module.scss)
- [ ] M039 Define .tableContainer with scrollable mixin (src/components/EmailTable.module.scss)
- [ ] M040 Define .table base styles (src/components/EmailTable.module.scss)
- [ ] M041 Update EmailTable.tsx to import and use styles (src/components/EmailTable.tsx)
- [ ] M042 Remove all Tailwind className from EmailTable.tsx (src/components/EmailTable.tsx)

### EmailTableHeader Component
- [ ] M043 Create EmailTableHeader.module.scss file (src/components/EmailTableHeader.module.scss)
- [ ] M044 Define .tableHeader with sticky positioning (src/components/EmailTableHeader.module.scss)
- [ ] M045 Define .headerRow styles (src/components/EmailTableHeader.module.scss)
- [ ] M046 Define .headerCell styles (src/components/EmailTableHeader.module.scss)
- [ ] M047 Update EmailTableHeader.tsx to import and use styles (src/components/EmailTableHeader.tsx)
- [ ] M048 Remove all Tailwind className from EmailTableHeader.tsx (src/components/EmailTableHeader.tsx)

### EmailRow Component
- [ ] M049 Create EmailRow.module.scss file (src/components/EmailRow.module.scss)
- [ ] M050 Define .row base styles with hover state (src/components/EmailRow.module.scss)
- [ ] M051 Define .selected variant styles (src/components/EmailRow.module.scss)
- [ ] M052 Define .unread variant styles (src/components/EmailRow.module.scss)
- [ ] M053 Define .senderCell with truncation (src/components/EmailRow.module.scss)
- [ ] M054 Define .senderName and .senderEmail styles (src/components/EmailRow.module.scss)
- [ ] M055 Define .subjectCell with truncate mixin (src/components/EmailRow.module.scss)
- [ ] M056 Define .dateCell styles (src/components/EmailRow.module.scss)
- [ ] M057 Define .statusCell styles (src/components/EmailRow.module.scss)
- [ ] M058 Define .badgeRead and .badgeUnread using badge mixin (src/components/EmailRow.module.scss)
- [ ] M059 Update EmailRow.tsx to import and use styles (src/components/EmailRow.tsx)
- [ ] M060 Update className logic for selected/unread states (src/components/EmailRow.tsx)
- [ ] M061 Remove all Tailwind className from EmailRow.tsx (src/components/EmailRow.tsx)

### EmailPreview Component
- [ ] M062 Create EmailPreview.module.scss file (src/components/EmailPreview.module.scss)
- [ ] M063 Define .previewContainer with scrollable and border (src/components/EmailPreview.module.scss)
- [ ] M064 Define .senderName styles (large, prominent) (src/components/EmailPreview.module.scss)
- [ ] M065 Define .senderEmail styles (smaller, gray) (src/components/EmailPreview.module.scss)
- [ ] M066 Define .subject styles (bold, xl) (src/components/EmailPreview.module.scss)
- [ ] M067 Define .date styles (src/components/EmailPreview.module.scss)
- [ ] M068 Define .badgeContainer styles (src/components/EmailPreview.module.scss)
- [ ] M069 Define .badge variants (read/unread) (src/components/EmailPreview.module.scss)
- [ ] M070 Define .divider styles (src/components/EmailPreview.module.scss)
- [ ] M071 Define .previewText with whitespace-pre-wrap (src/components/EmailPreview.module.scss)
- [ ] M072 Update EmailPreview.tsx to import and use styles (src/components/EmailPreview.tsx)
- [ ] M073 Remove all Tailwind className from EmailPreview.tsx (src/components/EmailPreview.tsx)

**Acceptance**: All components use SCSS Modules, no Tailwind classes remain

---

## Phase 3: Testing & Validation

### Visual Verification
- [ ] M074 [P] Verify App layout (vertical flexbox, fixed header/footer) (manual testing)
- [ ] M075 [P] Verify Header appearance and counts display (manual testing)
- [ ] M076 [P] Verify Footer appearance (manual testing)
- [ ] M077 [P] Verify EmailTable scrolling and overflow (manual testing)
- [ ] M078 [P] Verify sticky table header behavior (manual testing)
- [ ] M079 [P] Verify EmailRow hover states (manual testing)
- [ ] M080 [P] Verify EmailRow selected state highlighting (manual testing)
- [ ] M081 [P] Verify EmailRow read/unread visual distinction (manual testing)
- [ ] M082 [P] Verify text truncation with ellipsis (manual testing)
- [ ] M083 [P] Verify EmailPreview layout and styling (manual testing)
- [ ] M084 [P] Verify 50/50 horizontal split when email selected (manual testing)

### Functional Verification
- [ ] M085 Test email selection functionality (manual testing)
- [ ] M086 Test scroll performance with 500 emails (manual testing)
- [ ] M087 Test window resize behavior (manual testing)
- [ ] M088 Verify no className conflicts (browser DevTools)
- [ ] M089 Verify CSS source maps work (browser DevTools)

### Build Verification
- [ ] M090 Run TypeScript type check (npm run build)
- [ ] M091 Run ESLint (npm run lint)
- [ ] M092 Verify production build succeeds (npm run build)
- [ ] M093 Check bundle size (compare before/after)

### Browser Compatibility Testing
- [ ] M094 [P] Test in Chrome (latest) (manual testing)
- [ ] M095 [P] Test in Firefox (latest) (manual testing)
- [ ] M096 [P] Test in Safari (latest) (manual testing)
- [ ] M097 [P] Test in Edge (latest) (manual testing)

**Acceptance**: All visual and functional requirements met with SCSS

---

## Phase 4: Cleanup & Documentation

### Cleanup
- [ ] M098 [P] Verify no Tailwind classes remain in codebase (grep search)
- [ ] M099 [P] Remove unused Tailwind imports (code review)
- [ ] M100 [P] Clean up package-lock.json (npm install)

### Documentation
- [ ] M101 Update README with SCSS Modules information (README.md)
- [ ] M102 Add SCSS architecture documentation to README (README.md)
- [ ] M103 Document variable system in README (README.md)
- [ ] M104 Document mixin usage examples in README (README.md)
- [ ] M105 Update component examples in README (README.md)

**Acceptance**: Documentation complete, codebase clean

---

## Dependency Map

```
Phase 0 (Setup):
M001, M002, M003, M004 → M005

Phase 1 (Foundation):
M005 → M006
M006 → M007 → M008, M009, M010, M011
M006 → M012 → M013, M014, M015, M016
M006 → M017 → M018, M019
M019 → M020

Phase 2 (Component Migration):
Each component can be migrated in parallel after Phase 1:

App Component:
M020 → M021 → M022, M023 → M024 → M025

Header Component:
M020 → M026 → M027, M028, M029, M030, M031 → M032 → M033

Footer Component:
M020 → M034 → M035 → M036 → M037

EmailTable Component:
M020 → M038 → M039, M040 → M041 → M042

EmailTableHeader Component:
M020 → M043 → M044, M045, M046 → M047 → M048

EmailRow Component:
M020 → M049 → M050, M051, M052, M053, M054, M055, M056, M057, M058 → M059 → M060 → M061

EmailPreview Component:
M020 → M062 → M063, M064, M065, M066, M067, M068, M069, M070, M071 → M072 → M073

Phase 3 (Testing):
All Phase 2 tasks → M074-M097 (can run in parallel)

Phase 4 (Cleanup):
M097 → M098, M099, M100, M101, M102, M103, M104, M105
```

---

## Parallel Execution Opportunities

**Phase 0**: M001, M002, M003, M004 can run in parallel

**Phase 1**:
- M008, M009, M010, M011 (variable definitions) can be done in parallel
- M013, M014, M015, M016 (mixin definitions) can be done in parallel
- M018, M019 (global styles) can be done in parallel

**Phase 2**: After M020, all component migrations can run in parallel:
- M021-M025 (App)
- M026-M033 (Header)
- M034-M037 (Footer)
- M038-M042 (EmailTable)
- M043-M048 (EmailTableHeader)
- M049-M061 (EmailRow)
- M062-M073 (EmailPreview)

**Phase 3**: M074-M097 (all testing tasks) can run in parallel

**Phase 4**: M098, M099, M100 can run in parallel; M101-M105 can run in parallel

---

## Migration Scope

**Total Migration Tasks**: 109 tasks (105 migration + 4 bug fix)

### By Phase:
- **Phase 0 (Setup)**: 5 tasks (M001-M005)
- **Phase 1 (Foundation)**: 15 tasks (M006-M020)
- **Phase 2 (Components)**: 53 tasks (M021-M073)
  - App: 5 tasks
  - Header: 8 tasks
  - Footer: 4 tasks
  - EmailTable: 5 tasks
  - EmailTableHeader: 6 tasks
  - EmailRow: 13 tasks
  - EmailPreview: 12 tasks
- **Phase 3 (Testing)**: 24 tasks (M074-M097)
- **Phase 4 (Cleanup)**: 8 tasks (M098-M105)
- **Phase 5 (Bug Fixes)**: 4 tasks (M106-M109)

**Estimated Duration**: 6-8 hours total
- Phase 0: 30 min
- Phase 1: 45 min
- Phase 2: 3-4 hours (parallel possible)
- Phase 3: 1.5 hours
- Phase 4: 30 min

---

## Task Execution Strategy

### Recommended Order:

1. **Complete Phase 0** (Setup)
   - Remove Tailwind completely
   - Set up SCSS infrastructure

2. **Complete Phase 1** (Foundation)
   - Create all shared variables and mixins
   - Ensure foundation is solid before component work

3. **Phase 2 - Component by Component** (Recommended for safety)
   - Migrate one component at a time
   - Test after each component
   - Order: App → Header → Footer → EmailTable → EmailTableHeader → EmailRow → EmailPreview

   OR

   **Phase 2 - All at Once** (Faster if confident)
   - Migrate all components in parallel
   - Test all at the end

4. **Complete Phase 3** (Testing)
   - Comprehensive testing
   - Visual regression check

5. **Complete Phase 4** (Cleanup)
   - Documentation updates
   - Final cleanup

---

## SCSS Module Pattern Reference

### Import Pattern
```tsx
import styles from './ComponentName.module.scss';
```

### Usage Pattern
```tsx
<div className={styles.containerName}>
  <span className={styles.elementName}>
</div>
```

### Conditional Classes
```tsx
className={`
  ${styles.base}
  ${isActive ? styles.active : ''}
  ${hasError ? styles.error : ''}
`}
```

### SCSS Module Structure
```scss
@use '../styles/variables' as vars;
@use '../styles/mixins' as mix;

.containerName {
  // styles using vars and mix
}

.elementName {
  @include mix.someFixIn;
  color: vars.$primary-600;
}
```

---

## Success Criteria

### Visual Parity
- ✓ Identical appearance to Tailwind version
- ✓ All flexbox patterns working correctly
- ✓ Smooth scrolling and interactions
- ✓ Responsive behavior maintained

### Code Quality
- ✓ TypeScript: 0 errors
- ✓ ESLint: 0 warnings
- ✓ No Tailwind classes remaining
- ✓ Proper SCSS module usage
- ✓ Variables and mixins used consistently

### Performance
- ✓ Bundle size similar or smaller
- ✓ Build time acceptable
- ✓ HMR (Hot Module Replacement) works with SCSS

### Documentation
- ✓ README updated with SCSS info
- ✓ Architecture documented
- ✓ Examples provided

---

## Troubleshooting Guide

### Common Issues

**Issue**: SCSS not compiling
- **Fix**: Ensure `sass` is installed: `npm install -D sass`

**Issue**: TypeScript errors with `styles.className`
- **Fix**: Ensure `src/types/scss.d.ts` exists with proper declarations

**Issue**: Styles not applying
- **Fix**: Check import path, ensure `.module.scss` extension is used

**Issue**: Global styles not working
- **Fix**: Verify `globals.scss` is imported in `main.tsx` or `index.css`

**Issue**: Variables not accessible
- **Fix**: Use `@use '../styles/variables' as vars;` in SCSS files

---

---

## Phase 5: Post-Implementation Bug Fixes

### Bug Fix: 50/50 Split Correction (2026-02-13)

**Issue**: Horizontal layout showing 1:4 ratio instead of 50/50 split

**Root Cause**: `flex: 1 1 auto` uses content-based flex-basis, causing unequal distribution

**Solution**: Change to `flex: 1` (with flex-basis: 0) for equal distribution

- [x] M106 Investigate 50/50 split issue (manual testing)
- [x] M107 Fix EmailTable.module.scss flex property (src/components/EmailTable.module.scss:7)
- [x] M108 Fix EmailPreview.module.scss flex property (src/components/EmailPreview.module.scss:7)
- [x] M109 Update README documentation for Pattern 2 (README.md:140-148)

**Acceptance**: Layout displays proper 50/50 split between table and preview

---

## Next Steps

After migration complete:

1. ✅ All 105 tasks completed
2. ✅ Visual and functional parity achieved
3. ✅ Tests passing
4. ✅ Documentation updated
5. ✅ Bug fix: 50/50 split corrected (4 additional tasks)
6. 🎉 SCSS Modules migration successful!

Optional enhancements:
- Add CSS custom properties for runtime theming
- Implement dark mode with SCSS variables
- Add more mixins for common patterns
