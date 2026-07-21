# Cek Makanan Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengganti placeholder Cek Makanan dengan halaman Hero NutLens responsif yang memakai navbar global, visual dua kolom, dua information card, dan CTA menuju section upload yang akan datang.

**Architecture:** Halaman tetap berupa static HTML. Seluruh style khusus halaman berada di `assets/css/cek-makanan.css`, sedangkan token, navbar, profile dropdown, dan mobile drawer tetap berasal dari `assets/css/global.css` serta modul JavaScript existing. Hero bersifat content-driven; floating card hanya absolute pada desktop dan kembali ke normal flow pada mobile.

**Tech Stack:** HTML5 semantik, custom CSS, vanilla JavaScript existing, Node.js static verifier.

## Global Constraints

- Hanya ubah `assets/pages/cek-makanan.html`; buat `assets/css/cek-makanan.css` dan `tests/check-food-page.test.mjs`.
- Jangan mengubah landing page, global CSS, navbar global, profile dropdown, mobile navigation, footer, token, atau halaman lain.
- Jangan menambahkan library atau JavaScript baru.
- CTA final harus menggunakan `href="#upload-makanan"`, bukan `href="#"`.
- Hero memakai tinggi berdasarkan konten, bukan `height: 100vh`.
- Gambar Hero tidak memakai lazy loading dan harus memiliki dimensi, `decoding="async"`, serta `fetchpriority="high"`.

---

### Task 1: Kunci kontrak halaman dengan verifier yang gagal

**Files:**
- Create: `tests/check-food-page.test.mjs`
- Read: `assets/pages/cek-makanan.html`
- Read: `assets/css/cek-makanan.css`

**Interfaces:**
- Consumes: path halaman existing `assets/pages/cek-makanan.html`.
- Produces: kontrak executable untuk metadata, navbar, Hero, gambar, CTA, desktop grid, dan mobile flow.

- [ ] **Step 1: Tulis verifier statis**

Gunakan struktur berikut di `tests/check-food-page.test.mjs`:

```js
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pagePath = resolve(root, 'assets/pages/cek-makanan.html');
const cssPath = resolve(root, 'assets/css/cek-makanan.css');
const page = readFileSync(pagePath, 'utf8');
const css = existsSync(cssPath) ? readFileSync(cssPath, 'utf8') : '';
const failures = [];

function check(name, predicate) {
  try {
    assert.ok(predicate(), name);
    console.log(`PASS ${name}`);
  } catch {
    failures.push(name);
    console.error(`FAIL ${name}`);
  }
}

check('page exposes approved metadata and CSS order', () =>
  /<title>Cek Makanan \| NutLens<\/title>/.test(page)
  && /name="description"[\s\S]*Analisis makanan/.test(page)
  && page.indexOf('../css/global.css') < page.indexOf('../css/cek-makanan.css'),
);

check('page reuses global desktop and mobile navigation', () =>
  /data-mobile-navigation/.test(page)
  && /data-services-dropdown/.test(page)
  && /data-profile-dropdown/.test(page)
  && /src="\.\.\/js\/navbar\.mjs"/.test(page)
  && /src="\.\.\/js\/profile-dropdown\.mjs"/.test(page)
  && /src="\.\.\/js\/mobile-navigation\.mjs"/.test(page)
  && /href="cek-makanan\.html"[^>]*aria-current="page"/.test(page),
);

check('Hero content follows the approved semantic order', () =>
  /<section[^>]*class="scan-hero"[^>]*aria-labelledby="scan-hero-title"/.test(page)
  && /scan-hero__badge[\s\S]*Analisis Nutrisi Berbasis AI[\s\S]*<h1[^>]*id="scan-hero-title"[\s\S]*Mulai Pola Hidup[\s\S]*Nutrisi Yang Tepat[\s\S]*scan-hero__description[\s\S]*scan-hero__cta/.test(page),
);

check('CTA reserves the future upload section target', () =>
  /class="scan-hero__cta"[^>]*href="#upload-makanan"/.test(page)
  && !/href="#"/.test(page),
);

check('Hero visual is accessible and prioritized', () =>
  /class="scan-hero__image"[\s\S]*alt="Makanan sehat sebagai contoh analisis nutrisi NutLens"[\s\S]*width="528"[\s\S]*height="576"[\s\S]*decoding="async"[\s\S]*fetchpriority="high"/.test(page)
  && /scan-hero__feature--accuracy[\s\S]*99%[\s\S]*Akurasi Tinggi/.test(page)
  && /scan-hero__feature--instant[\s\S]*Scan Instan[\s\S]*Hasil dalam &lt; 2 detik/.test(page),
);

check('desktop layout uses proportional grid and bounded floating cards', () =>
  /\.scan-hero__layout\s*\{[^}]*display:\s*grid[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+minmax\(0,\s*33rem\)/s.test(css)
  && /\.scan-hero__visual\s*\{[^}]*position:\s*relative/s.test(css)
  && /\.scan-hero__feature\s*\{[^}]*position:\s*absolute/s.test(css)
  && /\.scan-hero__image-frame\s*\{[^}]*aspect-ratio:\s*528\s*\/\s*576/s.test(css)
  && !/height:\s*100(?:s|d|l)?vh/.test(css),
);

check('mobile layout stacks safely and restores cards to flow', () => {
  const mobile = css.match(/@media \(max-width: 48rem\)\s*\{([\s\S]*)\}\s*$/)?.[1] ?? '';
  return /\.scan-hero__layout\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s.test(mobile)
    && /\.scan-hero__content\s*\{[^}]*text-align:\s*center/s.test(mobile)
    && /\.scan-hero__cta\s*\{[^}]*width:\s*100%/s.test(mobile)
    && /\.scan-hero__feature\s*\{[^}]*position:\s*static/s.test(mobile);
});

if (failures.length) {
  console.error(`\n${failures.length} Cek Makanan check(s) failed.`);
  process.exitCode = 1;
} else {
  console.log('\nAll Cek Makanan checks passed.');
}
```

- [ ] **Step 2: Jalankan verifier dan pastikan RED**

Run: `node tests/check-food-page.test.mjs`  
Expected: FAIL karena CSS khusus dan Hero final belum tersedia.

- [ ] **Step 3: Commit kontrak gagal**

```powershell
git add tests/check-food-page.test.mjs
git commit -m "test: define check food hero contract"
```

---

### Task 2: Implementasikan shell halaman dan semantic Hero

**Files:**
- Modify: `assets/pages/cek-makanan.html`
- Test: `tests/check-food-page.test.mjs`

**Interfaces:**
- Consumes: global navbar markup dari `index.html:28-393`, global modules, dan CTA target `#upload-makanan`.
- Produces: DOM BEM `scan-hero`, image contract, serta hooks yang dipakai stylesheet Task 3.

- [ ] **Step 1: Ganti placeholder dengan shell global**

Gunakan `<head>` berikut, kemudian salin navbar `index.html:28-393` tanpa mengubah struktur atau accessibility attributes:

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta
    name="description"
    content="Analisis makanan dan temukan estimasi kalori, protein, lemak, karbohidrat, serat, serta gula bersama NutLens."
  />
  <title>Cek Makanan | NutLens</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&family=Outfit:wght@100..900&display=swap"
  />
  <link rel="stylesheet" href="../css/global.css" />
  <link rel="stylesheet" href="../css/cek-makanan.css" />
  <script type="module" src="../js/navbar.mjs"></script>
  <script type="module" src="../js/profile-dropdown.mjs"></script>
  <script type="module" src="../js/mobile-navigation.mjs"></script>
