import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const index = readFileSync(resolve(projectRoot, 'index.html'), 'utf8');
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

if (failures.length) {
  console.error(`\n${failures.length} mobile navigation check(s) failed.`);
  process.exitCode = 1;
} else {
  console.log('\nAll mobile navigation checks passed.');
}
