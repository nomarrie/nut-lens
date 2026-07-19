import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const index = readFileSync(resolve(projectRoot, 'index.html'), 'utf8');
const globalCss = readFileSync(
  resolve(projectRoot, 'assets/css/global.css'),
  'utf8',
);
const failures = [];
const mobileModulePath = resolve(projectRoot, 'assets/js/mobile-navigation.mjs');
const mobileModule = existsSync(mobileModulePath)
  ? await import(`${pathToFileURL(mobileModulePath).href}?verification=${Date.now()}`)
  : null;

function check(name, predicate) {
  try {
    assert.ok(predicate(), name);
    console.log(`PASS ${name}`);
  } catch {
    failures.push(name);
    console.error(`FAIL ${name}`);
  }
}

function createClassList() {
  const values = new Set();
  return {
    add(...names) {
      names.forEach((name) => values.add(name));
    },
    remove(...names) {
      names.forEach((name) => values.delete(name));
    },
    contains(name) {
      return values.has(name);
    },
  };
}

function createTarget(documentRef) {
  const listeners = new Map();
  const attributes = new Map();

  return {
    classList: createClassList(),
    inert: false,
    isConnected: true,
    addEventListener(type, listener) {
      const collection = listeners.get(type) ?? new Set();
      collection.add(listener);
      listeners.set(type, collection);
    },
    removeEventListener(type, listener) {
      listeners.get(type)?.delete(listener);
    },
    dispatch(type, event = {}) {
      const dispatched = { target: this, shiftKey: false, ...event };
      listeners.get(type)?.forEach((listener) => listener(dispatched));
    },
    listenerCount(type) {
      return listeners.get(type)?.size ?? 0;
    },
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
    getAttribute(name) {
      return attributes.get(name);
    },
    focus() {
      documentRef.activeElement = this;
    },
    closest() {
      return null;
    },
  };
}

function createMediaTarget() {
  const listeners = new Set();
  return {
    matches: false,
    addEventListener(type, listener) {
      if (type === 'change') listeners.add(listener);
    },
    removeEventListener(type, listener) {
      if (type === 'change') listeners.delete(listener);
    },
    dispatchChange(matches) {
      this.matches = matches;
      listeners.forEach((listener) => listener({ matches }));
    },
  };
}

function createMobileNavigationHarness() {
  const documentRef = { activeElement: null };
  const body = createTarget(documentRef);
  documentRef.body = body;
  const navbar = createTarget(documentRef);
  const openButton = createTarget(documentRef);
  const mobileRoot = createTarget(documentRef);
  const drawer = createTarget(documentRef);
  const closeButton = createTarget(documentRef);
  const overlay = createTarget(documentRef);
  const submenuTrigger = createTarget(documentRef);
  const submenuShell = createTarget(documentRef);
  const logoutButton = createTarget(documentRef);
  const accountLink = createTarget(documentRef);
  const articleLink = createTarget(documentRef);
  const links = [accountLink, articleLink];
  const lastFocusable = logoutButton;
  const media = createMediaTarget();

  navbar.querySelector = (selector) => ({
    '.mobile-nav__open': openButton,
    '.mobile-nav': mobileRoot,
    '.mobile-nav__drawer': drawer,
    '.mobile-nav__close': closeButton,
    '.mobile-nav__overlay': overlay,
    '.mobile-nav__submenu-trigger': submenuTrigger,
    '.mobile-nav__submenu-shell': submenuShell,
    '.mobile-nav__logout': logoutButton,
  })[selector] ?? null;
  drawer.querySelectorAll = (selector) => selector === 'a[href]'
    ? links
    : [closeButton, accountLink, submenuTrigger, lastFocusable];

  openButton.setAttribute('aria-expanded', 'false');
  mobileRoot.setAttribute('aria-hidden', 'true');
  submenuTrigger.setAttribute('aria-expanded', 'false');
  submenuShell.setAttribute('aria-hidden', 'true');

  return {
    navbar,
    openButton,
    mobileRoot,
    drawer,
    closeButton,
    overlay,
    submenuTrigger,
    submenuShell,
    logoutButton,
    links,
    lastFocusable,
    body,
    documentRef,
    media,
    environment: {
      document: documentRef,
      matchMedia: () => media,
    },
  };
}