</head>
```

Terapkan mapping path berikut pada navbar yang disalin:

| Path landing | Path nested page |
|---|---|
| `index.html` | `../../index.html` |
| `assets/pages/cek-makanan.html` | `cek-makanan.html` |
| `assets/pages/buat-resep.html` | `buat-resep.html` |
| `assets/pages/resep-galeri.html` | `resep-galeri.html` |
| `assets/pages/challenge-sehat.html` | `challenge-sehat.html` |
| `assets/pages/artikel.html` | `artikel.html` |
| `assets/pages/profil.html` | `profil.html` |
| `assets/images/...` | `../images/...` |

Hapus `is-active` dan `aria-current` dari Beranda. Tambahkan `aria-current="page"` hanya pada tautan `cek-makanan.html` di submenu desktop dan mobile.

- [ ] **Step 2: Tambahkan markup Hero setelah navbar**

```html
<main>
  <section class="scan-hero" aria-labelledby="scan-hero-title">
    <div class="scan-hero__layout">
      <div class="scan-hero__content">
        <p class="scan-hero__badge">
          <span class="material-symbols-outlined" aria-hidden="true">psychology</span>
          <span>Analisis Nutrisi Berbasis AI</span>
        </p>

        <h1 class="scan-hero__title" id="scan-hero-title">
          <span class="scan-hero__title-line">Mulai Pola Hidup</span>
          <span class="scan-hero__title-line">
            Sehat
            <span class="scan-hero__inline-logo material-symbols-outlined" aria-hidden="true">nutrition</span>
            Dengan
          </span>
          <span class="scan-hero__title-line">Nutrisi Yang Tepat</span>
        </h1>

        <p class="scan-hero__description">
          Temukan informasi nutrisi dari setiap makanan hanya dengan satu kali scan.
          NutLens membantu Anda mengetahui kandungan kalori, protein, lemak,
          karbohidrat, serat, serta gula secara cepat dan mudah.
        </p>

        <a class="scan-hero__cta" href="#upload-makanan">
          Mulai Analisis Sekarang
        </a>
      </div>

      <div class="scan-hero__visual">
        <figure class="scan-hero__image-frame">
          <img
            class="scan-hero__image"
            src="../images/problem/Foto junk food.webp"
            alt="Makanan sehat sebagai contoh analisis nutrisi NutLens"
            width="528"
            height="576"
            decoding="async"
            fetchpriority="high"
          />
        </figure>

        <div class="scan-hero__feature-list">
          <div class="scan-hero__feature scan-hero__feature--accuracy">
            <div class="scan-hero__score"><span>99%</span></div>
            <div class="scan-hero__feature-content">
              <strong>Akurasi Tinggi</strong>
              <span>Hasil sangat akurat berdasarkan gizi terbaru</span>
            </div>
          </div>

          <div class="scan-hero__feature scan-hero__feature--instant">
            <span class="scan-hero__feature-icon material-symbols-outlined" aria-hidden="true">document_scanner</span>
            <div class="scan-hero__feature-content">
              <strong>Scan Instan</strong>
              <small>Hasil dalam &lt; 2 detik</small>
              <span>Scan makananmu dan dapatkan analisis gizi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</main>
```

- [ ] **Step 3: Jalankan verifier untuk memastikan kegagalan tinggal di CSS**

Run: `node tests/check-food-page.test.mjs`  
Expected: metadata, navbar, semantic content, CTA, dan image checks PASS; layout checks masih FAIL.

- [ ] **Step 4: Commit HTML**

```powershell
git add assets/pages/cek-makanan.html
git commit -m "feat: add semantic check food hero"
```

---

### Task 3: Implementasikan responsive Hero stylesheet

**Files:**
- Create: `assets/css/cek-makanan.css`
- Test: `tests/check-food-page.test.mjs`

**Interfaces:**
- Consumes: token global dan DOM BEM dari Task 2.
- Produces: grid desktop, bounded floating cards, tablet stack, dan mobile flow tanpa horizontal overflow.

- [ ] **Step 1: Tambahkan desktop layout dan visual styles**

Implementasikan selector berikut dengan nilai final:

```css
.scan-hero {
  padding-block: clamp(var(--space-10), 7vw, 7.5rem);
}

