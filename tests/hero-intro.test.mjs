import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const index = readFileSync(resolve(root, 'index.html'), 'utf8');
const landingCss = readFileSync(
  resolve(root, 'assets/css/landing-page.css'),
  'utf8',
);
const heroIntroPath = resolve(root, 'assets/js/hero-intro.mjs');
const heroIntroExists = existsSync(heroIntroPath);
const heroIntro = heroIntroExists
  ? await import(`${pathToFileURL(heroIntroPath).href}?test=${Date.now()}`)
  : null;
const earlyBootstrap = index.match(
  /<title>[\s\S]*?<script>([\s\S]*?)<\/script>/i,
)?.[1] ?? '';
const failures = [];

function check(name, test) {
  try {
    assert.ok(test(), name);
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

function createListenerTarget() {
  const listeners = new Map();

  return {
    addEventListener(type, listener) {
      const typeListeners = listeners.get(type) ?? new Set();
      typeListeners.add(listener);
      listeners.set(type, typeListeners);
    },
    removeEventListener(type, listener) {
      listeners.get(type)?.delete(listener);
    },
    listenerCount(type) {
      return listeners.get(type)?.size ?? 0;
    },
  };
}

function createHeroIntroHarness({
  mobile = false,
  reducedMotion = false,
  storageThrows = false,
} = {}) {
  const rootElement = { classList: createClassList() };
  const documentEvents = createListenerTarget();
  const artwork = {};
  const documentRef = {
    ...documentEvents,
    documentElement: rootElement,
    readyState: 'complete',
    querySelector(selector) {
      return selector === '.hero__artwork' ? artwork : null;
    },
  };
  const frames = [];
  const timers = [];

  const environment = {
    matchMedia(query) {
      return {
        matches: query === '(max-width: 48rem)'
          ? mobile
          : reducedMotion,
      };
    },
    sessionStorage: {
      getItem() {
        if (storageThrows) throw new Error('storage unavailable');
        return null;
      },
      setItem() {
        if (storageThrows) throw new Error('storage unavailable');
      },
    },
    requestAnimationFrame(callback) {
      frames.push(callback);
      return callback;
    },
    cancelAnimationFrame(callback) {
      const index = frames.indexOf(callback);
      if (index >= 0) frames.splice(index, 1);
    },
    setTimeout(callback) {
      timers.push(callback);
      return callback;
    },
    clearTimeout(callback) {
      const index = timers.indexOf(callback);
      if (index >= 0) timers.splice(index, 1);
    },
  };

  return {
    root: rootElement,
    documentRef,
    environment,
    frameCount: () => frames.length,
    listenerCount: (type) => documentEvents.listenerCount(type),
    runFrame() {
      frames.shift()?.();
    },
    runTimers() {
      const callbacks = timers.splice(0);
      callbacks.forEach((callback) => callback());
    },
  };
}

function createEarlyBootstrapHarness() {
  const rootElement = { classList: createClassList() };
  const listeners = new Map();
  const timers = [];
  const documentRef = {
    documentElement: rootElement,
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
  };
  const environment = {
    matchMedia() {
      return { matches: false };
    },
    sessionStorage: {
      getItem() {
        return null;
      },
    },
    setTimeout(callback) {
      timers.push(callback);
      return callback;
    },
  };

  Function('document', 'window', earlyBootstrap)(
    documentRef,
    environment,
  );

  return {
    root: rootElement,
    listenerCount: (type) => Number(listeners.has(type)),
    timerCount: () => timers.length,
    dispatch(type) {
      listeners.get(type)?.();
    },
  };
}

check('all five Hero frames use an inner motion wrapper', () => {
  const hero = index.match(
    /<section\b[^>]*class=["']hero["'][\s\S]*?<\/section>/i,
  )?.[0] ?? '';
  const wrappers = hero.match(
    /class=["'][^"']*hero__image-motion[^"']*["']/gi,
  ) ?? [];
  const wrappedImages = hero.match(
    /<div\b[^>]*class=["'][^"']*hero__image-motion[^"']*["'][^>]*>\s*<img\b[^>]*class=["'][^"']*hero__image[^"']*["'][^>]*>\s*<\/div>/gi,
  ) ?? [];

  return wrappers.length === 5 && wrappedImages.length === 5;
});

check('early bootstrap is fail-safe and reload-scoped', () =>
  !/nutlens-hero-intro-played/.test(earlyBootstrap)
  && !/sessionStorage/.test(earlyBootstrap)
  && /matchMedia\(["']\(max-width:\s*48rem\)["']\)/.test(index)
  && /matchMedia\([\s\S]*["']\(prefers-reduced-motion:\s*reduce\)["']/.test(index)
  && /classList\.add\(["']hero-intro-pending["']\)/.test(index)
  && /classList\.remove\([\s\S]*hero-intro-pending[\s\S]*hero-intro-playing/.test(index),
);

check('early fail-safe countdown starts after DOM readiness', () => {
  const harness = createEarlyBootstrapHarness();
  const pendingBeforeReady = harness.root.classList.contains(
    'hero-intro-pending',
  );
  const noEarlyTimer = harness.timerCount() === 0;
  const waitsForDom = harness.listenerCount('DOMContentLoaded') === 1;

  harness.dispatch('DOMContentLoaded');

  return pendingBeforeReady
    && noEarlyTimer
    && waitsForDom
    && harness.timerCount() === 1;
});

check('motion wrapper owns only composited entrance properties', () =>
  /\.hero__image-motion\s*\{[^}]*width:\s*100%[^}]*height:\s*100%[^}]*overflow:\s*hidden/s.test(landingCss)
  && /\.hero-intro-pending\s+\.hero__image-motion\s*\{[^}]*opacity:\s*0[^}]*translateY\(var\(--hero-intro-distance\)\)[^}]*scale\(0\.98\)/s.test(landingCss)
  && /\.hero-intro-playing\s+\.hero__image-motion\s*\{[^}]*opacity:\s*1[^}]*translateY\(0\)[^}]*scale\(1\)[^}]*cubic-bezier\(0\.22,\s*1,\s*0\.36,\s*1\)/s.test(landingCss),
);

check('main, side, outer, and ghost timing follows the approved order', () =>
  /\.hero__image--main\s*\{[^}]*--hero-intro-distance:\s*28px[^}]*--hero-intro-delay:\s*350ms/s.test(landingCss)
  && /\.hero__image--side\s*\{[^}]*--hero-intro-distance:\s*36px[^}]*--hero-intro-delay:\s*520ms/s.test(landingCss)
  && /\.hero__image--outer\s*\{[^}]*--hero-intro-distance:\s*44px[^}]*--hero-intro-delay:\s*680ms/s.test(landingCss)
  && /\.hero-intro-pending\s+\.hero__image--outer::before,[\s\S]*?\.hero__image--side::before\s*\{[^}]*--hero-ghost-y:\s*-12px/s.test(landingCss)
  && /--hero-ghost-delay:\s*820ms/.test(landingCss),
);

check('mobile and reduced-motion states cannot reveal or animate artwork', () =>
  /@media\s*\(max-width:\s*48rem\)[\s\S]*?\.hero__artwork\s*\{[^}]*display:\s*none/s.test(landingCss)
  && /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.hero__image-motion[\s\S]*?opacity:\s*1[\s\S]*?transform:\s*none[\s\S]*?transition:\s*none/s.test(landingCss),
);

check('homepage loads the isolated Hero intro module', () =>
  heroIntroExists
  && /<script\b[^>]*type=["']module["'][^>]*src=["']assets\/js\/hero-intro\.mjs["'][^>]*><\/script>/i.test(index),
);

check('every eligible reload plays without session storage', () => {
  if (typeof heroIntro?.initHeroIntro !== 'function') return false;
  const harness = createHeroIntroHarness({ storageThrows: true });
  harness.root.classList.add('hero-intro-pending');
  const destroy = heroIntro.initHeroIntro(
    harness.documentRef,
    harness.environment,
  );

  harness.runFrame();
  const stillPending = harness.root.classList.contains('hero-intro-pending');
  harness.runFrame();
  const playing = harness.root.classList.contains('hero-intro-playing')
    && !harness.root.classList.contains('hero-intro-pending');
  harness.runTimers();
  const complete = harness.root.classList.contains('hero-intro-complete')
    && !harness.root.classList.contains('hero-intro-playing');
  destroy();

  return stillPending && playing && complete;
});

check('mobile and reduced motion skip animation work', () => {
  if (typeof heroIntro?.initHeroIntro !== 'function') return false;
  const mobile = createHeroIntroHarness({ mobile: true });
  const reduced = createHeroIntroHarness({ reducedMotion: true });

  [mobile, reduced].forEach((harness) => {
    harness.root.classList.add('hero-intro-pending');
    heroIntro.initHeroIntro(harness.documentRef, harness.environment);
  });

  return [mobile, reduced].every((harness) =>
    harness.frameCount() === 0
    && harness.listenerCount('DOMContentLoaded') === 0
    && !harness.root.classList.contains('hero-intro-pending')
    && harness.root.classList.contains('hero-intro-complete'));
});

check('Hero intro exports only the approved cleanup timing', () =>
  heroIntro?.HERO_INTRO_STORAGE_KEY === undefined
  && heroIntro?.HERO_INTRO_CLEANUP_DELAY === 1350,
);

if (failures.length > 0) {
  console.error(`\n${failures.length} Hero intro check(s) failed.`);
  process.exitCode = 1;
} else {
  console.log('\nAll Hero intro checks passed.');
}
