# NutLens Hero Viewport-Fit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the complete NutLens desktop hero visible in one CSS viewport across short, baseline, and tall desktop windows while preserving the approved 1440 by 900 composition.

**Architecture:** Convert only the desktop hero wrapper into a two-row Grid whose content row is intrinsic and whose artwork row receives the remaining `dvh`-based block space. Add a compact wide-and-short mode that contracts only bounded hero spacing and artwork size, then move the existing 1600px and 1920px hero enlargement into width-and-height-gated media queries; all non-hero large-screen rules remain width-only.

**Tech Stack:** Semantic HTML already in the repository, custom CSS Grid, media queries, `clamp()`, dynamic viewport units, Node.js static verifier, headless Microsoft Edge for viewport QA.

## Global Constraints

- Modify only hero-related rules in `assets/css/landing-page.css`.
- Do not change HTML, copy, image sources, JavaScript, navbar styling, or any section after the hero.
- Preserve the current tablet and mobile layouts at and below `48rem`.
- Preserve all five artwork items, their order, aspect ratios, ghost-card proportions, `object-fit`, and object positions.
- Do not use `zoom`, wrapper `transform: scale()`, negative page offsets, or root font-size changes.
- Keep the 1440 by 900 title at 48px and body copy at no less than 16px.
- Keep CTA labels at their current baseline and preserve the existing `3.5rem` minimum interactive height.
- The complete desktop hero must fit at 1366 by 768, 1440 by 900, 1512 by 982, 1600 by 900, 1600 by 1000, and 1920 by 1080 without horizontal overflow.
- Existing tablet/mobile behavior and every JavaScript interaction must remain unchanged.
- `tests/verify-site.mjs` and `docs/` are intentionally ignored by `.gitignore`; use the verifier locally, and force-add only this plan document when committing documentation.

---

### Task 1: Add the local RED contract for height-aware hero layout

**Files:**
- Modify locally (ignored verifier): `tests/verify-site.mjs:648-729`
- Reference: `assets/css/landing-page.css:3-240,1927-2043`

**Interfaces:**
- Consumes: `landingCss`, `css`, and the existing `check(name, test)` verifier API.
- Produces: local assertions for the hero gap token, desktop two-row Grid, compact mode, height-gated large artwork, and the prohibition on whole-page scaling.

- [ ] **Step 1: Add a balanced CSS-block reader to the verifier**

Insert this function immediately after `check(name, test)` so media-query assertions do not stop at the first nested closing brace:

```js
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
```

- [ ] **Step 2: Keep the existing centered-container check compatible with the new gap token**

Replace the current `hero CSS uses the approved responsive centered container` check with:

```js
check('hero CSS uses the approved responsive centered container', () => {
  const block = css.match(/\.hero\s*\{([^}]*)\}/s)?.[1] ?? '';
  return /width:\s*min\(calc\(100% - \(2 \* var\(--space-4\)\)\),\s*var\(--container-max\)\)/.test(block)
    && /margin-inline:\s*auto/.test(block)
    && /margin-top:\s*var\(--(?:space-10|hero-block-gap)\)/.test(block);
});
```

This retains the original 1280px centered-container contract while allowing the approved gap token to replace the literal spacing token.

- [ ] **Step 3: Add failing layout-mode checks after the existing intermediate hero check**

Insert the following checks after `hero adds bounded intermediate-width container and artwork scaling`:

