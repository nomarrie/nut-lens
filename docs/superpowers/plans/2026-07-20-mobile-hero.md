# NutLens Mobile Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing NutLens Hero readable, centered, artwork-free, and overflow-safe through the existing 48rem mobile breakpoint without changing desktop presentation.

**Architecture:** Keep the existing semantic HTML and desktop-first Hero rules intact. Add one static Node contract test, then extend the existing `@media (max-width: 48rem)` block in `assets/css/landing-page.css` with narrowly scoped overrides for flow, typography, CTA visibility, and artwork visibility.

**Tech Stack:** Semantic HTML5, custom CSS, Node.js ESM tests using `node:assert/strict`, local HTTP browser verification.

## Global Constraints

- Modify only mobile Hero CSS and its dedicated test.
- Mobile mode ends at `48rem` (768 CSS pixels); rules at 769px and above must remain unchanged.
- Do not modify `index.html`, production JavaScript, navbar, other sections, colors, text, or artwork crop.
- Do not use `position: absolute`, `zoom`, `transform: scale`, fixed Hero heights, negative margins, or a new breakpoint.
- Hide the secondary CTA and all Hero artwork on mobile while keeping the primary CTA semantic and focusable.
- Verify `320 x 568`, `360 x 800`, `375 x 667`, `390 x 844`, and `430 x 932` at browser zoom 100%.
- Preserve compact desktop, baseline desktop, and large desktop behavior.

---

## File map

- `assets/css/landing-page.css`: owns all landing-page Hero presentation and receives the mobile-only overrides.
- `tests/mobile-hero.test.mjs`: owns static assertions for breakpoint placement, mobile flow, typography, CTA behavior, artwork hiding, and desktop base-rule protection.

### Task 1: Add and satisfy the mobile Hero CSS contract

**Files:**
- Create: `tests/mobile-hero.test.mjs`
- Modify: `assets/css/landing-page.css:464-471`

**Interfaces:**
- Consumes: the existing `.hero`, `.hero__content`, `.hero__title`, `.hero__description`, `.hero__actions`, `.hero__cta--primary`, `.hero__cta--secondary`, and `.hero__artwork` selectors.
- Produces: mobile-only computed presentation inside the existing `@media (max-width: 48rem)` block; no JavaScript interface or DOM contract changes.

- [ ] **Step 1: Write the failing contract test**

Create `tests/mobile-hero.test.mjs` with the complete content below:

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
  for (let index = openingBrace; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') depth -= 1;
    if (depth === 0) return source.slice(openingBrace + 1, index);
  }

  return '';
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

const mobileCss = readCssBlock(landingCss, '@media (max-width: 48rem)');
const mobileHero = readCssBlock(mobileCss, '.hero');
const mobileContent = readCssBlock(mobileCss, '.hero__content');
const mobileTitle = readCssBlock(mobileCss, '.hero__title');
const mobileDescription = readCssBlock(mobileCss, '.hero__description');
const mobileActions = readCssBlock(mobileCss, '.hero__actions');
const mobilePrimary = readCssBlock(mobileCss, '.hero__cta--primary');
const desktopHero = readCssBlock(landingCss, '.hero');
const desktopArtwork = readCssBlock(landingCss, '.hero__artwork');

function compact(source) {
  return source.replace(/\s+/g, '');
}

check('mobile Hero reuses the approved 48rem breakpoint', () =>
  mobileCss.length > 0
  && !landingCss.includes('@media (max-width: 48.0625rem)'),
);

check('mobile Hero uses content-driven height and token spacing', () =>
  /^\s*height:\s*auto/m.test(mobileHero)
  && /min-height:\s*auto/.test(mobileHero)
  && /margin-top:\s*var\(--space-10\)/.test(mobileHero),
);

check('Hero retains the safe token-based container gutter', () =>
  compact(desktopHero).includes(
    'width:min(calc(100%-(2*var(--space-4))),var(--container-max));',
  )
  && !/width:\s*100vw/.test(mobileHero),
);

check('mobile Hero content stays centered in normal flow', () =>
  /width:\s*100%/.test(mobileContent)
  && /transform:\s*none/.test(mobileContent)
  && !/position:\s*absolute/.test(mobileContent),
);

check('mobile heading uses the approved fluid type range', () =>
  /width:\s*100%/.test(mobileTitle)
  && /max-width:\s*20ch/.test(mobileTitle)
  && /margin-top:\s*var\(--space-6\)/.test(mobileTitle)
  && /font-size:\s*clamp\(2rem,\s*9vw,\s*2\.375rem\)/.test(mobileTitle)
  && /line-height:\s*1\.08/.test(mobileTitle),
);

