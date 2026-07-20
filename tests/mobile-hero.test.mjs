import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const landingCss = readFileSync(
  resolve(projectRoot, 'assets/css/landing-page.css'),
  'utf8',
);
const index = readFileSync(resolve(projectRoot, 'index.html'), 'utf8');
const failures = [];

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

function check(name, predicate) {
  try {
    assert.ok(predicate(), name);
    console.log(`PASS ${name}`);
  } catch {
    failures.push(name);
    console.error(`FAIL ${name}`);
  }
}

const mobileCss = readCssBlock(landingCss, '@media (max-width: 48rem)');
const mobileHero = readCssBlock(mobileCss, '.hero');
const mobileContent = readCssBlock(mobileCss, '.hero__content');
const mobileTitle = readCssBlock(mobileCss, '.hero__title');
const mobileTitleBreak = readCssBlock(mobileCss, '.hero__title br');
const mobileDescription = readCssBlock(mobileCss, '.hero__description');
const mobileActions = readCssBlock(mobileCss, '.hero__actions');
const mobilePrimary = readCssBlock(mobileCss, '.hero__cta--primary');
const desktopHero = readCssBlock(landingCss, '.hero');
const desktopArtwork = readCssBlock(landingCss, '.hero__artwork');

function compact(source) {
  return source.replace(/\s+/g, '');
}

check('mobile Hero reuses the approved 48rem breakpoint', () =>
  mobileCss.length > 0
  && !landingCss.includes('@media (max-width: 48.0625rem)'),
);

check('mobile Hero uses content-driven height and token spacing', () =>
  /^\s*height:\s*auto/m.test(mobileHero)
  && /min-height:\s*auto/.test(mobileHero)
  && /margin-top:\s*var\(--space-10\)/.test(mobileHero),
);

check('Hero retains the safe token-based container gutter', () =>
  compact(desktopHero).includes(
    'width:min(calc(100%-(2*var(--space-4))),var(--container-max));',
  )
  && !/width:\s*100vw/.test(mobileHero),
);

check('mobile Hero content stays centered in normal flow', () =>
  /width:\s*100%/.test(mobileContent)
  && /transform:\s*none/.test(mobileContent)
  && !/position:\s*absolute/.test(mobileContent),
);

check('mobile heading uses the approved fluid type range', () =>
  /width:\s*100%/.test(mobileTitle)
  && /max-width:\s*20ch/.test(mobileTitle)
  && /margin-top:\s*var\(--space-6\)/.test(mobileTitle)
  && /font-size:\s*clamp\(2rem,\s*9vw,\s*2\.375rem\)/.test(mobileTitle)
  && /line-height:\s*1\.08/.test(mobileTitle),
);

check('mobile heading balances lines without the forced desktop break', () =>
  /text-wrap:\s*balance/.test(mobileTitle)
  && /display:\s*none/.test(mobileTitleBreak),
);

check('mobile description keeps a readable centered measure', () =>
  /width:\s*100%/.test(mobileDescription)
  && /max-width:\s*34ch/.test(mobileDescription)
  && /margin-top:\s*var\(--space-6\)/.test(mobileDescription)
  && /line-height:\s*var\(--line-height-body-md\)/.test(mobileDescription),
);

check('mobile actions expose one full-width primary CTA', () =>
  /width:\s*100%/.test(mobileActions)
  && /margin-top:\s*var\(--space-10\)/.test(mobileActions)
  && /width:\s*100%/.test(mobilePrimary)
  && /min-height:\s*3\.5rem/.test(mobilePrimary)
  && /\.hero__cta--secondary\s*,\s*\.hero__artwork\s*\{[^}]*display:\s*none/s.test(mobileCss),
);

check('desktop artwork base rule remains a grid', () =>
  /display:\s*grid/.test(desktopArtwork),
);

check('semantic Hero content and destinations remain in HTML', () =>
  /<section\b[^>]*class="hero"[^>]*aria-labelledby="hero-title"/i.test(index)
  && /href="assets\/pages\/cek-makanan\.html"[\s\S]*?hero__cta--primary/i.test(index)
  && /href="assets\/pages\/resep-galeri\.html"[\s\S]*?hero__cta--secondary/i.test(index)
  && /<div\b[^>]*class="hero__artwork"/i.test(index),
);

if (failures.length) {
  console.error(`\n${failures.length} mobile Hero check(s) failed.`);
  process.exitCode = 1;
} else {
  console.log('\nAll mobile Hero checks passed.');
}
