# NutLens Mobile Problems Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membuat section Problem NutLens responsif pada mobile dengan spacing tunggal 96px dari Hero, typography dan card intrinsik, serta efek hover yang hanya aktif pada pointer presisi.

**Architecture:** Pertahankan HTML dan base desktop saat ini. Tambahkan satu override `@media (max-width: 48rem)` di area CSS Problem, lalu pindahkan seluruh visual hover dan transition ke media capability `@media (hover: hover) and (pointer: fine)` agar perangkat sentuh selalu menerima state default.

**Tech Stack:** Semantic HTML5, custom CSS, Node.js ESM contract tests, browser QA melalui localhost.

## Global Constraints

- Hanya ubah responsive CSS section Problem di `assets/css/landing-page.css`.
- Jangan mengubah Navbar, Hero, section Solution atau section lain, HTML, JavaScript, copy, aset, warna global, atau typography global.
- Breakpoint mobile adalah `@media (max-width: 48rem)`.
- Hero `margin-bottom: var(--space-24)` yang sudah ada menjadi satu-satunya sumber jarak 96px menuju eyebrow Problem.
- Hover dekoratif hanya boleh aktif pada `@media (hover: hover) and (pointer: fine)`.
- Jangan menambah dependency, JavaScript deteksi perangkat, `100vw`, posisi absolut, atau margin negatif.
- Pertahankan layout desktop dan tablet mulai 769px.

## File Structure

- Create `tests/mobile-problems.test.mjs`: contract test untuk spacing, layout, typography, gambar, card, hover capability, dan semantik yang tidak berubah.
- Modify `assets/css/landing-page.css:595-709`: membatasi hover desktop serta menambahkan override mobile Problem.
- No change `index.html`: struktur semantik yang ada sudah memenuhi urutan konten dan menjadi regression contract.

---

### Task 1: Add the failing mobile Problems contract

**Files:**
- Create: `tests/mobile-problems.test.mjs`
- Test: `tests/mobile-problems.test.mjs`

**Interfaces:**
- Consumes: selector `.problems`, `.problems__layout`, `.problems__eyebrow`, `.problems__title`, `.problems__media`, `.problems__list`, dan `.problem-card` dari `assets/css/landing-page.css`.
- Produces: executable Node contract test dengan exit code `1` ketika CSS belum memenuhi spesifikasi dan `0` setelah implementasi benar.

- [ ] **Step 1: Write the failing contract test**

Create `tests/mobile-problems.test.mjs`:

```js
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const landingCss = readFileSync(
  resolve(projectRoot, 'assets/css/landing-page.css'),
  'utf8',
);
const index = readFileSync(resolve(projectRoot, 'index.html'), 'utf8');
const failures = [];

function readCssBlock(source, marker) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) return '';
  const openingBrace = source.indexOf('{', markerIndex);
  if (openingBrace < 0) return '';

  let depth = 0;
  for (let cursor = openingBrace; cursor < source.length; cursor += 1) {
    if (source[cursor] === '{') depth += 1;
    if (source[cursor] === '}') depth -= 1;
    if (depth === 0) return source.slice(openingBrace + 1, cursor);
  }
  return '';
}

function readLastCssBlock(source, marker) {
  const markerIndex = source.lastIndexOf(marker);
  return markerIndex < 0 ? '' : readCssBlock(source.slice(markerIndex), marker);
}

function check(name, predicate) {
  try {
    assert.ok(predicate(), name);
    console.log(`PASS ${name}`);
  } catch {
    failures.push(name);
    console.error(`FAIL ${name}`);
  }
}

const mobileCss = readLastCssBlock(landingCss, '@media (max-width: 48rem)');
const mobileProblems = readCssBlock(mobileCss, '.problems');
const mobileLayout = readCssBlock(mobileCss, '.problems__layout');
const mobileEyebrow = readCssBlock(mobileCss, '.problems__eyebrow');
const mobileTitle = readCssBlock(mobileCss, '.problems__title');
const mobileMedia = readCssBlock(mobileCss, '.problems__media');
const mobileList = readCssBlock(mobileCss, '.problems__list');
const mobileCard = readCssBlock(mobileCss, '.problem-card');
const mobileCardTitle = readCssBlock(mobileCss, '.problem-card__title');
const mobileCardDescription = readCssBlock(
  mobileCss,
  '.problem-card__description',
);
const hoverCss = readCssBlock(
  landingCss,
  '@media (hover: hover) and (pointer: fine)',
);
const baseCard = readCssBlock(landingCss, '.problem-card');
const baseIcon = readCssBlock(landingCss, '.problem-card__icon');

check('mobile Problems reuses the project 48rem breakpoint', () =>
  mobileCss.length > 0,
);

check('Hero margin is the single mobile section gap source', () =>
  /padding-block:\s*0\s+var\(--space-24\)/.test(mobileProblems)
  && !/margin-(?:block-)?start/.test(mobileProblems),
);

check('mobile Problems stays in a one-column normal flow', () =>
  /grid-template-columns:\s*minmax\(0,\s*1fr\)/.test(mobileLayout)
  && !/position:\s*absolute/.test(mobileLayout),
);

check('mobile eyebrow and heading use the approved fluid typography', () =>
  /font-size:\s*clamp\(0\.6875rem,\s*2\.8vw,\s*0\.75rem\)/.test(mobileEyebrow)
  && /letter-spacing:\s*0\.08em/.test(mobileEyebrow)
  && /width:\s*100%/.test(mobileTitle)
  && /max-width:\s*12ch/.test(mobileTitle)
  && /margin-top:\s*var\(--space-6\)/.test(mobileTitle)
  && /font-size:\s*clamp\(2rem,\s*8\.5vw,\s*2\.5rem\)/.test(mobileTitle)
  && /line-height:\s*1\.08/.test(mobileTitle)
  && /letter-spacing:\s*-0\.02em/.test(mobileTitle),
);

check('mobile Problem image fills the container without changing crop', () =>
  /width:\s*100%/.test(mobileMedia)
  && /max-width:\s*none/.test(mobileMedia)
  && /margin-top:\s*var\(--space-8\)/.test(mobileMedia)
  && /aspect-ratio:\s*608\s*\/\s*432/.test(landingCss)
  && /object-fit:\s*cover/.test(landingCss),
);

check('mobile Problem cards are intrinsic and use token gaps', () =>
  /gap:\s*var\(--space-4\)/.test(mobileList)
  && /margin-top:\s*var\(--space-8\)/.test(mobileList)
  && /padding-top:\s*0/.test(mobileList)
  && /height:\s*auto/.test(mobileCard)
  && /padding:\s*clamp\(var\(--space-5\),\s*5vw,\s*var\(--space-6\)\)/.test(mobileCard),
);

check('mobile card text uses the approved fluid ranges', () =>
  /font-size:\s*clamp\(1\.125rem,\s*4\.8vw,\s*1\.375rem\)/.test(mobileCardTitle)
  && /line-height:\s*1\.2/.test(mobileCardTitle)
  && /font-size:\s*clamp\(0\.875rem,\s*3\.6vw,\s*1rem\)/.test(mobileCardDescription)
  && /line-height:\s*1\.5/.test(mobileCardDescription),
);

check('base cards and icons do not animate on touch devices', () =>
  /transition:\s*none/.test(baseCard)
  && /transition:\s*none/.test(baseIcon),
);

check('all decorative hover states are pointer-capability gated', () =>
  /\.problem-card\s*\{[^}]*transition:/s.test(hoverCss)
  && /\.problem-card:hover\s*\{[^}]*background-color:[^}]*translate:[^}]*box-shadow:/s.test(hoverCss)
  && /\.problem-card:hover\s+\.problem-card__icon\s*\{[^}]*background-color:/s.test(hoverCss)
  && !/^\s*\.problem-card:is\(:hover,\s*:focus-within\)/m.test(landingCss),
);

check('Problems HTML semantics and content order remain unchanged', () =>
  /<section\b[^>]*class="problems"[^>]*aria-labelledby="problems-title"/i.test(index)
  && /problems__eyebrow[\s\S]*?problems__title[\s\S]*?problems__media[\s\S]*?problems__list/i.test(index)
  && (index.match(/class="problem-card"/g) ?? []).length === 3,
);

if (failures.length) {
  console.error(`\n${failures.length} mobile Problems check(s) failed.`);
  process.exitCode = 1;
} else {
  console.log('\nAll mobile Problems checks passed.');
}
```

- [ ] **Step 2: Run the test and verify the expected red state**

Run:

```powershell
node tests/mobile-problems.test.mjs
```

Expected: FAIL for spacing, mobile typography, intrinsic card sizing, and fully gated hover rules. Semantic HTML and existing image-ratio checks may already pass.

- [ ] **Step 3: Commit the executable failing contract**

```powershell
git add -f -- tests/mobile-problems.test.mjs
git commit -m "test: define mobile problems responsive contract"
```

Expected: one commit containing only `tests/mobile-problems.test.mjs`.

---

### Task 2: Implement responsive Problems CSS and capability-gated hover

**Files:**
- Modify: `assets/css/landing-page.css:595-709`
- Test: `tests/mobile-problems.test.mjs`

**Interfaces:**
- Consumes: global spacing, radius, color, typography, and transition tokens already declared by the project.
- Produces: mobile Problem layout through `@media (max-width: 48rem)` and desktop-only decorative hover through pointer capability queries.

- [ ] **Step 1: Make touch defaults inert and move hover visuals into the capability query**

In the base `.problem-card` rule replace its transition with `transition: none`. In `.problem-card__icon`, replace the background transition with `transition: none`. Replace the current hover rules with:

```css
@media (hover: hover) and (pointer: fine) {
  .problem-card {
    transition:
      background-color var(--transition-medium),
      translate var(--transition-base),
      box-shadow var(--transition-base);
  }

  .problem-card:hover {
    background-color: var(--color-surface-container-high);
    translate: var(--space-2) 0;
    box-shadow: 0 10px 30px rgb(0 0 0 / 0.05);
  }

  .problem-card__icon {
    transition: background-color var(--transition-medium);
  }

  .problem-card:hover .problem-card__icon {
    background-color: var(--color-primary-container);
  }
}
```

