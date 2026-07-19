# Profile Dropdown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengganti placeholder Profil di sisi kanan navbar dengan Profile Dropdown yang responsif, aksesibel, dan terisolasi, serta menambahkan halaman profil kosong sebagai tujuan tautan.

**Architecture:** Markup disclosure dan panel berada di `index.html`, style komponen tetap menjadi milik `global.css`, sedangkan state interaksi ditempatkan pada module baru `profile-dropdown.mjs` agar tidak mengubah perilaku dropdown Layanan. Verifier statis yang sudah ada diperluas dengan kontrak markup, CSS, halaman tujuan, dan state JavaScript; seluruh pengembangan mengikuti siklus test-fail, implementasi minimal, lalu test-pass.

**Tech Stack:** Semantic HTML5, CSS custom properties dan BEM, Material Symbols, vanilla ES modules, Node.js verifier, browser QA melalui localhost.

## Global Constraints

- Hanya area profil kanan navbar, `assets/pages/profil.html`, module baru, dan pengujian terkait yang boleh berubah.
- Navigasi kiri, logo tengah, ukuran navbar, dropdown Layanan, Hero, section lain, dan JavaScript yang sudah ada tidak boleh berubah.
- Identitas harus menggunakan `Denny Pramana` dan `denprama@email.com`.
- Avatar sementara harus menggunakan `assets/images/testimonial/Bang Raka.webp` tanpa memodifikasi file gambar.
- Panel harus berada di kanan trigger, tidak menggeser layout, dan lebarnya tidak boleh melampaui viewport.
- Logout tidak boleh mensimulasikan autentikasi yang belum tersedia.
- Motion harus menghormati `prefers-reduced-motion`.
- Verifier saat ini memiliki tepat 20 kegagalan baseline. Implementasi tidak boleh menambah kegagalan baru atau mengubah perilaku di luar scope.
- Gunakan `apply_patch` untuk seluruh perubahan file.

## Approved Execution Adjustment

Folder `tests/` pada workspace utama diabaikan Git dan `tests/verify-site.mjs` tidak dilacak, sehingga verifier global tidak tersedia di linked worktree. Pengguna menyetujui penyesuaian berikut sebelum implementasi dimulai:

- seluruh kontrak baru Profile Dropdown ditulis pada file terfokus `tests/profile-dropdown.test.mjs` dan di-force-add ke feature branch;
- `tests/verify-site.mjs` lokal tidak dimodifikasi atau dimasukkan ke repository;
- regression gate global dijalankan dari workspace utama dengan `NUTLENS_ROOT` diarahkan ke worktree;
- siklus test-fail dan test-pass pada Task 1–3 menggunakan `node tests/profile-dropdown.test.mjs`;
- acceptance criteria produksi, markup, CSS, JavaScript, halaman profil, dan baseline 20 kegagalan tetap sama.

---

## File Structure

- Modify: `index.html` — disclosure trigger, panel Profile Dropdown, dan pemuatan module baru.
- Modify: `assets/css/global.css` — layout, state visual, responsivitas, fokus, dan reduced motion Profile Dropdown.
- Create: `assets/js/profile-dropdown.mjs` — state machine dan event lifecycle Profile Dropdown.
- Create: `assets/pages/profil.html` — dokumen HTML valid dengan `<main>` kosong.
- Modify: `tests/verify-site.mjs` — kontrak statis dan behavioral Profile Dropdown.
- Preserve: `assets/js/navbar.mjs` — interaksi Layanan tidak disentuh.

## Interfaces

Module `assets/js/profile-dropdown.mjs` menghasilkan interface berikut:

```js
export const PROFILE_CLOSE_DELAY = 200;

export function initProfileDropdown(root, environment = globalThis) {
  // Returns a cleanup function: () => void
}
```

`initProfileDropdown` mengonsumsi wrapper yang menyediakan selector berikut:

```text
.navbar__profile-trigger
.navbar__profile-panel
[data-profile-link]
[data-profile-logout]
```

Environment pengujian menyediakan `document`, `matchMedia`, `requestAnimationFrame`, `cancelAnimationFrame`, `setTimeout`, dan `clearTimeout`.

---

### Task 1: Markup Disclosure dan Halaman Profil Kosong

