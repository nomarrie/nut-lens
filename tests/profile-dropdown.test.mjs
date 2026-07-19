import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

function read(relativePath) {
  return readFileSync(resolve(root, relativePath), 'utf8');
}

function check(name, test) {
  try {
    assert.ok(test(), name);
    console.log(`PASS ${name}`);
  } catch {
    failures.push(name);
    console.error(`FAIL ${name}`);
  }
}

function readCssBlock(source, marker) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) return '';

  const openingBrace = source.indexOf('{', markerIndex);
  if (openingBrace < 0) return '';

  let depth = 0;
  for (let index = openingBrace; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') depth -= 1;
    if (depth === 0) return source.slice(openingBrace + 1, index);
  }

  return '';
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
    dispatch(type, event = {}) {
      const dispatchedEvent = { target: this, ...event };
      listeners.get(type)?.forEach((listener) => listener(dispatchedEvent));
    },
    listenerCount(type) {
      return listeners.get(type)?.size ?? 0;
    },
  };
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

const index = read('index.html');
const globalCss = read('assets/css/global.css');
const profileDropdownModulePath = resolve(root, 'assets/js/profile-dropdown.mjs');
const profileDropdownModuleExists = existsSync(profileDropdownModulePath);
const profileDropdownModule = profileDropdownModuleExists
  ? await import(`${pathToFileURL(profileDropdownModulePath).href}?verification=${Date.now()}`)
  : null;
const profilePagePath = resolve(root, 'assets/pages/profil.html');
const profilePageExists = existsSync(profilePagePath);
const profilePage = profilePageExists ? read('assets/pages/profil.html') : '';

function createProfileDropdownHarness({ reducedMotion = false } = {}) {
  const rootElement = createListenerTarget();
  const trigger = createListenerTarget();
  const panel = { hidden: true, inert: true, classList: createClassList() };
  const profileLink = createListenerTarget();
  const logoutButton = createListenerTarget();
  const documentRef = createListenerTarget();
  const attributes = new Map([['aria-expanded', 'false']]);
  const timers = new Map();
  let nextTimerId = 1;

  trigger.setAttribute = (name, value) => attributes.set(name, value);
  trigger.getAttribute = (name) => attributes.get(name);
  trigger.focus = () => {
    documentRef.activeElement = trigger;
  };

  rootElement.querySelector = (selector) => ({
    '.navbar__profile-trigger': trigger,
    '.navbar__profile-panel': panel,
    '[data-profile-link]': profileLink,
    '[data-profile-logout]': logoutButton,
  })[selector] ?? null;
  rootElement.contains = (node) => [
    rootElement,
    trigger,
    panel,
    profileLink,
    logoutButton,
  ].includes(node);

  const environment = {
    document: documentRef,
    matchMedia: () => ({ matches: reducedMotion }),
    requestAnimationFrame(callback) {
      callback();
      return 1;
    },
    cancelAnimationFrame() {},
    setTimeout(callback) {
      const id = nextTimerId;
      nextTimerId += 1;
      timers.set(id, callback);
      return id;
    },
    clearTimeout(id) {
      timers.delete(id);
    },
  };

  return {
    rootElement,
    trigger,
    panel,
    profileLink,
    logoutButton,
    documentRef,
    attributes,
    environment,
    runTimers() {
      const callbacks = [...timers.values()];
      timers.clear();
      callbacks.forEach((callback) => callback());
    },
  };
}

