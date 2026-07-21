import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const index = readFileSync(resolve(root, 'index.html'), 'utf8');
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

if (failures.length > 0) {
  console.error(`\n${failures.length} Hero intro check(s) failed.`);
  process.exitCode = 1;
} else {
  console.log('\nAll Hero intro checks passed.');
}