```js
check('hero derives its outer gap and block size from one local token', () => {
  const hero = landingCss.match(/\.hero\s*\{([^}]*)\}/s)?.[1] ?? '';

  return /--hero-block-gap:\s*var\(--space-10\)/.test(hero)
    && /min-height:\s*calc\(100dvh\s*-\s*var\(--navbar-height\)\s*-\s*\(2 \* var\(--space-6\)\)\s*-\s*var\(--hero-block-gap\)\)/.test(hero)
    && /margin-top:\s*var\(--hero-block-gap\)/.test(hero);
});

check('desktop hero allocates remaining viewport height to artwork', () => {
  const desktopHeroCss = readCssBlock(
    landingCss,
    '@media (min-width: 48.0625rem)',
  );

  return /\.hero\s*\{[^}]*display:\s*grid[^}]*grid-template-rows:\s*auto\s+minmax\(0,\s*1fr\)[^}]*height:\s*calc\(100dvh\s*-\s*var\(--navbar-height\)\s*-\s*\(2 \* var\(--space-6\)\)\s*-\s*var\(--hero-block-gap\)\)[^}]*min-height:\s*0/s.test(desktopHeroCss)
    && /\.hero__artwork\s*\{[^}]*align-self:\s*end[^}]*min-height:\s*0/s.test(desktopHeroCss);
});

check('wide short desktops use bounded compact hero values', () => {
  const compactCss = readCssBlock(
    landingCss,
    '@media (min-width: 64rem) and (max-height: 51.9375rem)',
  );

  return /\.hero\s*\{[^}]*--hero-block-gap:\s*clamp\(var\(--space-4\),\s*2dvh,\s*var\(--space-8\)\)/s.test(compactCss)
    && /\.hero__title\s*\{[^}]*font-size:\s*clamp\(var\(--font-size-3xl\),\s*6\.1dvh,\s*3rem\)/s.test(compactCss)
    && /\.hero__description\s*\{[^}]*margin-top:\s*var\(--space-3\)/s.test(compactCss)
    && /\.hero__actions\s*\{[^}]*margin-top:\s*var\(--space-6\)/s.test(compactCss)
    && /\.hero__cta\s*\{[^}]*min-height:\s*3\.5rem/s.test(compactCss)
    && /\.hero__artwork\s*\{[^}]*width:\s*min\(100%,\s*80rem\)[^}]*margin-inline:\s*auto/s.test(compactCss)
    && !/(?:^|[;{])\s*zoom\s*:|transform\s*:\s*scale\(/s.test(compactCss);
});

check('large hero artwork growth requires both width and height', () => {
  const largeHeroCss = readCssBlock(
    landingCss,
    '@media (min-width: 100rem) and (min-height: 60rem)',
  );
  const extraLargeHeroCss = readCssBlock(
    landingCss,
    '@media (min-width: 120rem) and (min-height: 64rem)',
  );
  const widthOnlyLargeCss = readCssBlock(landingCss, '@media (min-width: 100rem) {');
  const widthOnlyExtraLargeCss = readCssBlock(landingCss, '@media (min-width: 120rem) {');

  return /\.hero__artwork\s*\{[^}]*minmax\(0,\s*12rem\)[^}]*gap:\s*var\(--space-5\)/s.test(largeHeroCss)
    && /\.hero__artwork\s*\{[^}]*minmax\(0,\s*13rem\)[^}]*gap:\s*var\(--space-6\)/s.test(extraLargeHeroCss)
    && !/\.hero__artwork\s*\{/.test(widthOnlyLargeCss)
    && !/\.hero__artwork\s*\{/.test(widthOnlyExtraLargeCss);
});

check('hero viewport fitting does not scale the page wrapper', () =>
  !/(?:^|[;{])\s*zoom\s*:|(?:\.hero|\.landing-page|body|html)[^{]*\{[^}]*transform\s*:\s*scale\(/s.test(landingCss),
);
```

- [ ] **Step 4: Run the verifier and confirm a controlled RED result**

Run from the repository/worktree root:

```powershell
$env:NUTLENS_ROOT=(Get-Location).Path
node D:\nutlens1\tests\verify-site.mjs
```

Expected: the existing suite remains green, while these four new production-contract checks fail:

```text
FAIL hero derives its outer gap and block size from one local token
FAIL desktop hero allocates remaining viewport height to artwork
FAIL wide short desktops use bounded compact hero values
FAIL large hero artwork growth requires both width and height
```

Expected: `hero viewport fitting does not scale the page wrapper` already passes. If an unrelated existing check fails, stop and diagnose before changing production CSS.

- [ ] **Step 5: Keep the local verifier out of the feature commit**

Run:

```powershell
git check-ignore -v tests/verify-site.mjs
git status --short
```

Expected: `tests/verify-site.mjs` is reported as ignored by `.gitignore`, and no production file has changed yet. Do not force-add the verifier because the approved production scope contains only hero CSS.

---

### Task 2: Implement the minimum CSS for compact, baseline, and expanded hero modes

**Files:**
- Modify: `assets/css/landing-page.css:3-240`
- Modify: `assets/css/landing-page.css:1925-2043`
- Test locally: `tests/verify-site.mjs`

**Interfaces:**
- Consumes: existing design tokens (`--navbar-height`, spacing tokens, font tokens), the existing five-column artwork classes, and tablet/mobile breakpoint at `48rem`.
- Produces: `--hero-block-gap`, desktop Grid allocation at `48.0625rem`, compact mode at `64rem` plus `max-height: 51.9375rem`, and large hero artwork rules gated by minimum height.

