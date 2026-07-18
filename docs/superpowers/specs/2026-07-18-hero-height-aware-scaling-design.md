# NutLens Hero Height-Aware Scaling Design

## Context

The existing large-screen work scales the landing page at viewport widths of
1600px, 1920px, and 2240px. A MacBook-class display can expose a logical
viewport close to 1512 by 982 pixels: it remains below the 1600px width
breakpoint while being substantially taller than the 1440 by 900 baseline.

The hero currently reserves the available viewport height with `min-height`,
but its children keep their baseline dimensions. The unused height therefore
appears as empty space below the artwork. This is a breakpoint mismatch, not a
container-centering or image-cropping defect.

## Goal

Make the hero use tall desktop viewports more fully while preserving the
approved 1440 by 900 composition, the existing 1600px-and-up scaling system,
and all tablet/mobile layouts.

## Scope

- Change only hero layout rules in `assets/css/landing-page.css`.
- Do not change hero HTML, content, image sources, JavaScript, navbar, or other
  sections.
- Keep the current responsive container tokens and image aspect ratios.
- Keep the hero in normal document flow.

## Responsive Strategy

Add a height-aware desktop range for viewports that are:

- at least 1280px wide;
- at least 960px tall; and
- still below the existing 1600px large-screen breakpoint.

Within this range, reuse the visual ceiling already approved for the 1600px
layout instead of creating an unrelated scale tier. Use local hero custom
properties and `clamp()` so the transition between the 1440 baseline and the
1600 ceiling remains bounded.

The interpolation targets are:

| Property | Baseline | Tall-desktop ceiling |
| --- | ---: | ---: |
| Hero container | 1280px | 1440px |
| Display heading | 48px | 54px |
| Rating | 18px | 20px |
| Recommendation | 14px | 15px |
| Description | 16px | 17px |
| CTA minimum height | 56px | 60px |
| CTA label | 20px | 22px |
| Outer/side artwork tracks | 168px | 192px |
| Artwork gap | 16px | 20px |

Spacing adjustments use the same bounded interpolation and may not exceed one
existing spacing-token step beyond their baseline values.

The 1440 by 900 viewport does not match the height condition and therefore
keeps its current rendering unchanged. At 1600px and wider, the existing
large-screen media queries remain authoritative.

## Hero Adjustments

### Container

Allow only the hero container to grow toward the existing 1440px wide
container token when the height-aware range is active. Continue using
responsive width, centered auto margins, and normal page gutters. Do not use
fixed horizontal margins or full-page scaling.

### Typography and controls

Increase the hero display heading toward the existing 54px large-screen size.
Allow rating, recommendation, description, and CTA dimensions to grow only
within small capped ranges. Paragraph line length remains constrained by the
existing `ch` maximums.

### Artwork

Grow the five-column artwork using bounded track widths and gaps. Preserve:

- five-column order and relative dominance of the center image;
- outer, side, and center image aspect ratios;
- ghost-card proportions and directions;
- `object-fit: cover` and current object positions;
- centered composition without horizontal overflow.

The artwork grows through its real grid and frame dimensions. No `zoom` or
`transform: scale()` is permitted.

### Vertical rhythm

Use bounded hero-local spacing values so the heading, description, CTA, and
artwork grow as one composition. Do not solve the problem by moving all spare
height into one large gap or by pushing only the artwork to the viewport
bottom.

## Accessibility and Compatibility

- Preserve the existing semantic HTML and accessible names.
- Preserve keyboard focus styles and CTA wrapping.
- Do not modify reduced-motion behavior because this change adds no motion.
- Use established, broadly supported CSS features (`clamp()`, media queries,
  Grid, and dynamic viewport units only where already supported by the current
  hero contract).

## Verification

Automated checks must confirm that:

- the height-aware rule exists only in landing-page CSS;
- the 1440 by 900 baseline remains outside the new rule;
- the new rule is bounded below the 1600px breakpoint;
- the hero uses real dimensions rather than `zoom` or wrapper scaling;
- artwork aspect ratios and `object-fit` remain unchanged;
- shared site verification still passes.

Browser verification must cover:

- 1440 by 900: no meaningful visual regression;
- 1512 by 982: larger composition and substantially reduced bottom void;
- 1600 by 1000: smooth handoff to the existing large-screen rules;
- 1920 by 1080: existing large-screen composition remains intact;
- 1024 by 768, 768 by 1024, and 390 by 844: no tablet/mobile regression;
- every tested viewport: no horizontal scrollbar.

## Acceptance Criteria

- The hero fills a tall MacBook-class viewport more convincingly.
- The bottom of the artwork sits close to the viewport fold without accidental
  vertical clipping.
- The 1440 by 900 composition remains visually equivalent to the approved
  baseline.
- Typography, controls, spacing, and artwork grow proportionally and remain
  capped.
- Other landing-page sections and all JavaScript interactions are unchanged.
- Automated and browser verification pass.