Delete the two ungated `.problem-card:is(:hover, :focus-within)` rules. Do not add a mobile reset selector because the default state itself is now touch-safe.

- [ ] **Step 2: Add the approved mobile override and remove the obsolete 30rem Problem override**

Immediately after `@media (max-width: 78rem)`, replace the existing Problem-only `@media (max-width: 30rem)` block with:

```css
@media (max-width: 48rem) {
  .problems {
    padding-block: 0 var(--space-24);
  }

  .problems__layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .problems__eyebrow {
    font-size: clamp(0.6875rem, 2.8vw, 0.75rem);
    letter-spacing: 0.08em;
  }

  .problems__title {
    width: 100%;
    max-width: 12ch;
    margin-top: var(--space-6);
    font-size: clamp(2rem, 8.5vw, 2.5rem);
    line-height: 1.08;
    letter-spacing: -0.02em;
  }

  .problems__media {
    width: 100%;
    max-width: none;
    margin-top: var(--space-8);
  }

  .problems__list {
    gap: var(--space-4);
    margin-top: var(--space-8);
    padding-top: 0;
  }

  .problem-card {
    grid-template-columns: 3.5rem minmax(0, 1fr);
    gap: var(--space-4);
    height: auto;
    padding: clamp(var(--space-5), 5vw, var(--space-6));
  }

  .problem-card__title {
    font-size: clamp(1.125rem, 4.8vw, 1.375rem);
    line-height: 1.2;
  }

  .problem-card__description {
    font-size: clamp(0.875rem, 3.6vw, 1rem);
    line-height: 1.5;
  }
}
```

Do not edit the Hero media query. Its existing `margin-bottom: var(--space-24)` supplies the 96px section gap.

- [ ] **Step 3: Scope reduced motion to the desktop hover capability**

Replace the Problem-specific reduced-motion block with:

```css
@media (prefers-reduced-motion: reduce) and (hover: hover) and (pointer: fine) {
  .problem-card,
  .problem-card__icon {
    transition-duration: 1ms;
  }

  .problem-card:hover {
    translate: 0 0;
  }
}
```

- [ ] **Step 4: Run focused tests and verify green state**

```powershell
node tests/mobile-problems.test.mjs
node --check tests/mobile-problems.test.mjs
git diff --check
```

Expected: all mobile Problems checks pass; syntax and whitespace checks exit `0`.

- [ ] **Step 5: Run existing regression tests**

```powershell
node tests/mobile-hero.test.mjs
node tests/mobile-navigation.test.mjs
```

Expected: all existing Hero and mobile navigation checks pass without modification.

- [ ] **Step 6: Commit the CSS implementation**

```powershell
git add -- assets/css/landing-page.css
git commit -m "style: optimize problems section for mobile"
```

Expected: implementation commit contains only `assets/css/landing-page.css`.

---

### Task 3: Verify browser geometry and interaction boundaries

**Files:**
- Verify: `index.html`
- Verify: `assets/css/landing-page.css`
- Verify: `tests/mobile-problems.test.mjs`

**Interfaces:**
- Consumes: committed mobile CSS and existing static `index.html`.
- Produces: QA evidence for mobile geometry, touch-safe state, desktop hover preservation, and zero overflow.

- [ ] **Step 1: Start the local static server**

Run from the repository root:

```powershell
py -m http.server 5500 --bind 127.0.0.1
```

Open `http://127.0.0.1:5500/index.html` in the in-app browser.

- [ ] **Step 2: Verify five required mobile viewports**

Check `320 x 568`, `360 x 800`, `375 x 667`, `390 x 844`, and `430 x 932` with browser zoom 100%. For each viewport record computed layout and confirm:

```text
problems padding-block-start = 0px
visual Hero-to-eyebrow gap = 96px
layout columns = one column
title inline bounds stay inside the Problems container
title computed size stays within 32px to 40px
media aspect ratio remains approximately 608 / 432
all three cards have height >= scrollHeight
all cards use the default white background
all cards and icons have no transform or shadow
document.documentElement.scrollWidth <= window.innerWidth
```

Expected: every assertion is true on all five viewports.

- [ ] **Step 3: Verify breakpoint and desktop behavior**

Check 768px, 769px, 1024px, and 1440px:

```text
768px uses the mobile Problem override
769px no longer uses mobile typography or mobile section padding
1024px retains the existing tablet one-column layout
1440px retains the existing two-column design and second-card offset
desktop pointer hover changes background, icon background, translate, and shadow
```

Expected: mobile rules stop above 48rem and desktop pointer hover remains functional.

- [ ] **Step 4: Run final verification from committed state**

```powershell
node tests/mobile-problems.test.mjs
node tests/mobile-hero.test.mjs
node tests/mobile-navigation.test.mjs
node --check tests/mobile-problems.test.mjs
git diff --check HEAD~2 HEAD
git status --short --branch
```

Expected: all tests pass, diff check exits `0`, and the feature branch working tree is clean.

