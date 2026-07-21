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
  && /name="description"[\s\S]*content="Analisis makanan/.test(page)
  && page.indexOf('../css/global.css') >= 0
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

check('Hero visual is accessible and prioritized', () => {
  const image = page.match(/<img[^>]*class="scan-hero__image"[^>]*>/)?.[0] ?? '';

  return /alt="Makanan sehat sebagai contoh analisis nutrisi NutLens"/.test(image)
    && /width="528"/.test(image)
    && /height="576"/.test(image)
    && /decoding="async"/.test(image)
    && /fetchpriority="high"/.test(image)
    && !/loading="lazy"/.test(image)
    && /scan-hero__feature--accuracy[\s\S]*99%[\s\S]*Akurasi Tinggi/.test(page)
    && /scan-hero__feature--instant[\s\S]*Scan Instan[\s\S]*Hasil dalam &lt; 2 detik/.test(page);
});

check('desktop layout uses proportional grid and bounded floating cards', () =>
  /\.scan-hero__layout\s*\{[^}]*display:\s*grid[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+minmax\(0,\s*33rem\)/s.test(css)
  && /\.scan-hero__visual\s*\{[^}]*position:\s*relative/s.test(css)
  && /\.scan-hero__feature\s*\{[^}]*position:\s*absolute/s.test(css)
  && /\.scan-hero__image-frame\s*\{[^}]*aspect-ratio:\s*528\s*\/\s*576/s.test(css)
  && !/height:\s*100(?:s|d|l)?vh/.test(css),
);

check('mobile layout stacks safely, hides the image frame, and restores cards to flow', () => {
  const mobileStart = css.indexOf('@media (max-width: 48rem)');
  const mobile = mobileStart >= 0 ? css.slice(mobileStart) : '';

  return /\.scan-hero__layout\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s.test(mobile)
    && /\.scan-hero__content\s*\{[^}]*text-align:\s*center/s.test(mobile)
    && /\.scan-hero__cta\s*\{[^}]*width:\s*100%/s.test(mobile)
    && /\.scan-hero__image-frame\s*\{[^}]*display:\s*none/s.test(mobile)
    && /\.scan-hero__feature\s*\{[^}]*position:\s*static/s.test(mobile);
});

if (failures.length) {
  console.error(`\n${failures.length} Cek Makanan check(s) failed.`);
  process.exitCode = 1;
} else {
  console.log('\nAll Cek Makanan checks passed.');
}
