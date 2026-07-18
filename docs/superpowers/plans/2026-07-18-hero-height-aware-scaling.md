# NutLens Hero Height-Aware Scaling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the NutLens hero fill tall desktop viewports more convincingly while leaving the approved 1440 by 900 baseline and tablet/mobile layouts unchanged.

**Architecture:** Add hero-local height-aware CSS in two bounded media queries. One query grows typography and controls on all tall desktops; a second intermediate-width query grows the hero container and artwork until the existing 1600px rules take over.

**Tech Stack:** Semantic HTML, custom CSS Grid/Flexbox, Node.js contract verifier, local HTTP server, browser automation.

## Global Constraints

- Change production code only in `assets/css/landing-page.css`.
- Preserve the approved 1440 by 900 composition.
- Apply height-aware scaling at widths of at least 1280px and heights of at least 960px.
- Bound intermediate-width artwork/container scaling below 1600px.
- Preserve existing 1600px, 1920px, and 2240px container behavior.
- Do not use CSS `zoom`, root font-size scaling, or `transform: scale()`.
- Preserve image aspect ratios, crop, content, semantics, focus states, and CTA wrapping.
- Do not change tablet/mobile CSS, JavaScript, the navbar, or other sections.
- Do not introduce horizontal overflow.

## File Structure

- Modify: `D:/nutlens1/tests/verify-site.mjs` — local gitignored red/green verifier.
- Modify: `assets/css/landing-page.css` — hero presentation and height-aware queries.
- Reference: `docs/superpowers/specs/2026-07-18-hero-height-aware-scaling-design.md`.

---

### Task 1: Add the failing height-aware hero contract

**Files:**
- Modify: `D:/nutlens1/tests/verify-site.mjs:646-701`
- Test: `D:/nutlens1/tests/verify-site.mjs`

**Interfaces:**
- Consumes: `landingCss`, loaded from the current working directory.
- Produces: contract checks for bounded typography/control and artwork scaling.

- [ ] **Step 1: Add the failing checks after the existing hero image contract**

```js
check('hero adds bounded height-aware desktop typography and controls', () => {
  const start = landingCss.indexOf('@media (min-width: 80rem) and (min-height: 60rem) {');
  const end = landingCss.indexOf('@media (min-width: 80rem) and (min-height: 60rem) and (max-width: 99.9375rem) {');
  const tallDesktopCss = landingCss.slice(start, end);

  return start >= 0
    && end > start
    && /\.hero__rating\s*\{[^}]*font-size:\s*clamp\(var\(--font-size-lg\),\s*2\.05dvh,\s*var\(--font-size-xl\)\)/s.test(tallDesktopCss)
    && /\.hero__recommendation\s*\{[^}]*font-size:\s*clamp\(var\(--font-size-sm\),\s*1\.55dvh,\s*0\.9375rem\)/s.test(tallDesktopCss)
    && /\.hero__title\s*\{[^}]*font-size:\s*clamp\(var\(--font-size-display\),\s*5\.5dvh,\s*3\.375rem\)/s.test(tallDesktopCss)
    && /\.hero__description\s*\{[^}]*font-size:\s*clamp\(var\(--font-size-body-md\),\s*1\.75dvh,\s*1\.0625rem\)/s.test(tallDesktopCss)
    && /\.hero__actions\s*\{[^}]*margin-top:\s*clamp\(var\(--space-8\),\s*3\.6dvh,\s*2\.25rem\)/s.test(tallDesktopCss)
    && /\.hero__cta\s*\{[^}]*min-height:\s*clamp\(3\.5rem,\s*6\.1dvh,\s*3\.75rem\)[^}]*font-size:\s*clamp\(var\(--font-size-h2\),\s*2\.25dvh,\s*1\.375rem\)/s.test(tallDesktopCss)
    && !/(?:^|[;{])\s*zoom\s*:|transform\s*:\s*scale\(/s.test(tallDesktopCss);
});

check('hero adds bounded intermediate-width container and artwork scaling', () => {
  const start = landingCss.indexOf('@media (min-width: 80rem) and (min-height: 60rem) and (max-width: 99.9375rem) {');
  const end = landingCss.indexOf('/* ===== Problems ===== */');
  const intermediateCss = landingCss.slice(start, end);

  return start >= 0
    && end > start
    && /\.hero\s*\{[^}]*width:\s*min\(calc\(100% - \(2 \* var\(--space-4\)\)\),\s*clamp\(80rem,\s*92vw,\s*90rem\)\)/s.test(intermediateCss)
    && /\.hero__artwork\s*\{[^}]*grid-template-columns:[^}]*clamp\(10\.5rem,\s*12\.7vw,\s*12rem\)[^}]*gap:\s*clamp\(var\(--space-4\),\s*1\.3vw,\s*var\(--space-5\)\)[^}]*margin-top:\s*calc\(var\(--space-16\) \* -2\)/s.test(intermediateCss);
});
```

- [ ] **Step 2: Run the verifier and confirm the new checks fail**

```powershell
node D:\nutlens1\tests\verify-site.mjs
```

Expected: the two new checks report `FAIL`; every pre-existing check reports `PASS`.

---

### Task 2: Implement bounded height-aware hero scaling

