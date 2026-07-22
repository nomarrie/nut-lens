# Landing Page CTA Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every primary landing-page CTA a consistent lift, shadow, press, and smooth pointer-leave response while preserving the two Hero-specific content animations.

**Architecture:** Extend the existing shared `.hero__cta` contract in `assets/css/landing-page.css`; all approved sections already reuse that class, so no additional HTML or JavaScript is needed. A static CSS contract test will verify input gating, reduced-motion safety, shared coverage, and exclusion of unrelated controls.

**Tech Stack:** Semantic HTML, custom CSS, Node.js static contract tests.

## Global Constraints

- Apply shared motion only to `.hero__cta` links in Hero, How It Works, About Us, and Final CTA.
- Preserve the Hero text-swap and centered-icon animations.
- Do not target navbar controls, mobile navigation, FAQ triggers, testimonial navigation, profile controls, logout, or footer links.
- Restrict hover movement to `(hover: hover) and (pointer: fine)`.
- Disable transform motion for `prefers-reduced-motion: reduce`.
- Do not change CTA dimensions, content, destinations, focus-visible outlines, or keyboard behavior.
- Animate only `transform`, `opacity`, `filter`, and `box-shadow`.

---

### Task 1: Shared Landing-Page CTA Motion

**Files:**
- Create: `tests/landing-page-cta-motion.test.mjs`
- Modify: `assets/css/landing-page.css:357-445`

**Interfaces:**
- Consumes: Existing `.hero__cta`, `.hero__cta--text-swap`, and `.hero__cta--icon-focus` selectors.
- Produces: Shared `.hero__cta` hover, pointer-leave, and active-state motion with no JavaScript API.

- [ ] **Step 1: Write the failing CSS contract test**

Create `tests/landing-page-cta-motion.test.mjs` with checks that:

```js
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const index = readFileSync(resolve(root, 'index.html'), 'utf8');
const css = readFileSync(resolve(root, 'assets/css/landing-page.css'), 'utf8');

const ctaCount = index.match(/class=["'][^"']*\bhero__cta\b[^"']*["']/g)?.length ?? 0;
assert.equal(ctaCount, 6, 'all six approved landing-page CTAs share .hero__cta');

const motion = css.match(
  /@media\s*\(prefers-reduced-motion:\s*no-preference\)\s*\{([\s\S]*?)\n\}/,
)?.[1] ?? '';
assert.match(
  motion,
  /\.hero__cta\s*\{[^}]*transition:[^}]*transform\s+260ms\s+cubic-bezier\(0\.22,\s*1,\s*0\.36,\s*1\)[^}]*box-shadow\s+260ms\s+cubic-bezier\(0\.22,\s*1,\s*0\.36,\s*1\)/s,
);
assert.match(motion, /\.hero__cta:active\s*\{[^}]*scale\(0\.97\)/s);

const hover = css.match(
  /@media\s*\(hover:\s*hover\)\s*and\s*\(pointer:\s*fine\)\s*and\s*\(prefers-reduced-motion:\s*no-preference\)\s*\{([\s\S]*?)\n\}/,
)?.[1] ?? '';
assert.match(hover, /\.hero__cta:hover\s*\{[^}]*translateY\(-2px\)[^}]*box-shadow:/s);
assert.doesNotMatch(hover, /\.faq__trigger:hover|\.testimonial__navigation-button:hover/);

console.log('All landing-page CTA motion checks passed.');
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```powershell
node tests/landing-page-cta-motion.test.mjs
```

Expected: FAIL because `.hero__cta` does not yet own the shared transition, active state, or hover lift.

- [ ] **Step 3: Implement the minimal shared motion**

Inside the existing `@media (prefers-reduced-motion: no-preference)` block, replace the modifier-only transform transition and active rule with:

```css
.hero__cta {
  transition:
    transform 260ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 260ms cubic-bezier(0.22, 1, 0.36, 1);
}

.hero__cta:active {
  transform: scale(0.97);
}
```

At the start of the existing precise-pointer hover media block, add:

```css
.hero__cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgb(29 38 11 / 0.16);
}

.hero__cta:active {
  transform: translateY(0) scale(0.97);
}
```

The base transition is intentionally the pointer-leave path; its smooth curve returns both transform and shadow without keyframes.

- [ ] **Step 4: Run focused and regression verification**

Run:

```powershell
node tests/landing-page-cta-motion.test.mjs
node tests/hero-button-animation.test.mjs
node tests/hero-intro.test.mjs
node --check tests/landing-page-cta-motion.test.mjs
git diff --check
```

Expected: all tests pass; syntax and whitespace checks return exit code `0`.

- [ ] **Step 5: Review the final diff**

Run:

```powershell
git diff -- assets/css/landing-page.css tests/landing-page-cta-motion.test.mjs
```

Confirm that no HTML, JavaScript, FAQ, testimonial navigation, navbar, mobile navigation, footer link, size, or layout rule was changed by this task.

- [ ] **Step 6: Commit only the implementation files**

```powershell
git add -f -- tests/landing-page-cta-motion.test.mjs
git add -- assets/css/landing-page.css
git commit -m "feat: animate landing page CTAs"
```