check('mobile description keeps a readable centered measure', () =>
  /width:\s*100%/.test(mobileDescription)
  && /max-width:\s*34ch/.test(mobileDescription)
  && /margin-top:\s*var\(--space-6\)/.test(mobileDescription)
  && /line-height:\s*var\(--line-height-body-md\)/.test(mobileDescription),
);

check('mobile actions expose one full-width primary CTA', () =>
  /width:\s*100%/.test(mobileActions)
  && /margin-top:\s*var\(--space-10\)/.test(mobileActions)
  && /width:\s*100%/.test(mobilePrimary)
  && /min-height:\s*3\.5rem/.test(mobilePrimary)
  && /\.hero__cta--secondary\s*,\s*\.hero__artwork\s*\{[^}]*display:\s*none/s.test(mobileCss),
);

check('desktop artwork base rule remains a grid', () =>
  /display:\s*grid/.test(desktopArtwork),
);

check('semantic Hero content and destinations remain in HTML', () =>
  /<section\b[^>]*class="hero"[^>]*aria-labelledby="hero-title"/i.test(index)
  && /href="assets\/pages\/cek-makanan\.html"[\s\S]*?hero__cta--primary/i.test(index)
  && /href="assets\/pages\/resep-galeri\.html"[\s\S]*?hero__cta--secondary/i.test(index)
  && /<div\b[^>]*class="hero__artwork"/i.test(index),
);

if (failures.length) {
  console.error(`\n${failures.length} mobile Hero check(s) failed.`);
  process.exitCode = 1;
} else {
  console.log('\nAll mobile Hero checks passed.');
}
```

- [ ] **Step 2: Run the test and verify the red phase**

Run:

```powershell
node tests/mobile-hero.test.mjs
```

Expected: exit code 1. The checks for content-driven height, normal flow, fluid heading, readable description, single CTA, and hidden artwork fail because the current mobile block only changes the artwork grid.

- [ ] **Step 3: Add the minimum mobile CSS overrides**

Replace the current contents of the existing `@media (max-width: 48rem)` block in `assets/css/landing-page.css` with:

```css
@media (max-width: 48rem) {
  .hero {
    height: auto;
    min-height: auto;
    margin-top: var(--space-10);
  }

  .hero__content {
    width: 100%;
    transform: none;
  }

  .hero__title {
    width: 100%;
    max-width: 20ch;
    margin-top: var(--space-6);
    font-size: clamp(2rem, 9vw, 2.375rem);
    line-height: 1.08;
  }

  .hero__description {
    width: 100%;
    max-width: 34ch;
    margin-top: var(--space-6);
    line-height: var(--line-height-body-md);
  }

  .hero__actions {
    width: 100%;
    margin-top: var(--space-10);
  }

  .hero__cta--primary {
    width: 100%;
    min-height: 3.5rem;
  }

  .hero__cta--secondary,
  .hero__artwork {
    display: none;
  }
}
```

- [ ] **Step 4: Run the focused test and verify the green phase**

Run:

```powershell
node tests/mobile-hero.test.mjs
```

Expected: exit code 0 and `All mobile Hero checks passed.`

- [ ] **Step 5: Run existing regression tests**

Run:

```powershell
node tests/mobile-navigation.test.mjs
node tests/profile-dropdown.test.mjs
node tests/verify-site.mjs
git diff --check
```

Expected: the tracked mobile-navigation suite passes, the focused mobile Hero suite remains green, and `git diff --check` prints no whitespace errors. Local ignored suites retain the baseline behavior documented below apart from assertions whose mobile-artwork contract is explicitly superseded by this feature.

Repository baseline recorded before implementation:

- `tests/mobile-navigation.test.mjs` passes all checks;
- local ignored `tests/profile-dropdown.test.mjs` has one existing failure, `profile dropdown contains the approved identity and actions`;
- local ignored `tests/verify-site.mjs` has 23 existing failures;
- two currently passing verifier checks, `narrow hero keeps the center artwork visible and dominant` and `narrow hero reserves flow space for external ghost cards`, describe the superseded mobile design and are expected to fail once artwork is intentionally hidden.

Do not edit either ignored local test to conceal these baseline or superseded-contract results. The authoritative new mobile contract is `tests/mobile-hero.test.mjs`. `git diff --check` must still print no whitespace errors.

- [ ] **Step 6: Commit the tested implementation**

Because `tests/` is ignored by the repository's current `.gitignore`, stage only the dedicated test with `-f`:

```powershell
git add -- assets/css/landing-page.css
git add -f -- tests/mobile-hero.test.mjs
git commit -m "style: optimize hero for mobile viewports"
```

Expected: one commit containing only `assets/css/landing-page.css` and `tests/mobile-hero.test.mjs`.

### Task 2: Verify mobile geometry and desktop isolation in a browser

**Files:**
- Inspect: `index.html`
- Inspect: `assets/css/landing-page.css`
- Inspect: `assets/css/global.css`

**Interfaces:**
- Consumes: the completed mobile CSS contract from Task 1.
- Produces: browser evidence that the computed layout meets the viewport and desktop-regression acceptance criteria; no production file change is expected.

- [ ] **Step 1: Start the static site over HTTP**

Run from `D:\nutlens1`:

```powershell
$server = Start-Process -FilePath python -ArgumentList '-m','http.server','5500','--bind','127.0.0.1' -WorkingDirectory 'D:\nutlens1' -WindowStyle Hidden -PassThru
$server.Id
```

Expected: PowerShell prints the server process ID and `http://127.0.0.1:5500/index.html` responds successfully.