check('homepage loads the mobile navigation module', () =>
  /<script\b[^>]*type="module"[^>]*src="assets\/js\/mobile-navigation\.mjs"/i.test(index),
);

check('existing navbar exposes one responsive mobile drawer', () =>
  /<nav\b(?=[^>]*class="nutlens-navbar")(?=[^>]*data-mobile-navigation)[^>]*>/i.test(index)
  && /<button\b(?=[^>]*class="mobile-nav__open")(?=[^>]*aria-expanded="false")(?=[^>]*aria-controls="mobile-navigation")[^>]*>/i.test(index)
  && /<div\b(?=[^>]*id="mobile-navigation")(?=[^>]*class="mobile-nav")(?=[^>]*aria-hidden="true")[^>]*>/i.test(index)
  && /<aside\b(?=[^>]*class="mobile-nav__drawer")(?=[^>]*role="dialog")(?=[^>]*aria-modal="true")[^>]*>/i.test(index),
);

check('drawer separates account navigation and logout', () =>
  index.includes('Denny Pramana')
  && index.includes('assets/images/testimonial/Bang Raka.webp')
  && /class="mobile-nav__account"\s+href="assets\/pages\/profil\.html"/i.test(index)
  && /<nav\b[^>]*aria-label="Navigasi mobile"/i.test(index)
  && /class="mobile-nav__footer"[\s\S]*?class="mobile-nav__logout"/i.test(index),
);

check('mobile services use approved labels and project URLs', () => {
  const mappings = [
    ['assets/pages/cek-makanan.html', 'Analisis Gizi'],
    ['assets/pages/resep-galeri.html', 'Resep Sehat'],
    ['assets/pages/buat-resep.html', 'Perencanaan Nutrisi'],
    ['assets/pages/challenge-sehat.html', 'Challenge Sehat'],
  ];

  return /<button\b(?=[^>]*class="mobile-nav__submenu-trigger")(?=[^>]*aria-expanded="false")(?=[^>]*aria-controls="mobile-services-menu")[^>]*>/i.test(index)
    && mappings.every(([href, label]) =>
      new RegExp(`<a\\s+href="${href.replaceAll('.', '\\.')}"[^>]*>\\s*${label}\\s*</a\\s*>`, 'i')
        .test(index),
    );
});

