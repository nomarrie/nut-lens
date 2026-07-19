# Compact Desktop Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menyederhanakan Hero pada desktop setinggi maksimal 680px dengan menyembunyikan ghost card dan menyelaraskan empat actual side image dengan heading tanpa mengubah baseline `1536 × 738`.

**Architecture:** Pertahankan HTML dan grid lima kolom yang ada. Ganti media query compact agar berbasis tinggi `42.5rem`, samakan alignment serta margin outer/side, pertahankan tinggi track artwork agar main image tidak ikut naik, lalu gunakan satu custom property offset hasil pengukuran untuk keempat frame samping.

**Tech Stack:** Semantic HTML, custom CSS, vanilla Node.js assertion script, localhost browser QA.

## Global Constraints

- Perubahan hanya pada Hero landing page di `assets/css/landing-page.css`.
- Compact desktop aktif mulai lebar `64rem` dan pada `max-height: 42.5rem`.
- Target compact utama adalah `1366 × 650` dan `1536 × 650` CSS pixels pada zoom 100%.
- Baseline `1536 × 738` tidak boleh berubah.
- Ghost card hilang hanya pada compact mode; actual image tidak disembunyikan.
- Outer dan side memakai satu offset yang sama dan memiliki top alignment yang sama.
- Main image tetap berada di bawah CTA dan tidak menerima offset compact.
- Tidak boleh ada horizontal overflow atau perubahan JavaScript/HTML/section lain.

---

## File Structure

- Modify: `assets/css/landing-page.css` — memiliki seluruh aturan Hero dan media query compact desktop.
- Create temporarily: `tmp/verify-compact-hero.mjs` — assertion statis untuk membuktikan kontrak media query dan shared offset sebelum browser QA; hapus setelah verifikasi selesai.
- Reference only: `tests/verify-site.mjs` — verifier repository yang dijalankan tanpa mengubah baseline failure yang sudah ada.

### Task 1: Implement compact-height Hero alignment

**Files:**
- Create temporarily: `tmp/verify-compact-hero.mjs`
- Modify: `assets/css/landing-page.css:375-397`
- Test: `tmp/verify-compact-hero.mjs`

**Interfaces:**
- Consumes: token `--space-4`, `--space-6`, dan `--space-16` dari `assets/css/global.css`; selector Hero yang sudah ada.
- Produces: custom property CSS `--hero-compact-side-offset: -7.625rem` yang dipakai bersama oleh `.hero__image--outer` dan `.hero__image--side` hanya pada compact desktop.

- [ ] **Step 1: Write the failing compact contract test**

Create `tmp/verify-compact-hero.mjs`:

```js
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(
  new URL('../assets/css/landing-page.css', import.meta.url),
  'utf8',
);

assert.match(
  css,
  /@media\s*\(min-width:\s*64rem\)\s*and\s*\(max-height:\s*42\.5rem\)/,
  'compact desktop must be selected by the approved width and height boundary',
);

assert.doesNotMatch(
  css,
  /@media\s*\(min-width:\s*64rem\)\s*and\s*\(max-width:\s*95\.9375rem\)\s*and\s*\(max-height:/,
  '1536x650 must not be excluded from compact desktop',
);

assert.match(
  css,
  /@media\s*\(min-width:\s*64rem\)\s*and\s*\(max-height:\s*42\.5rem\)[\s\S]*?\.hero\s*\{[^}]*--hero-compact-side-offset:\s*-7\.625rem[^}]*min-height:\s*auto/,
  'compact Hero must expose one measured side-card offset',
);

assert.match(
  css,
  /\.hero__image--outer::before,\s*\.hero__image--side::before\s*\{[^}]*content:\s*none/,
  'compact Hero must hide ghost cards only',
);

assert.match(
  css,
  /\.hero__image--outer,\s*\.hero__image--side\s*\{[^}]*--hero-artwork-y:\s*var\(--hero-compact-side-offset\)[^}]*align-self:\s*start[^}]*margin-bottom:\s*0/,
  'outer and side frames must share one offset and one alignment rule',
);

assert.match(
  css,
  /\.hero__artwork\s*\{[^}]*min-height:\s*calc\(17rem \+ \(var\(--space-16\) \* 2\)\)/,
  'compact artwork must preserve its original 400px track height',
);

assert.match(
  css,
  /\.hero__image--main\s*\{[^}]*align-self:\s*end/,
  'main image must remain at the bottom of the artwork track',
);

console.log('PASS compact desktop Hero CSS contract');
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
node tmp/verify-compact-hero.mjs
```