.scan-hero__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 33rem);
  align-items: center;
  width: min(calc(100% - (2 * var(--space-4))), var(--container-max));
  margin-inline: auto;
  column-gap: clamp(var(--space-10), 5vw, 4.5rem);
}

.scan-hero__content { min-width: 0; }

.scan-hero__badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
  padding: var(--space-2) var(--space-4);
  color: var(--color-primary);
  background: var(--color-surface-container-high);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-label);
}

.scan-hero__badge .material-symbols-outlined { font-size: var(--font-size-xl); }

.scan-hero__title {
  max-width: 11ch;
  margin: var(--space-10) 0 0;
  color: var(--color-black);
  font-size: clamp(3rem, 5vw, 4rem);
  font-weight: 500;
  line-height: 1.15;
  letter-spacing: var(--letter-spacing-display);
}

.scan-hero__title-line { display: block; }

.scan-hero__inline-logo {
  color: var(--color-primary);
  font-size: 0.9em;
  vertical-align: -0.1em;
  font-variation-settings: "FILL" 0, "wght" 500, "GRAD" 0, "opsz" 48;
}

.scan-hero__description {
  max-width: 52ch;
  margin: var(--space-16) 0 0;
  color: var(--color-on-surface-variant);
  font-size: var(--font-size-body-md);
  line-height: var(--line-height-body-lg);
}

.scan-hero__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3.5rem;
  margin-top: var(--space-10);
  padding: var(--space-4) var(--space-8);
  color: var(--color-on-primary);
  background: var(--color-on-primary-fixed);
  border-radius: var(--radius-full);
  font-size: var(--font-size-h2);
  font-weight: 500;
  line-height: var(--line-height-label);
  text-decoration: none;
  transition: background-color var(--transition-base), transform var(--transition-base);
}

.scan-hero__cta:is(:hover, :focus-visible) { background: var(--color-primary-hover); }
.scan-hero__cta:focus-visible { outline: 3px solid var(--color-primary); outline-offset: 3px; }
.scan-hero__cta:active { transform: translateY(1px); }

.scan-hero__visual {
  position: relative;
  width: 100%;
  max-width: 33rem;
  justify-self: end;
}

.scan-hero__image-frame {
  width: 100%;
  margin: 0;
  overflow: hidden;
  aspect-ratio: 528 / 576;
  border-radius: var(--radius-3xl);
}

.scan-hero__image { display: block; width: 100%; height: 100%; object-fit: cover; }

.scan-hero__feature { 
  position: absolute;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: var(--space-4);
  width: min(15rem, 46%);
  padding: var(--space-4);
  color: var(--color-on-surface);
  background: var(--color-surface-container-high);
  border: 0.5rem solid color-mix(in srgb, var(--color-white) 82%, transparent);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-md);
}

.scan-hero__feature--accuracy { top: 4.5rem; left: -4rem; }
.scan-hero__feature--instant { right: -4rem; bottom: 4.5rem; }

.scan-hero__score {
  display: grid;
  flex: 0 0 4.5rem;
  place-items: center;
  width: 4.5rem;
  aspect-ratio: 1;
  background: radial-gradient(closest-side, var(--color-surface-container-high) 78%, transparent 79%), conic-gradient(var(--color-primary) 99%, var(--color-primary-fixed-dim) 0);
  border-radius: var(--radius-full);
  font-weight: 600;
}

.scan-hero__feature-icon {
  display: grid;
  flex: 0 0 3.5rem;
  place-items: center;
  width: 3.5rem;
  aspect-ratio: 1;
  color: var(--color-primary);
  background: var(--color-primary-container);
  border-radius: var(--radius-full);
  font-size: var(--font-size-2xl);
}

