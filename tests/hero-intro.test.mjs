import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const index = readFileSync(resolve(root, 'index.html'), 'utf8');
const landingCss = readFileSync(
  resolve(root, 'assets/css/landing-page.css'),
  'utf8',
);
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

check('early bootstrap is fail-safe and session-scoped', () =>
  /nutlens-hero-intro-played/.test(index)
  && /matchMedia\(["']\(max-width:\s*48rem\)["']\)/.test(index)
  && /matchMedia\([\s\S]*["']\(prefers-reduced-motion:\s*reduce\)["']/.test(index)
  && /classList\.add\(["']hero-intro-pending["']\)/.test(index)
  && /classList\.remove\([\s\S]*hero-intro-pending[\s\S]*hero-intro-playing/.test(index)
  && /try\s*\{[\s\S]*sessionStorage[\s\S]*\}\s*catch/.test(index),
);

check('motion wrapper owns only composited entrance properties', () =>
  /\.hero__image-motion\s*\{[^}]*width:\s*100%[^}]*height:\s*100%[^}]*overflow:\s*hidden/s.test(landingCss)
  && /\.hero-intro-pending\s+\.hero__image-motion\s*\{[^}]*opacity:\s*0[^}]*translateY\(var\(--hero-intro-distance\)\)[^}]*scale\(0\.98\)/s.test(landingCss)
  && /\.hero-intro-playing\s+\.hero__image-motion\s*\{[^}]*opacity:\s*1[^}]*translateY\(0\)[^}]*scale\(1\)[^}]*cubic-bezier\(0\.22,\s*1,\s*0\.36,\s*1\)/s.test(landingCss),
);

check('main, side, outer, and ghost timing follows the approved order', () =>
  /\.hero__image--main\s*\{[^}]*--hero-intro-distance:\s*28px[^}]*--hero-intro-delay:\s*350ms/s.test(landingCss)
  && /\.hero__image--side\s*\{[^}]*--hero-intro-distance:\s*36px[^}]*--hero-intro-delay:\s*520ms/s.test(landingCss)
  && /\.hero__image--outer\s*\{[^}]*--hero-intro-distance:\s*44px[^}]*--hero-intro-delay:\s*680ms/s.test(landingCss)
  && /--hero-ghost-delay:\s*820ms/.test(landingCss),
);

check('mobile and reduced-motion states cannot reveal or animate artwork', () =>
  /@media\s*\(max-width:\s*48rem\)[\s\S]*?\.hero__artwork\s*\{[^}]*display:\s*none/s.test(landingCss)
  && /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.hero__image-motion[\s\S]*?opacity:\s*1[\s\S]*?transform:\s*none[\s\S]*?transition:\s*none/s.test(landingCss),
);

if (failures.length > 0) {
  console.error(`\n${failures.length} Hero intro check(s) failed.`);
  process.exitCode = 1;
} else {
  console.log('\nAll Hero intro checks passed.');
}
