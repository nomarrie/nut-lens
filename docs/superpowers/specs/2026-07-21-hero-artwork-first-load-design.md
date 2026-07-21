# Hero Artwork First-Load Animation Design

## Objective

Add a one-time-per-browser-session staggered masonry reveal to the five NutLens Hero artwork cards and their decorative ghost cards. The animation must not change the Hero layout, final positions, image crops, responsive behavior, text, CTA controls, or any other section.

## Existing Constraints

- The five artwork cards are arranged by `.hero__artwork` in the existing five-column grid.
- Each `.hero__image-frame` controls its size and vertical placement.
- Compact desktop rules modify `--hero-artwork-y` and apply transforms to the frames.
- Ghost cards are pseudo-elements on outer and side frames.
- The complete artwork grid is hidden at the project mobile breakpoint, `max-width: 48rem`.
- Existing compact desktop rules hide ghost cards with `content: none`.

These rules remain authoritative and must not be rewritten by the entrance animation.

## Markup Architecture

Each of the five existing frames receives one minimum inner wrapper:

```html
<div class="hero__image-frame hero__image--main">
  <div class="hero__image-motion">
    <img class="hero__image" ... />
  </div>
</div>
```

Frame classes and modifiers remain on `.hero__image-frame`. Image attributes, source order, accessible text, dimensions, and loading priority remain unchanged.

`.hero__image-motion` fills the frame and owns only entrance-animation presentation. This prevents its animation transform from replacing the positioning transform on `.hero__image-frame`.

## Animation States

The document root uses three short-lived states:

- `.hero-intro-pending`: first-session initial state; motion wrappers and ghost cards are hidden.
- `.hero-intro-playing`: transitions artwork and ghost cards toward their existing visible state.
- `.hero-intro-complete`: completion marker; pending and playing are removed.

Without any intro state class, all artwork is immediately visible. Therefore, disabled or unavailable JavaScript cannot leave the Hero hidden.

The root state is initialized before first paint by a minimal inline head script. The script checks the mobile breakpoint, reduced-motion preference, and the session flag before adding `hero-intro-pending`. A fail-safe removes temporary states if the module does not complete initialization.

## Motion Sequence

All movement is vertical and uses only `opacity` and `transform`:

| Group | Distance | Delay | Duration |
| --- | ---: | ---: | ---: |
| Main | 28px | 350ms | 650ms |
| Side left and right | 36px | 520ms | 650ms |
| Outer left and right | 44px | 680ms | 650ms |
| Ghost cards | 12px | 820ms | about 360ms |

Artwork uses `scale(0.98)` initially and finishes at `scale(1)`. The easing is `cubic-bezier(0.22, 1, 0.36, 1)` with no bounce, overshoot, blur, or horizontal movement. Paired left/right cards share the same delay.

The last artwork transition completes at approximately 1.33 seconds. State cleanup runs immediately afterward, around 1.35 seconds. `will-change` exists only while pending or playing.

## Ghost Cards

The existing pseudo-elements remain on the frames. Intro state controls only their opacity and a 12px vertical translation. Their size, gradient, radius, spacing, angle, and position are unchanged.

Compact desktop `content: none` remains authoritative, so animation state cannot restore a hidden ghost card.

## JavaScript Lifecycle

`assets/js/hero-intro.mjs` performs only orchestration:

1. Exit without listeners or animation when the mobile media query matches.
2. Exit without animation when `prefers-reduced-motion: reduce` matches.
3. Read `sessionStorage['nutlens-hero-intro-played']` inside `try...catch`.
4. If the flag already exists, remove temporary intro states and show artwork normally.
5. On the first eligible load, wait for DOM readiness, then move from pending to playing on the next animation frame.
6. Store the session flag when playback begins.
7. After the final transition, apply complete state and remove pending, playing, and temporary performance hints.

If storage is unavailable, initialization fails safely to the normal visible state. No interval, animation loop, style mutation per artwork, or external dependency is used.

## Responsive and Accessibility Behavior

- Mobile: `.hero__artwork { display: none; }` remains unchanged, and JavaScript exits before adding animation work.
- Tablet: animation may run whenever artwork remains displayed.
- Compact desktop: frame offsets remain untouched because animation belongs to the inner wrapper.
- Reduced motion: CSS forces wrappers and ghost cards to their normal visible state with no delay, transition, translation, or scale; JavaScript skips playback.
- DOM and focus order do not change. Artwork remains decorative except for the existing meaningful main image alt text.

## Files

- `index.html`: five inner wrappers, minimal early-state bootstrap, and module include.
- `assets/css/landing-page.css`: wrapper, state, stagger timing, ghost transition, responsive, and reduced-motion rules.
- `assets/js/hero-intro.mjs`: session and lifecycle orchestration.
- `tests/hero-intro.test.mjs`: behavior and contract coverage.
- `tests/verify-site.mjs`: update the existing Hero markup contract to accept the required wrapper.

## Verification

Automated coverage must verify:

- exactly five motion wrappers;
- preserved frame modifier classes and image attributes;
- main, paired side, paired outer, and ghost timing order;
- CSS uses only opacity and transform for entrance motion;
- session flag prevents replay;
- storage failure leaves artwork visible;
- mobile and reduced motion skip playback;
- temporary state cleanup occurs;
- existing site verification remains green.

Browser verification covers 1536 x 738, 1366 x 650, 1920 x 930, and 390 x 844, plus reduced motion, same-session reload, and a new browser session. Final frame geometry and overflow are compared before and after the animation to detect layout shift or positioning regressions.

## Out of Scope

- Navbar, Hero copy, rating, CTA controls, or section layout changes.
- Animation libraries, loading screens, continuous animation, horizontal movement, blur, or bounce.
- Changes to image files, crops, sizes, grid columns, compact offsets, mobile layout, or other sections.
