# NutLens Mobile Navigation Design

## Scope

Implement an accessible off-canvas navigation drawer inside the existing NutLens navbar. The desktop menu, centered logo, desktop profile trigger, and desktop profile dropdown remain unchanged. Hero and all landing-page sections stay outside this work.

## Responsive contract

- Desktop (`min-width: 48.0625rem`): retain the current three-column navbar. Hide the hamburger and keep the mobile drawer closed and non-interactive.
- Mobile (`max-width: 48rem`): hide `.navbar__menu` and `.navbar__profile`, keep the NutLens logo visible, and display a 44px minimum hamburger button on the right.
- Use the existing `48rem` project breakpoint. A media-query change back to desktop closes the drawer, removes body scroll lock, resets its ARIA state, and closes the services accordion without moving focus to the now-hidden hamburger.

## Markup

The existing `.nutlens-navbar` remains the only top-level navbar. Add the following responsive elements inside it:

1. A `.mobile-nav__open` button in `.navbar__container`.
2. A `.mobile-nav` fixed layer containing an overlay and an `aside` dialog.
3. Drawer header with the existing NutLens brand treatment and a close button.
4. Scrollable body containing separate Akun and Navigasi sections.
5. Fixed-flow footer containing a standalone Logout button.

The account card uses the existing identity:

- Name: Denny Pramana
- Avatar: `assets/images/testimonial/Bang Raka.webp`
- Profile URL: `assets/pages/profil.html`

The mobile services labels and URLs are:

- Analisis Gizi: `assets/pages/cek-makanan.html`
- Resep Sehat: `assets/pages/resep-galeri.html`
- Perencanaan Nutrisi: `assets/pages/buat-resep.html`
- Challenge Sehat: `assets/pages/challenge-sehat.html`

No navigation data is generated or duplicated through JavaScript. The mobile links are semantic HTML so they remain discoverable without script-generated markup.

## Presentation

Shared navbar and drawer styles belong in `assets/css/global.css`.

- Drawer layer: fixed to the viewport with a z-index above the current navbar token.
- Drawer width: `min(88vw, 22.5rem)`.
- Height: `100vh` fallback followed by `100dvh`.
- Drawer layout: vertical flex; header and footer do not shrink; body uses `flex: 1`, `min-height: 0`, and vertical scrolling.
- Open animation: horizontal transform only, using the approved 320ms easing.
- Overlay: opacity transition using the approved 260ms duration.
- Services submenu: a grid-row expansion wrapper so the transition does not require inline styles or a fixed content height.
- Focus indicators reuse the existing navbar focus treatment.
- Reduced-motion media query shortens drawer, overlay, submenu, and chevron transitions to 1ms.
- `body.is-mobile-nav-open` prevents background scrolling.

The drawer is hidden and non-interactive by default. Its mobile media query only changes the navbar visibility/layout needed for the hamburger; it does not alter desktop selectors.

## Interaction state

Create `assets/js/mobile-navigation.mjs` with an exported initializer so behavior can be tested without a browser framework.

The initializer owns two independent states:

- Drawer open/closed.
- Services accordion expanded/collapsed.

Opening the drawer:

1. Store the previously focused element.
2. Add `.is-open` to the mobile navigation root.
3. Set hamburger `aria-expanded="true"` and drawer root `aria-hidden="false"`.
4. Remove `inert` from the drawer dialog.
5. Add `body.is-mobile-nav-open`.
6. Move focus to the close button.

Closing the drawer:

1. Remove `.is-open`.
2. Restore `aria-expanded="false"` and `aria-hidden="true"`.
3. Restore `inert` after the close state is committed.
4. Remove the body scroll-lock class.
5. Close the services accordion.
6. Restore focus to the hamburger for user-initiated closes, but not for a desktop breakpoint reset.

The drawer closes from its close button, overlay, Escape, account link, main navigation links, submenu links, and Logout button. Logout performs no authentication mutation because authentication is not implemented; it only closes the drawer, matching the existing desktop behavior.

## Keyboard and accessibility

- Hamburger and close controls are native buttons with accessible labels.
- The drawer uses `role="dialog"`, `aria-modal="true"`, and an accessible title.
- The services trigger is a native button with synchronized `aria-expanded` and `aria-controls`.
- The services content is initially collapsed and inert.
- Escape closes the drawer and restores focus.
- While open, Tab and Shift+Tab cycle through visible, enabled buttons, links, and non-negative tabindex elements inside the drawer.
- The overlay blocks pointer interaction with the page behind the drawer.
- The modal semantics and focus trap prevent keyboard navigation into background content.
- All decorative Material Symbols use `aria-hidden="true"`.

## Files

- Modify `index.html` for the hamburger, drawer markup, and module import.
- Modify `assets/css/global.css` for shared mobile-navigation presentation and responsive visibility.
- Add `assets/js/mobile-navigation.mjs` for state, focus, scroll lock, and responsive reset.
- Add `tests/mobile-navigation.test.mjs` for the behavioral contract.

No landing-page section stylesheet or section JavaScript is changed.

## Verification

The regression test must demonstrate a red-green cycle and cover:

- correct initial closed state;
- open and close state synchronization;
- account/navigation/submenu link closing;
- overlay, close button, Escape, and Logout closing;
- services accordion state without closing the drawer;
- Tab and Shift+Tab focus wrapping;
- body scroll lock and cleanup;
- desktop media-query reset;
- listener cleanup;
- semantic markup, correct URLs, breakpoint rules, touch target, and reduced-motion CSS.

After implementation, run JavaScript syntax checks, the dedicated mobile-navigation test, existing profile-dropdown tests, the site verifier for comparison with its known baseline, and `git diff --check`.