**Files:**
- Modify: `assets/css/landing-page.css:184-194`
- Test: `D:/nutlens1/tests/verify-site.mjs`

**Interfaces:**
- Consumes: existing shared spacing, typography, and container tokens.
- Produces: tall-desktop dimensions with a clean 1600px handoff.

- [ ] **Step 1: Insert the tall-desktop typography/control rule before Problems**

```css
@media (min-width: 80rem) and (min-height: 60rem) {
  .hero__rating {
    font-size: clamp(var(--font-size-lg), 2.05dvh, var(--font-size-xl));
  }

  .hero__recommendation {
    font-size: clamp(var(--font-size-sm), 1.55dvh, 0.9375rem);
  }

  .hero__title {
    font-size: clamp(var(--font-size-display), 5.5dvh, 3.375rem);
  }

  .hero__description {
    font-size: clamp(var(--font-size-body-md), 1.75dvh, 1.0625rem);
  }

  .hero__actions {
    margin-top: clamp(var(--space-8), 3.6dvh, 2.25rem);
  }

  .hero__cta {
    min-height: clamp(3.5rem, 6.1dvh, 3.75rem);
    padding:
      clamp(var(--space-4), 1.8dvh, var(--space-5))
      clamp(var(--space-8), 3vw, var(--space-10));
    font-size: clamp(var(--font-size-h2), 2.25dvh, 1.375rem);
  }
}
```

- [ ] **Step 2: Insert the intermediate container/artwork rule after it**

```css
@media (min-width: 80rem) and (min-height: 60rem) and (max-width: 99.9375rem) {
  .hero {
    width: min(
      calc(100% - (2 * var(--space-4))),
      clamp(80rem, 92vw, 90rem)
    );
  }

  .hero__artwork {
    grid-template-columns:
      repeat(2, minmax(0, clamp(10.5rem, 12.7vw, 12rem)))
      minmax(0, 1fr)
      repeat(2, minmax(0, clamp(10.5rem, 12.7vw, 12rem)));
    gap: clamp(var(--space-4), 1.3vw, var(--space-5));
    margin-top: calc(var(--space-16) * -2);
  }
}
```

- [ ] **Step 3: Run the verifier and confirm all checks pass**

```powershell
node D:\nutlens1\tests\verify-site.mjs
```

Expected: all six HTML documents and shared CSS pass with zero failures.

- [ ] **Step 4: Inspect the production diff**

```powershell
git diff --check
git diff -- assets/css/landing-page.css
```

Expected: no whitespace errors; only the two hero media queries changed.

- [ ] **Step 5: Commit the CSS**

```powershell
git add assets/css/landing-page.css
git commit -m "fix: scale hero on tall desktop viewports"
```

Expected: one implementation commit containing only landing-page CSS.

---

### Task 3: Verify visual behavior and responsive safety

**Files:**
- Verify: `index.html`
- Verify: `assets/css/global.css`
- Verify: `assets/css/landing-page.css`
- Test: `D:/nutlens1/tests/verify-site.mjs`

**Interfaces:**
- Consumes: committed CSS from Task 2.
- Produces: viewport measurements, screenshots, and interaction evidence.

- [ ] **Step 1: Start a local HTTP server from the worktree**

```powershell
python -m http.server 5500 --bind 127.0.0.1
```

Expected: `http://127.0.0.1:5500/index.html` serves the worktree homepage.

- [ ] **Step 2: Inspect required viewports with browser automation**

Test `1440x900`, `1512x982`, `1600x1000`, `1920x1080`, `1024x768`, `768x1024`, and `390x844`. At each viewport evaluate:

```js
({
  viewportWidth: window.innerWidth,
  viewportHeight: window.innerHeight,
  documentWidth: document.documentElement.scrollWidth,
  horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
  heroBottom: document.querySelector('.hero').getBoundingClientRect().bottom,
  artworkBottom: document.querySelector('.hero__artwork').getBoundingClientRect().bottom,
  artworkWidth: document.querySelector('.hero__artwork').getBoundingClientRect().width,
  headingSize: getComputedStyle(document.querySelector('.hero__title')).fontSize
})
```

Expected: no horizontal overflow; 1440x900 remains at a 48px heading and 1280px container; 1512x982 is visibly larger with less unused bottom space; existing 1600/1920 scaling remains intact; tablet/mobile do not match the new rules.

- [ ] **Step 3: Capture comparison screenshots**

Capture 1440x900, 1512x982, 1600x1000, and 1920x1080. Confirm rounded corners, crop, ghost-card attachment, dominant center image, CTA wrapping, and absence of vertical clipping.

- [ ] **Step 4: Smoke-test unaffected interactions at 1512x982**

1. Open and close the Layanan submenu with pointer and keyboard.
2. Select another Solution step and verify it remains selected after pointer exit.
3. Navigate the Testimonial carousel in both directions.
4. Open and close an FAQ item.

Expected: all behavior matches master and the browser console has no errors.

- [ ] **Step 5: Run final verification**

```powershell
node D:\nutlens1\tests\verify-site.mjs
git diff --check
git status --short --branch
```

Expected: verifier passes, whitespace check is clean, and the feature branch contains only the specification, plan, and CSS commits.