- [ ] **Step 1: Make the hero outer gap a single local input**

Replace the existing `.hero` block with:

```css
.hero {
  --hero-block-gap: var(--space-10);

  min-height: calc(100dvh - var(--navbar-height) - (2 * var(--space-6)) - var(--hero-block-gap));
  width: min(calc(100% - (2 * var(--space-4))), var(--container-max));
  margin-top: var(--hero-block-gap);
  margin-inline: auto;
  padding-bottom: var(--space-0);
}
```

This preserves the 40px baseline while ensuring the block-size calculation and visible outer gap cannot drift apart.

- [ ] **Step 2: Add desktop-only remaining-height allocation without touching the mobile query**

Insert this block immediately before the existing `@media (max-width: 48rem)` rule:

```css
@media (min-width: 48.0625rem) {
  .hero {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    height: calc(100dvh - var(--navbar-height) - (2 * var(--space-6)) - var(--hero-block-gap));
    min-height: 0;
  }

  .hero__artwork {
    align-self: end;
    min-height: 0;
  }
}
```

The content remains in normal flow in row one; only the artwork row consumes remaining height. The existing `@media (max-width: 48rem)` flow remains untouched.

- [ ] **Step 3: Add compact desktop overrides for wide viewports below 52rem tall**

Insert this block after the existing `@media (max-width: 48rem)` rule and before the existing `80rem` by `60rem` tall-desktop query:

```css
@media (min-width: 64rem) and (max-height: 51.9375rem) {
  .hero {
    --hero-block-gap: clamp(var(--space-4), 2dvh, var(--space-8));
  }

  .hero__title {
    font-size: clamp(var(--font-size-3xl), 6.1dvh, 3rem);
  }

  .hero__description {
    margin-top: var(--space-3);
  }

  .hero__actions {
    margin-top: var(--space-6);
  }

  .hero__cta {
    min-height: 3.5rem;
    padding-block: var(--space-3);
  }

  .hero__artwork {
    width: min(100%, 80rem);
    margin-inline: auto;
  }

  .hero__image--outer {
    margin-bottom: clamp(var(--space-16), 8dvh, var(--space-20));
  }

  .hero__image--side {
    margin-bottom: clamp(var(--space-6), 4dvh, var(--space-10));
  }
}
```

This caps a 1600px-or-wider short viewport near the approved 1280px artwork width, reduces only vertical whitespace, and keeps the current CTA label size and 56px minimum height.

- [ ] **Step 4: Gate only the 1600px and 1920px hero artwork enlargement by height**

Insert these hero-only media queries immediately before `/* ===== Large-screen scaling ===== */`:

```css
@media (min-width: 100rem) and (min-height: 60rem) {
  .hero__artwork {
    grid-template-columns:
      repeat(2, minmax(0, 12rem))
      minmax(0, 1fr)
      repeat(2, minmax(0, 12rem));
    gap: var(--space-5);
    margin-top: calc(var(--space-16) * -2);
  }
}

@media (min-width: 120rem) and (min-height: 64rem) {
  .hero__artwork {
    grid-template-columns:
      repeat(2, minmax(0, 13rem))
      minmax(0, 1fr)
      repeat(2, minmax(0, 13rem));
    gap: var(--space-6);
    margin-top: calc((var(--space-16) * -2) + var(--space-4));
  }
}
```

Then remove only the `.hero__artwork` block from `@media (min-width: 100rem)` and only the `.hero__artwork` block from `@media (min-width: 120rem)`. Keep every Problems, Solution, How It Works, Testimonial, About, FAQ/CTA, and Footer declaration in those width-only queries exactly as-is.

- [ ] **Step 5: Run the complete verifier for GREEN**

Run:

```powershell
$env:NUTLENS_ROOT=(Get-Location).Path
node D:\nutlens1\tests\verify-site.mjs
```

Expected: every check prints `PASS`, including all new hero viewport-mode checks and all existing navbar, artwork, section, accessibility, and interaction contracts. Expected process exit code: `0`.

- [ ] **Step 6: Check CSS syntax hygiene and scope**

Run:

```powershell
git diff --check
git diff -- assets/css/landing-page.css
git status --short
```

Expected: no whitespace errors; the diff contains only hero-related declarations in `assets/css/landing-page.css`; `index.html`, `assets/css/global.css`, and all `.mjs` files remain unchanged.

- [ ] **Step 7: Commit the production CSS**