**Files:**
- Modify: `tests/verify-site.mjs:9-18, 70-105, setelah pengujian services disclosure`
- Modify: `index.html:19-21, 134-140`
- Create: `assets/pages/profil.html`

**Interfaces:**
- Consumes: token dan Material Symbols yang sudah dimuat oleh `index.html`.
- Produces: `[data-profile-dropdown]`, `.navbar__profile-trigger`, `#profile-menu`, `[data-profile-link]`, `[data-profile-logout]`, dan `assets/pages/profil.html` untuk CSS dan JavaScript task berikutnya.

- [ ] **Step 1: Tambahkan kontrak statis yang gagal**

Tambahkan path module dan halaman sesudah deklarasi `navbarModule`:

```js
const profileDropdownModulePath = resolve(root, 'assets/js/profile-dropdown.mjs');
const profileDropdownModuleExists = existsSync(profileDropdownModulePath);
const profileDropdownModuleSource = profileDropdownModuleExists
  ? read('assets/js/profile-dropdown.mjs')
  : '';
const profileDropdownModule = profileDropdownModuleExists
  ? await import(`${pathToFileURL(profileDropdownModulePath).href}?verification=${Date.now()}`)
  : null;
const profilePagePath = resolve(root, 'assets/pages/profil.html');
const profilePageExists = existsSync(profilePagePath);
const profilePage = profilePageExists ? read('assets/pages/profil.html') : '';
```

Tambahkan checks berikut setelah check `services use an ARIA button disclosure`:

```js
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
```

Hapus check lama berikut karena kontraknya memang digantikan oleh disclosure baru:

```js
check('profile availability is exposed as text content', () =>
  !/<span\b[^>]*aria-label=["']Profil pengguna belum tersedia["']/i.test(index)
  && /<span\b[^>]*>\s*Profil\s*<span\b[^>]*class=["'][^"']*visually-hidden[^"']*["'][^>]*>[^<]*belum tersedia[^<]*<\/span>/i.test(index),
);
```

- [ ] **Step 2: Jalankan verifier dan pastikan kontrak baru gagal**

Run:

```powershell
node tests/verify-site.mjs
```

Expected: empat check baru berstatus `FAIL`, sedangkan daftar 20 kegagalan baseline tetap muncul. Total sementara adalah 24 kegagalan.

- [ ] **Step 3: Implementasikan markup minimal dan halaman kosong**

Tambahkan module setelah `navbar.mjs` di `<head>`:

```html
<script type="module" src="assets/js/profile-dropdown.mjs"></script>
```

Ganti blok `.navbar__profile` lama dengan:

```html
<div class="navbar__profile" data-profile-dropdown>
  <button
    class="navbar__profile-trigger"
    type="button"
    aria-expanded="false"
    aria-controls="profile-menu"
    aria-label="Buka menu profil Denny Pramana"
  >
    <img
      class="navbar__profile-avatar navbar__profile-avatar--trigger"
      src="assets/images/testimonial/Bang Raka.webp"
      alt=""
      width="40"
      height="40"
    />
    <span
      class="navbar__profile-chevron material-symbols-outlined"
      aria-hidden="true"
    >expand_more</span>
  </button>

  <div
    id="profile-menu"
    class="navbar__profile-panel"
    hidden
    inert
  >
    <div class="navbar__profile-identity">
      <img
        class="navbar__profile-avatar navbar__profile-avatar--panel"
        src="assets/images/testimonial/Bang Raka.webp"
        alt=""
        width="48"
        height="48"
      />
      <div class="navbar__profile-copy">
        <p class="navbar__profile-name">Denny Pramana</p>
        <p class="navbar__profile-email">denprama@email.com</p>
      </div>
    </div>

    <hr class="navbar__profile-divider" />

    <a
      class="navbar__profile-action"
      href="assets/pages/profil.html"
      data-profile-link
    >
      <span class="material-symbols-outlined" aria-hidden="true">person</span>
      <span>Profile</span>
    </a>
    <button
      class="navbar__profile-action"
      type="button"
      data-profile-logout
    >
      <span class="material-symbols-outlined" aria-hidden="true">logout</span>
      <span>Logout</span>
    </button>
  </div>
</div>
```

Buat `assets/pages/profil.html` dengan isi lengkap:

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Profil &mdash; NutLens</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap">
  <link rel="stylesheet" href="../css/global.css">