Expected: exit code `1` with `AssertionError` stating that the approved `max-height: 42.5rem` media query or shared offset is missing.

- [ ] **Step 3: Replace the existing compact media query with the minimal implementation**

In `assets/css/landing-page.css`, replace the complete media query beginning with `@media (min-width: 64rem) and (max-width: 95.9375rem) and (max-height: 51.25rem)` with:

```css
@media (min-width: 64rem) and (max-height: 42.5rem) {
  .hero {
    --hero-compact-side-offset: -7.625rem;

    min-height: auto;
  }

  .hero__actions {
    margin-top: var(--space-6);
  }

  .hero__artwork {
    min-height: calc(17rem + (var(--space-16) * 2));
  }

  .hero__image--outer::before,
  .hero__image--side::before {
    content: none;
  }

  .hero__image--outer,
  .hero__image--side {
    --hero-artwork-y: var(--hero-compact-side-offset);

    align-self: start;
    margin-bottom: 0;
  }

  .hero__image--main {
    align-self: end;
  }
}
```

The `-7.625rem` shared offset is the rounded measured delta between compact artwork top (`316.2px`) and heading top (`194.6px`). It places all four side frames at approximately `194.2px`, within `0.4px` of the heading.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```powershell
node tmp/verify-compact-hero.mjs
```

Expected:

```text
PASS compact desktop Hero CSS contract
```

- [ ] **Step 5: Verify compact rendering at 1366 × 650 and 1536 × 650**

Start a local static server:

```powershell
npx.cmd -y http-server@latest . -a 127.0.0.1 -p 5500 -c-1
```

Expected: the page is available at `http://127.0.0.1:5500/`. Use the in-app browser viewport capability at zoom 100% and collect `getBoundingClientRect()` for:

```js
const selectors = {
  title: '.hero__title',
  outerLeft: '.hero__image--outer:first-child',
  sideLeft: '.hero__image--side.hero__image-frame--left',
  main: '.hero__image--main',
  sideRight: '.hero__image--side.hero__image-frame--right',
  outerRight: '.hero__image--outer:last-child',
  actions: '.hero__actions',
};
```

For each compact viewport, verify:

```text
abs(outerLeft.top - title.top) <= 1
abs(sideLeft.top - title.top) <= 1
abs(sideRight.top - title.top) <= 1
abs(outerRight.top - title.top) <= 1
main.top >= actions.bottom + 16
computed ::before content for outer and side == none
nearest horizontal image-to-heading gap >= 16
document.documentElement.scrollWidth <= innerWidth
```

Expected approximate compact geometry at both widths:

```text
heading top: 194.6px
outer/side top: 194.2px
CTA bottom: 444.2px
main image top: 476.2px
```

- [ ] **Step 6: Verify baseline and large desktop regression**

At `1536 × 738`, verify these pre-change measurements remain within 1px:

```text
Hero/container width: 1280px
heading top: 194.6px
CTA margin-top: 32px
outer top: 324.2px
side top: 412.2px
main top: 484.2px
ghost-card ::before content: ""
horizontal overflow: false
```

At `1600 × 900`, verify:

```text
Hero/container width: 1440px
horizontal overflow: false
large-desktop artwork remains visible
```

- [ ] **Step 7: Run repository verification and inspect the diff**

Run:

```powershell
node tests/verify-site.mjs
git diff --check
git diff -- assets/css/landing-page.css
git status --short
```

Expected:

- The focused Hero contract passes.
- `git diff --check` exits `0`.
- The repository verifier may continue reporting its 20 known restored-snapshot contract failures; no additional failure may be introduced by this change.
- Only `assets/css/landing-page.css` is a production-code modification.

- [ ] **Step 8: Remove the temporary focused test and commit**

Delete `tmp/verify-compact-hero.mjs`, then run:

```powershell
git status --short
git add assets/css/landing-page.css
git commit -m "fix: align compact desktop hero artwork"
```

Expected: one CSS file committed; no temporary test or server file included.