```powershell
git add assets/css/landing-page.css
git commit -m "fix: fit hero to desktop viewport height"
```

Expected: one commit containing only `assets/css/landing-page.css`.

---

### Task 3: Verify the viewport matrix and tune only bounded compact values if required

**Files:**
- Create temporarily (ignored QA artifact): `tmp/hero-viewport-fit/probe.html`
- Create temporarily: `tmp/hero-viewport-fit/*.png`
- Modify only if a fit defect is observed: `assets/css/landing-page.css`
- Test locally: `tests/verify-site.mjs`

**Interfaces:**
- Consumes: the CSS modes from Task 2 and the locally served `index.html`.
- Produces: numeric hero-fit evidence and screenshots for the required viewport matrix; no temporary QA artifact is committed.

- [ ] **Step 1: Create a same-origin viewport probe**

Create `tmp/hero-viewport-fit/probe.html` with `apply_patch` using this exact content:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>NutLens hero viewport probe</title>
    <style>
      html,
      body,
      iframe {
        width: 100%;
        height: 100%;
        margin: 0;
        border: 0;
      }

      body {
        overflow: hidden;
      }

      #result {
        position: fixed;
        inset: 0 auto auto 0;
        z-index: 1;
        margin: 0;
        padding: 4px;
        background: white;
        font: 12px monospace;
      }
    </style>
  </head>
  <body>
    <iframe id="page" src="/index.html" title="NutLens verification page"></iframe>
    <pre id="result">pending</pre>
    <script>
      const frame = document.querySelector('#page');
      const result = document.querySelector('#result');

      frame.addEventListener('load', () => {
        const view = frame.contentWindow;
        const documentElement = frame.contentDocument.documentElement;
        const hero = frame.contentDocument.querySelector('.hero');
        const artwork = [...frame.contentDocument.querySelectorAll('.hero__image-frame')];
        const heroRect = hero.getBoundingClientRect();

        result.textContent = JSON.stringify({
          width: view.innerWidth,
          height: view.innerHeight,
          noHorizontalOverflow: documentElement.scrollWidth <= view.innerWidth,
          heroFits: heroRect.bottom <= view.innerHeight + 1,
          artworkFits: artwork.every((item) => {
            const rect = item.getBoundingClientRect();
            return rect.top >= -1 && rect.bottom <= view.innerHeight + 1;
          }),
          heroBottom: Math.round(heroRect.bottom),
        });
      });
    </script>
  </body>
</html>
```

- [ ] **Step 2: Start the local server in a hidden process**

Run:

```powershell
$server = Start-Process -FilePath python -ArgumentList '-m','http.server','5500','--bind','127.0.0.1' -WorkingDirectory (Get-Location) -WindowStyle Hidden -PassThru
Start-Sleep -Seconds 1
Invoke-WebRequest http://127.0.0.1:5500/index.html -UseBasicParsing | Select-Object StatusCode
```

Expected: status code `200`. Keep `$server.Id` for cleanup.

- [ ] **Step 3: Capture required desktop screenshots**

Run each command with the installed Edge executable:

```powershell
$edge='C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
& $edge --headless=new --disable-gpu --hide-scrollbars --window-size=1366,768 --screenshot="tmp/hero-viewport-fit/1366x768.png" http://127.0.0.1:5500/index.html
& $edge --headless=new --disable-gpu --hide-scrollbars --window-size=1440,900 --screenshot="tmp/hero-viewport-fit/1440x900.png" http://127.0.0.1:5500/index.html
& $edge --headless=new --disable-gpu --hide-scrollbars --window-size=1512,982 --screenshot="tmp/hero-viewport-fit/1512x982.png" http://127.0.0.1:5500/index.html
& $edge --headless=new --disable-gpu --hide-scrollbars --window-size=1600,900 --screenshot="tmp/hero-viewport-fit/1600x900.png" http://127.0.0.1:5500/index.html
& $edge --headless=new --disable-gpu --hide-scrollbars --window-size=1600,1000 --screenshot="tmp/hero-viewport-fit/1600x1000.png" http://127.0.0.1:5500/index.html
& $edge --headless=new --disable-gpu --hide-scrollbars --window-size=1920,1080 --screenshot="tmp/hero-viewport-fit/1920x1080.png" http://127.0.0.1:5500/index.html
```

Expected: six PNG files. Inspect each with `view_image`. The 1440 by 900 screenshot must remain visually equivalent to the approved baseline; all five images, ghost cards, text, and CTAs must be visible in every desktop screenshot.

- [ ] **Step 4: Run numeric fit probes for the same matrix**

For each `--window-size` value from Step 3, run Edge against `http://127.0.0.1:5500/tmp/hero-viewport-fit/probe.html` with `--dump-dom` and inspect the JSON inside `#result`. Example:

```powershell
& $edge --headless=new --disable-gpu --window-size=1366,768 --dump-dom http://127.0.0.1:5500/tmp/hero-viewport-fit/probe.html | Select-String 'noHorizontalOverflow|heroFits|artworkFits'
```

Expected for every desktop viewport:

```json
{"noHorizontalOverflow":true,"heroFits":true,"artworkFits":true}
```

The output also includes the actual CSS viewport width, height, and `heroBottom`; record those actual values because browser chrome or device-scale settings can make them differ slightly from screenshot pixels.

- [ ] **Step 5: Smoke-check tablet and mobile without changing their layout**

Capture and inspect `1024x768`, `768x1024`, and `390x844` screenshots using the same Edge command pattern. Expected: no horizontal scrollbar, existing one-/five-track responsive behavior remains usable, and there is no desktop-only forced single-viewport compression at or below `48rem`.

- [ ] **Step 6: If and only if a desktop fit probe fails, tune bounded compact values**

Change only one or more of these existing compact-mode preferred values, keeping the declared minimum and maximum bounds unchanged:

```css
--hero-block-gap: clamp(var(--space-4), 2dvh, var(--space-8));
font-size: clamp(var(--font-size-3xl), 6.1dvh, 3rem);
margin-bottom: clamp(var(--space-16), 8dvh, var(--space-20));
margin-bottom: clamp(var(--space-6), 4dvh, var(--space-10));
```

After each single-value adjustment, rerun the failing viewport probe, inspect its screenshot, and run the complete verifier. Do not change aspect ratios, crop, CTA minimum height, HTML, global tokens, or the `48rem` mobile query.

- [ ] **Step 7: Run final regression verification**

Run:

```powershell
$env:NUTLENS_ROOT=(Get-Location).Path
node D:\nutlens1\tests\verify-site.mjs
git diff --check
git status --short
```

Expected: verifier exit code `0`, no whitespace errors, and no tracked change except a possible bounded CSS tuning change made in Step 6.

- [ ] **Step 8: Commit any evidence-driven tuning separately**

Only if Step 6 changed the CSS:

```powershell
git add assets/css/landing-page.css
git commit -m "fix: tune compact hero viewport fit"
```

Expected: the commit contains only `assets/css/landing-page.css`. If no tuning was required, do not create an empty commit.

- [ ] **Step 9: Stop the server and remove ignored QA artifacts safely**

Run:

```powershell
Stop-Process -Id $server.Id
$qaPath = (Resolve-Path 'tmp/hero-viewport-fit').Path
$workspacePath = (Resolve-Path '.').Path
if ($qaPath.StartsWith($workspacePath, [System.StringComparison]::OrdinalIgnoreCase)) {
  Remove-Item -LiteralPath $qaPath -Recurse -Force
} else {
  throw "Refusing to remove QA path outside workspace: $qaPath"
}
```

Expected: the local server stops, only `tmp/hero-viewport-fit` is removed, and `git status --short` is clean.

---

### Task 4: Final review and handoff

**Files:**
- Review: `assets/css/landing-page.css`
- Review locally: `tests/verify-site.mjs`

**Interfaces:**
- Consumes: all Task 2 CSS and Task 3 verification evidence.
- Produces: a clean, verified feature branch ready for local merge or pull request.

- [ ] **Step 1: Review the final diff against the approved scope**

Run:

```powershell
git diff master...HEAD -- assets/css/landing-page.css
git diff --name-only master...HEAD
```

Expected: production changes are limited to `assets/css/landing-page.css`; documentation commits may include the approved spec and this plan; no HTML, JavaScript, navbar, global CSS, or later-section rules changed.

- [ ] **Step 2: Run the final verifier one last time from the feature workspace**

```powershell
$env:NUTLENS_ROOT=(Get-Location).Path
node D:\nutlens1\tests\verify-site.mjs
```

Expected: all checks pass with exit code `0`.

- [ ] **Step 3: Confirm the branch is ready for integration**

```powershell
git status --short
git log --oneline --decorate -5
```

Expected: clean status and one or two focused production commits after the documentation commits. Do not push or merge without explicit user authorization.