check('homepage exposes an accessible profile disclosure', () =>
  /<div\b[^>]*class=["'][^"']*navbar__profile[^"']*["'][^>]*data-profile-dropdown/i.test(index)
  && /<button\b[^>]*class=["'][^"']*navbar__profile-trigger[^"']*["'][^>]*type=["']button["'][^>]*aria-expanded=["']false["'][^>]*aria-controls=["']profile-menu["']/i.test(index)
  && /<div\b[^>]*id=["']profile-menu["'][^>]*class=["'][^"']*navbar__profile-panel[^"']*["'][^>]*hidden[^>]*inert/i.test(index),
);

check('profile dropdown contains the approved identity and actions', () => {
  const profile = index.match(/<div\b[^>]*class=["'][^"']*navbar__profile[^"']*["'][\s\S]*?<\/div>\s*<\/div>\s*<\/nav>/i)?.[0] ?? '';
  return profile.includes('Denny Pramana')
    && profile.includes('denprama@email.com')
    && profile.includes('assets/images/testimonial/Bang Raka.webp')
    && /<a\b(?=[^>]*data-profile-link)(?=[^>]*href=["']assets\/pages\/profil\.html["'])[^>]*>/i.test(profile)
    && /<button\b(?=[^>]*data-profile-logout)(?=[^>]*type=["']button["'])[^>]*>/i.test(profile)
    && /\bperson\b/.test(profile)
    && /\blogout\b/.test(profile);
});

check('homepage loads the isolated profile dropdown module', () =>
  profileDropdownModuleExists
  && /<script\b[^>]*type=["']module["'][^>]*src=["']assets\/js\/profile-dropdown\.mjs["'][^>]*><\/script>/i.test(index),
);

check('profile page is a complete empty-main document', () =>
  profilePageExists
  && /<!doctype html>/i.test(profilePage)
  && /<html\b[^>]*lang=["']id["']/i.test(profilePage)
  && /<meta\s+name=["']viewport["']\s+content=["']width=device-width,\s*initial-scale=1["']/i.test(profilePage)
  && /<title>Profil &mdash; NutLens<\/title>/i.test(profilePage)
  && /<link\b[^>]*href=["']\.\.\/css\/global\.css["']/i.test(profilePage)
  && /<main>\s*<\/main>/i.test(profilePage),
);

check('shared CSS owns the responsive profile dropdown presentation', () => {
  const profilePanelCss = readCssBlock(globalCss, '.navbar__profile-panel');
  return /\.navbar__profile\s*\{[^}]*position:\s*relative[^}]*justify-self:\s*end/s.test(globalCss)
    && /\.navbar__profile-trigger\s*\{[^}]*min-width:\s*2\.75rem[^}]*min-height:\s*2\.75rem[^}]*background:\s*transparent[^}]*border:\s*0/s.test(globalCss)
    && /position:\s*absolute/.test(profilePanelCss)
    && /top:\s*calc\(100%\s*\+\s*var\(--space-3\)\)/.test(profilePanelCss)
    && /right:\s*0/.test(profilePanelCss)
    && /width:\s*min\(18\.75rem,\s*calc\(100vw\s*-\s*\(2\s*\*\s*var\(--space-4\)\)\)\)/.test(profilePanelCss)
    && /z-index:\s*var\(--z-index-dropdown\)/.test(profilePanelCss)
    && /\.navbar__profile-panel\.is-open\s*\{[^}]*opacity:\s*1[^}]*transform:\s*translateY\(0\)[^}]*visibility:\s*visible/s.test(globalCss)
    && /\.navbar__profile-panel\[hidden\]\s*\{[^}]*display:\s*none/s.test(globalCss)
    && /\.navbar__profile-action:is\(:hover,\s*:focus-visible\)\s*\{[^}]*background-color:\s*var\(--color-surface-container-high\)/s.test(globalCss)
    && /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.navbar__profile-panel[\s\S]*?transition-duration:\s*1ms/s.test(globalCss);
});

check('profile dropdown toggles state and delays hidden until close completes', () => {
  if (typeof profileDropdownModule?.initProfileDropdown !== 'function') return false;
  const harness = createProfileDropdownHarness();
  const destroy = profileDropdownModule.initProfileDropdown(
    harness.rootElement,
    harness.environment,
  );

  harness.trigger.dispatch('click');
  const opened = harness.attributes.get('aria-expanded') === 'true'
    && harness.panel.hidden === false
    && harness.panel.inert === false
    && harness.panel.classList.contains('is-open');

  harness.trigger.dispatch('click');
  const closing = harness.attributes.get('aria-expanded') === 'false'
    && harness.panel.hidden === false
    && harness.panel.inert === true
    && !harness.panel.classList.contains('is-open');

  harness.runTimers();
  const closed = harness.panel.hidden === true;
  destroy();
  return opened && closing && closed;
});

check('profile dropdown closes outside and on Escape without premature focus loss', () => {
  if (typeof profileDropdownModule?.initProfileDropdown !== 'function') return false;
  const harness = createProfileDropdownHarness();
  const destroy = profileDropdownModule.initProfileDropdown(
    harness.rootElement,
    harness.environment,
  );

  harness.trigger.dispatch('click');
  harness.rootElement.dispatch('focusout', { relatedTarget: harness.profileLink });
  const remainedOpen = harness.attributes.get('aria-expanded') === 'true';

  harness.documentRef.dispatch('pointerdown', { target: {} });
  const outsideClosed = harness.attributes.get('aria-expanded') === 'false';

  harness.trigger.dispatch('click');
  let prevented = false;
  harness.rootElement.dispatch('keydown', {
    key: 'Escape',
    preventDefault() {
      prevented = true;
    },
  });

  const escaped = prevented
    && harness.attributes.get('aria-expanded') === 'false'
    && harness.documentRef.activeElement === harness.trigger;
  destroy();
  return remainedOpen && outsideClosed && escaped;
});

check('profile actions close safely and cleanup removes listeners', () => {
  if (typeof profileDropdownModule?.initProfileDropdown !== 'function') return false;
  const harness = createProfileDropdownHarness();
  const destroy = profileDropdownModule.initProfileDropdown(
    harness.rootElement,
    harness.environment,
  );

  harness.trigger.dispatch('click');
  harness.profileLink.dispatch('click');
  const profileClosed = harness.attributes.get('aria-expanded') === 'false'
    && harness.panel.hidden === true;

  harness.trigger.dispatch('click');
  harness.logoutButton.dispatch('click');
  harness.trigger.dispatch('click');
  harness.runTimers();
  const reopenedSafely = harness.attributes.get('aria-expanded') === 'true'
    && harness.panel.hidden === false;

  destroy();
  return profileClosed
    && reopenedSafely
    && harness.rootElement.listenerCount('keydown') === 0
    && harness.trigger.listenerCount('click') === 0
    && harness.documentRef.listenerCount('pointerdown') === 0;
});

check('reduced motion closes without the standard delay', () => {
  if (typeof profileDropdownModule?.initProfileDropdown !== 'function') return false;
  const harness = createProfileDropdownHarness({ reducedMotion: true });
  const delays = [];
  const originalSetTimeout = harness.environment.setTimeout;
  harness.environment.setTimeout = (callback, delay) => {
    delays.push(delay);
    return originalSetTimeout(callback, delay);
  };
  const destroy = profileDropdownModule.initProfileDropdown(
    harness.rootElement,
    harness.environment,
  );
  harness.trigger.dispatch('click');
  harness.trigger.dispatch('click');
  harness.runTimers();
  const result = delays.at(-1) === 0 && harness.panel.hidden === true;
  destroy();
  return result;
});

if (failures.length > 0) {
  console.error(`\n${failures.length} profile dropdown check(s) failed.`);
  process.exitCode = 1;
} else {
  console.log('\nAll profile dropdown checks passed.');
}