</head>
<body>
  <main></main>
</body>
</html>
```

Tambahkan halaman tersebut ke `htmlFiles`:

```js
const htmlFiles = [
  'index.html',
  'assets/pages/artikel.html',
  'assets/pages/buat-resep.html',
  'assets/pages/cek-makanan.html',
  'assets/pages/challenge-sehat.html',
  'assets/pages/profil.html',
  'assets/pages/resep-galeri.html',
];
```

- [ ] **Step 4: Jalankan verifier dan catat sisa kegagalan yang benar**

Run:

```powershell
node tests/verify-site.mjs
```

Expected: check markup, identitas, dan halaman profil lulus. Check module masih gagal karena file JavaScript belum dibuat. Dua puluh kegagalan baseline tetap tidak berubah.

- [ ] **Step 5: Commit deliverable markup**

```powershell
git add -- index.html assets/pages/profil.html tests/verify-site.mjs
git commit -m "feat: add profile dropdown markup"
```

---

### Task 2: Style Profile Dropdown yang Responsif

**Files:**
- Modify: `tests/verify-site.mjs: setelah checks CSS navbar`
- Modify: `assets/css/global.css: setelah .navbar__profile dan sebelum focus-visible navbar`

**Interfaces:**
- Consumes: markup `.navbar__profile-*` dari Task 1 dan token global project.
- Produces: panel absolut, state `.is-open`, target interaksi, avatar crop, hover/focus, dan reduced motion untuk Task 3.

- [ ] **Step 1: Tambahkan check CSS yang gagal**

Tambahkan:

```js
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
```

- [ ] **Step 2: Jalankan verifier dan pastikan check CSS gagal**

Run:

```powershell
node tests/verify-site.mjs
```

Expected: `FAIL shared CSS owns the responsive profile dropdown presentation` dan kegagalan module dari Task 1; kegagalan baseline tetap 20.

- [ ] **Step 3: Tambahkan CSS minimal menggunakan token project**

Ganti rule `.navbar__profile` yang lama dan tambahkan rules berikut tepat sebelum focus-visible navbar:

```css
.navbar__profile {
  position: relative;
  justify-self: end;
  color: var(--color-gray-700);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.navbar__profile-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.75rem;
  min-height: 2.75rem;
  gap: var(--space-1);
  padding: 0;
  color: var(--color-gray-700);
  background: transparent;
  border: 0;
  font: inherit;
  cursor: pointer;
}

.navbar__profile-avatar {
  display: block;
  flex: 0 0 auto;
  aspect-ratio: 1;
  object-fit: cover;
  object-position: center 35%;
  border-radius: var(--radius-full);
}

.navbar__profile-avatar--trigger {
  width: 2.5rem;
}

.navbar__profile-avatar--panel {
  width: 3rem;
}

.navbar__profile-chevron {
  color: currentColor;
  font-size: var(--font-size-lg);
  transition: transform var(--transition-base);
}

.navbar__profile-trigger[aria-expanded="true"] .navbar__profile-chevron {
  transform: rotate(180deg);
}

.navbar__profile-panel {
  --profile-dropdown-duration: 200ms;
  position: absolute;
  z-index: var(--z-index-dropdown);
  top: calc(100% + var(--space-3));
  right: 0;
  width: min(18.75rem, calc(100vw - (2 * var(--space-4))));
  padding: var(--space-4);
  color: var(--color-on-surface);
  background-color: var(--color-surface-container-lowest);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  opacity: 0;
  transform: translateY(calc(var(--space-2) * -1));
  visibility: hidden;
  pointer-events: none;
  transition:
    opacity var(--profile-dropdown-duration) ease,
    transform var(--profile-dropdown-duration) ease,
    visibility 0s linear var(--profile-dropdown-duration);
}

.navbar__profile-panel.is-open {
  opacity: 1;
  transform: translateY(0);
  visibility: visible;
  pointer-events: auto;
  transition-delay: 0s;
}

.navbar__profile-panel[hidden] {
  display: none;
}

.navbar__profile-identity {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2);
}

.navbar__profile-copy {
  min-width: 0;
}

.navbar__profile-name,
.navbar__profile-email {
  margin: 0;
}

.navbar__profile-name {
  color: var(--color-on-surface);
  font-size: var(--font-size-body-md);
  font-weight: 600;
  line-height: var(--line-height-label);
}

