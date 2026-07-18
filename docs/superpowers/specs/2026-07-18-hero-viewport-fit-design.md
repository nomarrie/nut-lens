# NutLens Hero Viewport-Fit Design

## Context

NutLens uses a 1440 by 900 desktop viewport as its approved hero baseline.
The current landing-page CSS already enlarges the hero for tall intermediate
desktops and increases the full landing-page scale at 1600px, 1920px, and
2240px viewport widths.

Those rules still treat width as the main signal. Two browsers can expose the
same width but substantially different usable heights because of operating
system scaling, browser chrome, browser zoom, and window size. A wide but
short viewport can therefore receive an oversized artwork composition, while
a taller viewport can leave excessive unused space.

The CSS viewport, measured by `window.innerWidth` and `window.innerHeight`, is
the responsive contract. Physical display resolution and screenshot pixel
dimensions are not layout inputs.

## Goal

Keep the complete desktop hero visible within one viewport while preserving
the approved 1440 by 900 composition and allowing the hero to use additional
space on taller displays.

"Complete hero" means the navbar, rating, recommendation, heading,
description, CTA row, five artwork images, and ghost cards are visible without
vertical or horizontal page scrolling at the desktop verification viewports.

## Scope

- Modify only hero-related rules in `assets/css/landing-page.css`.
- Do not change HTML, copy, image sources, JavaScript, navbar styling, or any
  section after the hero.
- Preserve all existing image aspect ratios, `object-fit`, object positions,
  ghost-card proportions, and five-column ordering.
- Preserve the current tablet and mobile layouts.
- Do not use `zoom`, wrapper `transform: scale()`, negative page offsets, or a
  root font-size change.

## Chosen Approach

Combine viewport modes with a Grid-based remaining-space layout.

### Viewport modes

The desktop hero has three vertical modes:

1. **Compact desktop**: wide enough for the five-column artwork but short in
   the block axis. Typography remains readable, vertical gaps contract within
   token-based bounds, and artwork stays near the 1280px baseline ceiling.
2. **Baseline desktop**: preserves the approved 1440 by 900 composition.
3. **Expanded desktop**: activates only when both width and height provide
   enough space. Existing 1600px-and-up enlargement must no longer activate
   from width alone.

Breakpoints are selected from content fit rather than laptop model names.
Exact thresholds are implementation constants covered by verifier assertions.
The initial target bands are:

| Mode | Minimum width | Height condition |
| --- | ---: | ---: |
| Compact | 64rem | below 52rem |
| Baseline | existing desktop rules | 52rem through below 60rem |
| Expanded | 80rem | at least 60rem |

The compact mode is a progressive desktop override. Narrow tablet and mobile
rules remain authoritative below their existing width breakpoints.

### Grid-based vertical allocation

On desktop, the hero becomes a two-row Grid:

- row one uses the content's intrinsic height;
- row two receives the remaining available hero height with
  `minmax(0, 1fr)`.

The hero's block size is derived from `100dvh` after subtracting the navbar
height and the existing navbar/hero outer spacing. The artwork remains in
normal document flow and is aligned within the second row. The artwork is
never absolutely positioned as a whole.

The artwork grid continues to determine horizontal composition. Mode-local
track widths, gaps, and vertical offsets make the artwork fit the available
row. The center image remains dominant and all frames keep their approved
aspect ratios.

If an environment falls outside the supported desktop minimums, normal page
flow remains the safe fallback instead of hiding content.

## Typography and Controls

- The 1440 by 900 title remains 48px.
- Compact mode may reduce only toward the existing desktop-safe minimum; it
  may not reduce body copy below 16px or CTA labels below their current
  baseline.
- Expanded mode may grow toward the existing large-screen ceilings.
- Fluid values use `clamp()` with `rem` bounds and a viewport- or
  container-relative preferred value.
- Text line lengths retain the existing `ch` limits.
- CTA buttons continue to wrap safely and preserve their minimum interactive
  height.

## Artwork Behavior

- The five-column order remains outer, side, center, side, outer.
- Grid tracks use `minmax(0, ...)` so they can shrink without horizontal
  overflow.
- Compact mode caps the artwork near the 1280px baseline even if the viewport
  is 1600px or wider.
- Expanded artwork sizing is gated by both viewport width and height.
- The main frame keeps `aspect-ratio: 34 / 15`.
- Side and outer frames keep `aspect-ratio: 21 / 34`.
- Ghost cards keep their existing 21 / 22 and 1 / 1 proportions.
- Images continue using `width: 100%`, `height: 100%`, and
  `object-fit: cover` inside their frames.

## Large-Screen Rule Correction

The existing `@media (min-width: 100rem)` and
`@media (min-width: 120rem)` hero artwork overrides must gain compatible
height conditions or be superseded by height-aware hero-specific rules.

Large-screen rules for sections after the hero remain unchanged. The change
must not reduce or disable their existing container and typography scaling.

## Accessibility and Compatibility

- Preserve semantic HTML, accessible image alternatives, focus indicators,
  and CTA names.
- Preserve text zoom behavior; no page-level scaling is allowed.
- Preserve reduced-motion behavior because this feature adds no animation.
- Use broadly supported CSS Grid, `clamp()`, media queries, `aspect-ratio`, and
  dynamic viewport units already present in the project.
- Keep safe baseline declarations outside conditional enhancements.

## Verification Strategy

### Automated verifier

Add failing checks before production CSS changes. The checks must prove that:

- compact desktop rules consider both minimum width and maximum height;
- expanded rules consider both minimum width and minimum height;
- the 1600px and 1920px hero enlargement is not width-only;
- the hero uses a two-row Grid with an intrinsic content row and a flexible
  artwork row;
- the hero block size is derived from `100dvh` and navbar/outer spacing;
- no `zoom` or wrapper scaling is introduced;
- existing aspect ratios and image crop rules remain intact;
- CSS braces and all existing site contracts still pass.

### Viewport matrix

Verify using CSS viewport dimensions, not physical display resolution:

| Viewport | Expected result |
| --- | --- |
| 1366 by 768 | Complete compact hero visible without page scroll |
| 1440 by 900 | Approved baseline remains visually equivalent |
| 1512 by 982 | Expanded composition uses the taller viewport |
| 1600 by 900 | Complete hero visible; no width-only oversizing |
| 1600 by 1000 | Composition grows without excessive bottom void |
| 1920 by 1080 | Expanded hero fills the viewport proportionally |
| 1024 by 768 | Existing tablet layout remains usable |
| 768 by 1024 | Existing tablet layout remains usable |
| 390 by 844 | Existing mobile layout remains usable |

For every viewport, verify:

- `document.documentElement.scrollWidth <= window.innerWidth`;
- the desktop hero's bottom does not exceed the initial viewport;
- no text, CTA, artwork frame, or ghost card is clipped;
- navigation, Solution tabs, Testimonial controls, and FAQ interactions retain
  their existing behavior.

## Acceptance Criteria

- The complete desktop hero is visible in one viewport at 1366 by 768,
  1440 by 900, 1512 by 982, 1600 by 900, 1600 by 1000, and 1920 by 1080.
- The 1440 by 900 baseline has no meaningful visual change.
- Wide-but-short desktops no longer inherit oversized artwork solely from
  their width.
- Tall desktops no longer display excessive unused space below the artwork.
- Typography and controls stay within accessible minimum and approved maximum
  bounds.
- No horizontal scrollbar is introduced.
- Tablet/mobile layouts and every JavaScript interaction remain unchanged.

