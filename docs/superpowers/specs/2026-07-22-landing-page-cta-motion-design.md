# Landing Page CTA Motion Design

## Goal

Apply one restrained interaction pattern to the landing page's primary call-to-action links without changing their content, destination, dimensions, or layout. Preserve the richer text-swap and icon-focus animation already used by the two Hero CTAs.

## Scope

The shared motion applies only to CTA links using `.hero__cta` in these landing-page sections:

- Hero
- How It Works
- About Us
- Final CTA

It does not apply to navbar controls, mobile navigation, FAQ triggers, testimonial navigation, profile controls, logout, or footer links.

## Interaction

- On a precise hover pointer, the CTA rises by `2px` and gains a restrained shadow.
- On pointer leave, transform and shadow return smoothly to their default state.
- While pressed, the CTA scales to `0.97` to provide immediate feedback.
- The existing Hero label-swap and centered-icon animations continue unchanged and run alongside the shared CTA movement.
- Only `transform`, `opacity`, `filter`, and `box-shadow` may transition; no layout-affecting property is animated.

## Accessibility and Input Safety

- Hover movement is restricted to `(hover: hover) and (pointer: fine)`.
- Transform motion is disabled when `prefers-reduced-motion: reduce` is active.
- Existing focus-visible outlines remain unchanged.
- CTA names, markup semantics, destinations, and keyboard behavior remain unchanged.

## Implementation Boundary

Keep the shared CTA motion in `assets/css/landing-page.css`. Reuse `.hero__cta` rather than adding animation classes to every CTA. Do not change JavaScript or unrelated components.

## Verification

- Add a CSS contract test before implementation and confirm it fails for the missing shared motion.
- Confirm all intended CTA links are covered by `.hero__cta`.
- Confirm excluded controls are not targeted.
- Run the Hero button and Hero intro regression checks.
- Run syntax and whitespace checks.