- [ ] **Step 2: Inspect all five mobile viewports**

Open `http://127.0.0.1:5500/index.html` with browser zoom 100%, then inspect `320 x 568`, `360 x 800`, `375 x 667`, `390 x 844`, and `430 x 932`.

At each viewport, evaluate this exact browser expression:

```js
(() => {
  const hero = document.querySelector('.hero');
  const title = document.querySelector('.hero__title');
  const primary = document.querySelector('.hero__cta--primary');
  const secondary = document.querySelector('.hero__cta--secondary');
  const artwork = document.querySelector('.hero__artwork');
  const heroStyle = getComputedStyle(hero);
  const primaryStyle = getComputedStyle(primary);

  return {
    viewport: [innerWidth, innerHeight],
    horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
    heroHeight: heroStyle.height,
    heroMinHeight: heroStyle.minHeight,
    titleInsideViewport:
      title.getBoundingClientRect().left >= 0
      && title.getBoundingClientRect().right <= innerWidth,
    primaryWidthDelta:
      Math.abs(
        primary.getBoundingClientRect().width
        - document.querySelector('.hero__actions').getBoundingClientRect().width,
      ),
    primaryMinHeight: primaryStyle.minHeight,
    secondaryDisplay: getComputedStyle(secondary).display,
    artworkDisplay: getComputedStyle(artwork).display,
  };
})()
```

Expected at every mobile viewport:

- `horizontalOverflow` is `false`;
- `heroMinHeight` is `0px` or `auto`, depending on browser serialization;
- `titleInsideViewport` is `true`;
- `primaryWidthDelta` is at most 1 CSS pixel;
- `primaryMinHeight` resolves to 56px;
- `secondaryDisplay` is `none`;
- `artworkDisplay` is `none`.

Also visually confirm that rating, recommendation, heading, description, and CTA remain centered and readable without overlap.

- [ ] **Step 3: Verify the breakpoint boundary and desktop modes**

Inspect the page at `768 x 900`, `769 x 900`, `1366 x 650`, `1536 x 738`, and `1600 x 900`.

Evaluate:

```js
(() => ({
  viewport: [innerWidth, innerHeight],
  artworkDisplay: getComputedStyle(
    document.querySelector('.hero__artwork'),
  ).display,
  secondaryDisplay: getComputedStyle(
    document.querySelector('.hero__cta--secondary'),
  ).display,
  horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
}))()
```

Expected:

- at 768px, artwork and secondary CTA are `none`;
- at 769px and all desktop viewports, artwork is `grid` and secondary CTA is not `none`;
- no tested viewport has horizontal overflow;
- compact desktop, baseline desktop, and large desktop retain their existing composition.

- [ ] **Step 4: Stop the local server and confirm the worktree is clean**

Run:

```powershell
$serverPid = (
  Get-NetTCPConnection `
    -LocalAddress 127.0.0.1 `
    -LocalPort 5500 `
    -State Listen
).OwningProcess
Stop-Process -Id $serverPid
git status --short --branch
```

Expected: the server stops and Git reports the intended branch with no uncommitted implementation changes.