.navbar__profile-email {
  margin-top: var(--space-1);
  color: var(--color-on-surface-variant);
  font-size: var(--font-size-sm);
  font-weight: 400;
  line-height: var(--line-height-body-md);
  overflow-wrap: anywhere;
}

.navbar__profile-divider {
  height: 1px;
  margin: var(--space-3) 0;
  background-color: var(--color-outline-variant);
  border: 0;
}

.navbar__profile-action {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 3.5rem;
  gap: var(--space-3);
  padding: var(--space-3);
  color: var(--color-on-surface);
  background: transparent;
  border: 0;
  border-radius: var(--radius-xl);
  font: inherit;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.navbar__profile-action:is(:hover, :focus-visible) {
  background-color: var(--color-surface-container-high);
}

.navbar__profile-action .material-symbols-outlined {
  color: var(--color-primary);
  font-size: var(--font-size-2xl);
}

@media (prefers-reduced-motion: reduce) {
  .navbar__profile-panel,
  .navbar__profile-chevron,
  .navbar__profile-action {
    transition-duration: 1ms;
  }
}
```

- [ ] **Step 4: Jalankan verifier dan pastikan check CSS lulus**

Run:

```powershell
node tests/verify-site.mjs
```

Expected: check CSS Profile Dropdown lulus. Hanya check module yang belum dibuat dan 20 baseline lama yang gagal.

- [ ] **Step 5: Commit deliverable CSS**

```powershell
git add -- assets/css/global.css tests/verify-site.mjs
git commit -m "style: add responsive profile dropdown"
```

---

### Task 3: Interaksi Profile Dropdown

**Files:**
- Modify: `tests/verify-site.mjs: helper createListenerTarget, module imports, dan setelah navbar behavior checks`
- Create: `assets/js/profile-dropdown.mjs`

**Interfaces:**
- Consumes: selector dan state class dari Task 1–2.
- Produces: `PROFILE_CLOSE_DELAY` dan `initProfileDropdown(root, environment)`.

- [ ] **Step 1: Perluas test helper untuk memeriksa cleanup**

Tambahkan method berikut pada object yang dikembalikan `createListenerTarget()`:

```js
listenerCount(type) {
  return listeners.get(type)?.size ?? 0;
},
```

- [ ] **Step 2: Tambahkan behavioral tests yang gagal**

Tambahkan helper lokal setelah `createListenerTarget`:

```js
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
```

Tambahkan factory test setelah import module:

```js
function createProfileDropdownHarness({ reducedMotion = false } = {}) {
  const root = createListenerTarget();
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

  root.querySelector = (selector) => ({
    '.navbar__profile-trigger': trigger,
    '.navbar__profile-panel': panel,
    '[data-profile-link]': profileLink,
    '[data-profile-logout]': logoutButton,
  })[selector] ?? null;
  root.contains = (node) => [root, trigger, panel, profileLink, logoutButton].includes(node);

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
    root,
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
```

Tambahkan checks:

```js
check('profile dropdown toggles state and delays hidden until close completes', () => {
  if (typeof profileDropdownModule?.initProfileDropdown !== 'function') return false;
  const harness = createProfileDropdownHarness();
  const destroy = profileDropdownModule.initProfileDropdown(harness.root, harness.environment);

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
  const destroy = profileDropdownModule.initProfileDropdown(harness.root, harness.environment);

  harness.trigger.dispatch('click');
  harness.root.dispatch('focusout', { relatedTarget: harness.profileLink });
  const remainedOpen = harness.attributes.get('aria-expanded') === 'true';

  harness.documentRef.dispatch('pointerdown', { target: {} });
  const outsideClosed = harness.attributes.get('aria-expanded') === 'false';

  harness.trigger.dispatch('click');
  let prevented = false;
  harness.root.dispatch('keydown', {
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
  const destroy = profileDropdownModule.initProfileDropdown(harness.root, harness.environment);

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
    && harness.root.listenerCount('keydown') === 0
    && harness.trigger.listenerCount('click') === 0
    && harness.documentRef.listenerCount('pointerdown') === 0;
});
```

- [ ] **Step 3: Jalankan verifier dan pastikan behavioral checks gagal**

Run:

```powershell
node tests/verify-site.mjs
```

Expected: module load dan tiga behavioral checks gagal; check markup dan CSS Profile Dropdown tetap lulus.

- [ ] **Step 4: Implementasikan module state dan lifecycle minimal**

Buat `assets/js/profile-dropdown.mjs`:

```js
export const PROFILE_CLOSE_DELAY = 200;

export function initProfileDropdown(root, environment = globalThis) {
  const trigger = root.querySelector('.navbar__profile-trigger');
  const panel = root.querySelector('.navbar__profile-panel');
  const profileLink = root.querySelector('[data-profile-link]');
  const logoutButton = root.querySelector('[data-profile-logout]');
  const documentRef = environment.document;

  if (!trigger || !panel || !documentRef) return () => {};

  const reducedMotion = environment.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const closeDelay = reducedMotion ? 0 : PROFILE_CLOSE_DELAY;
  const requestFrame = environment.requestAnimationFrame?.bind(environment)
    ?? ((callback) => {
      callback();
      return null;
    });
  const cancelFrame = environment.cancelAnimationFrame?.bind(environment) ?? (() => {});
  const schedule = environment.setTimeout?.bind(environment) ?? globalThis.setTimeout.bind(globalThis);
  const cancelSchedule = environment.clearTimeout?.bind(environment)
    ?? globalThis.clearTimeout.bind(globalThis);
  let closeTimer = null;
  let openFrame = null;

  const clearPendingWork = () => {
    if (closeTimer !== null) {
      cancelSchedule(closeTimer);
      closeTimer = null;
    }
    if (openFrame !== null) {
      cancelFrame(openFrame);
      openFrame = null;
    }
  };

  const isOpen = () => trigger.getAttribute('aria-expanded') === 'true';

  const open = () => {
    clearPendingWork();
    trigger.setAttribute('aria-expanded', 'true');
    panel.hidden = false;
    panel.inert = false;
    openFrame = requestFrame(() => {
      panel.classList.add('is-open');
      openFrame = null;
    });
  };

  const close = ({ restoreFocus = false, immediate = false } = {}) => {
    clearPendingWork();
    trigger.setAttribute('aria-expanded', 'false');
    panel.classList.remove('is-open');
    panel.inert = true;

    if (immediate) {
      panel.hidden = true;
    } else {
      closeTimer = schedule(() => {
        panel.hidden = true;
        closeTimer = null;
      }, closeDelay);
    }

    if (restoreFocus) trigger.focus();
  };

  const handleTriggerClick = () => {
    if (isOpen()) close();
    else open();
  };

  const handleOutsidePointerDown = (event) => {
    if (isOpen() && !root.contains(event.target)) close();
  };

  const handleKeyDown = (event) => {
    if (event.key !== 'Escape' || !isOpen()) return;
    event.preventDefault();
    close({ restoreFocus: true });
  };

  const handleFocusOut = (event) => {
    if (isOpen() && !root.contains(event.relatedTarget)) close();
  };

  const handleProfileSelection = () => {
    close({ immediate: true });
  };

  const handleLogout = () => {
    close();
  };

  trigger.addEventListener('click', handleTriggerClick);
  root.addEventListener('keydown', handleKeyDown);
  root.addEventListener('focusout', handleFocusOut);
  documentRef.addEventListener('pointerdown', handleOutsidePointerDown);
  profileLink?.addEventListener('click', handleProfileSelection);
  logoutButton?.addEventListener('click', handleLogout);

  trigger.setAttribute('aria-expanded', 'false');
  panel.classList.remove('is-open');
  panel.hidden = true;
  panel.inert = true;

  return () => {
    clearPendingWork();
    trigger.removeEventListener('click', handleTriggerClick);
    root.removeEventListener('keydown', handleKeyDown);
    root.removeEventListener('focusout', handleFocusOut);
    documentRef.removeEventListener('pointerdown', handleOutsidePointerDown);
    profileLink?.removeEventListener('click', handleProfileSelection);
    logoutButton?.removeEventListener('click', handleLogout);
  };
}

if (typeof document !== 'undefined') {
  document.querySelectorAll('[data-profile-dropdown]').forEach((root) => {
    initProfileDropdown(root, window);
  });
}
```

- [ ] **Step 5: Jalankan verifier dan pastikan seluruh check baru lulus**

Run:

```powershell
node tests/verify-site.mjs
```

Expected: seluruh check Profile Dropdown berstatus `PASS`. Hanya 20 kegagalan baseline lama yang tersisa dan namanya sama dengan baseline sebelum implementasi.

- [ ] **Step 6: Commit deliverable interaksi**

```powershell
git add -- assets/js/profile-dropdown.mjs tests/verify-site.mjs
git commit -m "feat: add accessible profile dropdown behavior"
```

---

### Task 4: Browser QA dan Regression Gate

**Files:**
- Verify only: `index.html`
- Verify only: `assets/css/global.css`
- Verify only: `assets/js/navbar.mjs`
- Verify only: `assets/js/profile-dropdown.mjs`
- Verify only: `assets/pages/profil.html`

**Interfaces:**
- Consumes: seluruh deliverable Task 1–3.
- Produces: bukti visual dan behavioral bahwa acceptance criteria terpenuhi tanpa regresi.

- [ ] **Step 1: Periksa diff dan batas scope**

Run:

```powershell
git status --short
git diff --check HEAD~3..HEAD
git diff --stat HEAD~3..HEAD
git diff HEAD~3..HEAD -- assets/js/navbar.mjs assets/css/landing-page.css
```

Expected: tidak ada whitespace error; `navbar.mjs` dan `landing-page.css` tidak memiliki perubahan; hanya file yang tercantum dalam scope yang berubah.

- [ ] **Step 2: Jalankan syntax check module**

Run:

```powershell
node --check assets/js/profile-dropdown.mjs
```

Expected: exit code 0 tanpa output error.

- [ ] **Step 3: Jalankan full verifier dan bandingkan baseline**

Run:

```powershell
node tests/verify-site.mjs
```

Expected: seluruh check Profile Dropdown lulus; tepat 20 check baseline lama tetap gagal dan tidak ada nama kegagalan baru.

- [ ] **Step 4: Jalankan static site melalui localhost**

Run:

```powershell
Start-Process -FilePath python -ArgumentList '-m','http.server','5500','--bind','127.0.0.1' -WorkingDirectory 'D:\nutlens1' -WindowStyle Hidden
```

Expected: `http://127.0.0.1:5500/index.html` dapat dibuka tanpa `ERR_CONNECTION_REFUSED`.

- [ ] **Step 5: Verifikasi desktop melalui browser**

Buka `http://127.0.0.1:5500/index.html` pada viewport `1440 × 900` dan periksa:

```text
1. Navbar kiri, logo tengah, tinggi navbar, Hero, dan dropdown Layanan tidak bergeser.
2. Trigger kanan menampilkan avatar bulat dan chevron.
3. Klik trigger membuka panel di kanan bawah dengan jarak 12px.
4. Panel berisi Denny Pramana, denprama@email.com, Profile, dan Logout.
5. Klik luar menutup panel setelah fade singkat.
6. Escape menutup panel dan fokus kembali ke trigger.
7. Tab berpindah dari trigger ke Profile lalu Logout tanpa panel menutup dini.
8. Profile membuka /assets/pages/profil.html.
9. Logout hanya menutup panel.
10. Dropdown Layanan masih dapat dibuka dan dipilih.
```

- [ ] **Step 6: Verifikasi viewport sempit dan overflow**

Uji viewport `768 × 900` dan `320 × 640`. Di console browser evaluasi:

```js
({
  viewport: window.innerWidth,
  documentWidth: document.documentElement.scrollWidth,
  hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
  panel: document.querySelector('.navbar__profile-panel')?.getBoundingClientRect(),
})
```

Expected: `hasHorizontalOverflow` bernilai `false`; panel berada di dalam viewport dan tetap menempel ke sisi kanan trigger.

- [ ] **Step 7: Verifikasi reduced motion**

Aktifkan emulasi `prefers-reduced-motion: reduce`, buka dan tutup dropdown, lalu pastikan state tetap sinkron dan tidak menunggu animasi 200ms untuk menjadi `hidden`.

- [ ] **Step 8: Catat hasil akhir tanpa commit tambahan jika tidak ada perubahan**

Run:

```powershell
git status --short --branch
git log -4 --oneline --decorate
```

Expected: working tree bersih dan tiga commit feature terlihat setelah commit spesifikasi.