.scan-hero__feature-content { display: grid; gap: var(--space-1); min-width: 0; }
.scan-hero__feature-content strong { font-weight: 500; line-height: var(--line-height-label); }
.scan-hero__feature-content span,
.scan-hero__feature-content small { color: var(--color-on-surface-variant); font-size: var(--font-size-label-sm); line-height: var(--line-height-h2); }
```

- [ ] **Step 2: Tambahkan tablet dan mobile rules**

```css
@media (max-width: 68rem) {
  .scan-hero__layout {
    grid-template-columns: minmax(0, 1fr);
    max-width: 48rem;
    row-gap: var(--space-16);
  }

  .scan-hero__content { text-align: center; }
  .scan-hero__badge { justify-content: center; }
  .scan-hero__title,
  .scan-hero__description { margin-inline: auto; }
  .scan-hero__visual { justify-self: center; }
  .scan-hero__feature--accuracy { left: var(--space-4); }
  .scan-hero__feature--instant { right: var(--space-4); }
}

@media (max-width: 48rem) {
  .scan-hero { padding-block: var(--space-10) var(--space-20); }

  .scan-hero__layout {
    grid-template-columns: minmax(0, 1fr);
    width: min(calc(100% - (2 * var(--space-4))), var(--container-max));
    row-gap: var(--space-12);
  }

  .scan-hero__content { text-align: center; }
  .scan-hero__title { max-width: 14ch; margin-top: var(--space-8); font-size: clamp(2.25rem, 10vw, 3rem); }
  .scan-hero__description { margin-top: var(--space-8); }
  .scan-hero__cta { width: 100%; }
  .scan-hero__visual { display: grid; gap: var(--space-4); }
  .scan-hero__image-frame { border-radius: var(--radius-2xl); }
  .scan-hero__feature-list { display: grid; gap: var(--space-4); }

  .scan-hero__feature {
    position: static;
    width: 100%;
    border-width: 0;
    box-shadow: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .scan-hero__cta { transition-duration: 1ms; }
}
```

- [ ] **Step 3: Jalankan verifier dan pastikan GREEN**

Run: `node tests/check-food-page.test.mjs`  
Expected: seluruh check PASS.

- [ ] **Step 4: Commit stylesheet**

```powershell
git add assets/css/cek-makanan.css
git commit -m "style: add responsive check food hero"
```

---

### Task 4: Verifikasi regresi dan kualitas akhir

**Files:**
- Verify: `assets/pages/cek-makanan.html`
- Verify: `assets/css/cek-makanan.css`
- Verify: `tests/check-food-page.test.mjs`

**Interfaces:**
- Consumes: seluruh output Tasks 1-3.
- Produces: bukti bahwa halaman baru lulus kontrak tanpa mengubah landing/global.

- [ ] **Step 1: Jalankan seluruh tracked test**

```powershell
$tests = git ls-files 'tests/*.test.mjs'
foreach ($test in $tests) {
  node $test
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
```

Expected: seluruh tracked test PASS.

- [ ] **Step 2: Periksa sintaks modul dan diff hygiene**

```powershell
$modules = git ls-files '*.mjs'
foreach ($module in $modules) {
  node --check $module
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
git diff --check
```

Expected: tidak ada syntax error atau whitespace error.

- [ ] **Step 3: Jalankan verifier situs dan catat baseline exceptions**

Run: `node tests/verify-site.mjs`  
Expected: path `assets/pages/cek-makanan.html` tetap resolved. Jika verifier legacy masih gagal pada kontrak landing yang tidak berkaitan, catat hasilnya tanpa mengubah landing page.

- [ ] **Step 4: Periksa perubahan hanya pada scope**

Run: `git diff --name-only HEAD~3..HEAD`  
Expected: hanya design/plan docs, `assets/pages/cek-makanan.html`, `assets/css/cek-makanan.css`, dan `tests/check-food-page.test.mjs`.

- [ ] **Step 5: Commit koreksi verifikasi jika diperlukan**

Jika koreksi hanya menyentuh tiga file implementasi yang disetujui:

```powershell
git add assets/pages/cek-makanan.html assets/css/cek-makanan.css tests/check-food-page.test.mjs
git commit -m "fix: finalize check food hero contract"
```