check('mobile drawer uses safe viewport sizing and approved transitions', () =>
  /\.mobile-nav\s*\{[\s\S]*?position:\s*fixed[\s\S]*?z-index:\s*var\(--z-index-mobile-nav\)[\s\S]*?inset:\s*0/.test(globalCss)
  && /\.mobile-nav__drawer\s*\{[\s\S]*?width:\s*min\(88vw,\s*22\.5rem\)[\s\S]*?height:\s*100vh[\s\S]*?height:\s*100dvh[\s\S]*?transform:\s*translateX\(100%\)/.test(globalCss)
  && /transform\s+320ms\s+cubic-bezier\(0\.22,\s*1,\s*0\.36,\s*1\)/.test(globalCss)
  && /opacity\s+260ms\s+ease/.test(globalCss),
);

check('mobile layout hides desktop controls only at the existing breakpoint', () =>
  /@media\s*\(max-width:\s*48rem\)[\s\S]*?\.navbar__menu,[\s\S]*?\.navbar__profile\s*\{[\s\S]*?display:\s*none/.test(globalCss)
  && /@media\s*\(max-width:\s*48rem\)[\s\S]*?\.mobile-nav__open\s*\{[\s\S]*?display:\s*inline-flex/.test(globalCss)
  && /\.mobile-nav__open,[\s\S]*?\.mobile-nav\s*\{[\s\S]*?display:\s*none/.test(globalCss),
);

check('drawer supports scrolling focus and reduced motion', () =>
  /body\.is-mobile-nav-open\s*\{[^}]*overflow:\s*hidden/.test(globalCss)
  && /\.mobile-nav__body\s*\{[^}]*flex:\s*1[^}]*min-height:\s*0[^}]*overflow-y:\s*auto/s.test(globalCss)
  && /\.mobile-nav__footer\s*\{[^}]*flex-shrink:\s*0[^}]*margin-top:\s*auto/s.test(globalCss)
  && /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.mobile-nav__drawer[\s\S]*?transition-duration:\s*1ms/.test(globalCss),
);

check('drawer synchronizes ARIA scroll lock focus and close controls', () => {
  if (typeof mobileModule?.initMobileNavigation !== 'function') return false;
  const harness = createMobileNavigationHarness();
  const destroy = mobileModule.initMobileNavigation(
    harness.navbar,
    harness.environment,
  );

  harness.openButton.dispatch('click');
  const opened = harness.openButton.getAttribute('aria-expanded') === 'true'
    && harness.mobileRoot.getAttribute('aria-hidden') === 'false'
    && harness.mobileRoot.classList.contains('is-open')
    && harness.drawer.inert === false
    && harness.body.classList.contains('is-mobile-nav-open')
    && harness.documentRef.activeElement === harness.closeButton;

  harness.overlay.dispatch('click');
  const overlayClosed = harness.openButton.getAttribute('aria-expanded') === 'false'
    && harness.mobileRoot.getAttribute('aria-hidden') === 'true'
    && harness.drawer.inert === true
    && !harness.body.classList.contains('is-mobile-nav-open')
    && harness.documentRef.activeElement === harness.openButton;

  harness.openButton.dispatch('click');
  harness.mobileRoot.dispatch('keydown', {
    key: 'Escape',
    preventDefault() {},
  });
  const escapeClosed = harness.openButton.getAttribute('aria-expanded') === 'false';
  destroy();
  return opened && overlayClosed && escapeClosed;
});

check('services toggle is independent and links close the drawer', () => {
  if (typeof mobileModule?.initMobileNavigation !== 'function') return false;
  const harness = createMobileNavigationHarness();
  const destroy = mobileModule.initMobileNavigation(
    harness.navbar,
    harness.environment,
  );

  harness.openButton.dispatch('click');
  harness.submenuTrigger.dispatch('click');
  const submenuOpened = harness.submenuTrigger.getAttribute('aria-expanded') === 'true'
    && harness.submenuShell.getAttribute('aria-hidden') === 'false'
    && harness.submenuShell.inert === false
    && harness.openButton.getAttribute('aria-expanded') === 'true';
  harness.links[0].dispatch('click');
  const drawerClosed = harness.openButton.getAttribute('aria-expanded') === 'false';
  destroy();
  return submenuOpened && drawerClosed;
});

check('focus wraps and desktop reset removes all modal state', () => {
  if (typeof mobileModule?.initMobileNavigation !== 'function') return false;
  const harness = createMobileNavigationHarness();
  const destroy = mobileModule.initMobileNavigation(
    harness.navbar,
    harness.environment,
  );

  harness.openButton.dispatch('click');
  harness.lastFocusable.focus();
  let preventedForward = false;
  harness.mobileRoot.dispatch('keydown', {
    key: 'Tab',
    shiftKey: false,
    preventDefault() {
      preventedForward = true;
    },
  });
  const wrappedForward = preventedForward
    && harness.documentRef.activeElement === harness.closeButton;

  harness.closeButton.focus();
  let preventedBackward = false;
  harness.mobileRoot.dispatch('keydown', {
    key: 'Tab',
    shiftKey: true,
    preventDefault() {
      preventedBackward = true;
    },
  });
  const wrappedBackward = preventedBackward
    && harness.documentRef.activeElement === harness.lastFocusable;

  harness.media.dispatchChange(true);
  const reset = harness.openButton.getAttribute('aria-expanded') === 'false'
    && !harness.body.classList.contains('is-mobile-nav-open')
    && harness.submenuTrigger.getAttribute('aria-expanded') === 'false';
  destroy();
  return wrappedForward && wrappedBackward && reset
    && harness.mobileRoot.listenerCount('keydown') === 0;
});

if (failures.length) {
  console.error(`\n${failures.length} mobile navigation check(s) failed.`);
  process.exitCode = 1;
} else {
  console.log('\nAll mobile navigation checks passed.');
}
