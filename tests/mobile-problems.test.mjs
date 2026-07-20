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
  for (let cursor = openingBrace; cursor < source.length; cursor += 1) {
    if (source[cursor] === '{') depth += 1;
    if (source[cursor] === '}') depth -= 1;
    if (depth === 0) return source.slice(openingBrace + 1, cursor);
  }
  return '';
}

function readLastCssBlock(source, marker) {
  const markerIndex = source.lastIndexOf(marker);
  return markerIndex < 0 ? '' : readCssBlock(source.slice(markerIndex), marker);
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

const mobileCss = readLastCssBlock(landingCss, '@media (max-width: 48rem)');
const mobileProblems = readCssBlock(mobileCss, '.problems');
const mobileLayout = readCssBlock(mobileCss, '.problems__layout');
const mobileEyebrow = readCssBlock(mobileCss, '.problems__eyebrow');
const mobileTitle = readCssBlock(mobileCss, '.problems__title');
const mobileMedia = readCssBlock(mobileCss, '.problems__media');
const mobileList = readCssBlock(mobileCss, '.problems__list');
const mobileCard = readCssBlock(mobileCss, '.problem-card');
const mobileCardTitle = readCssBlock(mobileCss, '.problem-card__title');
const mobileCardDescription = readCssBlock(
  mobileCss,
  '.problem-card__description',
);
const hoverCss = readCssBlock(
  landingCss,
  '@media (hover: hover) and (pointer: fine)',
);
const baseCard = readCssBlock(landingCss, '.problem-card');
const baseIcon = readCssBlock(landingCss, '\n.problem-card__icon {');

check('mobile Problems reuses the project 48rem breakpoint', () =>
  mobileCss.length > 0,
);

check('Hero margin is the single mobile section gap source', () =>
  /padding-block:\s*0\s+var\(--space-24\)/.test(mobileProblems)
  && !/margin-(?:block-)?start/.test(mobileProblems),
);

check('mobile Problems stays in a one-column normal flow', () =>
  /grid-template-columns:\s*minmax\(0,\s*1fr\)/.test(mobileLayout)
  && !/position:\s*absolute/.test(mobileLayout),
);

check('mobile eyebrow and heading use the approved fluid typography', () =>
  /font-size:\s*clamp\(0\.6875rem,\s*2\.8vw,\s*0\.75rem\)/.test(mobileEyebrow)
  && /letter-spacing:\s*0\.08em/.test(mobileEyebrow)
  && /width:\s*100%/.test(mobileTitle)
  && /max-width:\s*12ch/.test(mobileTitle)
  && /margin-top:\s*var\(--space-6\)/.test(mobileTitle)
  && /font-size:\s*clamp\(2rem,\s*8\.5vw,\s*2\.5rem\)/.test(mobileTitle)
  && /line-height:\s*1\.08/.test(mobileTitle)
  && /letter-spacing:\s*-0\.02em/.test(mobileTitle),
);

check('mobile Problem image fills the container without changing crop', () =>
  /width:\s*100%/.test(mobileMedia)
  && /max-width:\s*none/.test(mobileMedia)
  && /margin-top:\s*var\(--space-8\)/.test(mobileMedia)
  && /aspect-ratio:\s*608\s*\/\s*432/.test(landingCss)
  && /object-fit:\s*cover/.test(landingCss),
);

check('mobile Problem cards are intrinsic and use token gaps', () =>
  /gap:\s*var\(--space-4\)/.test(mobileList)
  && /margin-top:\s*var\(--space-8\)/.test(mobileList)
  && /padding-top:\s*0/.test(mobileList)
  && /height:\s*auto/.test(mobileCard)
  && /padding:\s*clamp\(var\(--space-5\),\s*5vw,\s*var\(--space-6\)\)/.test(mobileCard),
);

check('mobile card text uses the approved fluid ranges', () =>
  /font-size:\s*clamp\(1\.125rem,\s*4\.8vw,\s*1\.375rem\)/.test(mobileCardTitle)
  && /line-height:\s*1\.2/.test(mobileCardTitle)
  && /font-size:\s*clamp\(0\.875rem,\s*3\.6vw,\s*1rem\)/.test(mobileCardDescription)
  && /line-height:\s*1\.5/.test(mobileCardDescription),
);

check('base cards and icons do not animate on touch devices', () =>
  /transition:\s*none/.test(baseCard)
  && /transition:\s*none/.test(baseIcon),
);

check('all decorative hover states are pointer-capability gated', () =>
  /\.problem-card\s*\{[^}]*transition:/s.test(hoverCss)
  && /\.problem-card:hover\s*\{[^}]*background-color:[^}]*translate:[^}]*box-shadow:/s.test(hoverCss)
  && /\.problem-card:hover\s+\.problem-card__icon\s*\{[^}]*background-color:/s.test(hoverCss)
  && !/^\s*\.problem-card:is\(:hover,\s*:focus-within\)/m.test(landingCss),
);

check('Problems HTML semantics and content order remain unchanged', () =>
  /<section\b[^>]*class="problems"[^>]*aria-labelledby="problems-title"/i.test(index)
  && /problems__eyebrow[\s\S]*?problems__title[\s\S]*?problems__media[\s\S]*?problems__list/i.test(index)
  && (index.match(/class="problem-card"/g) ?? []).length === 3,
);

if (failures.length) {
  console.error(`\n${failures.length} mobile Problems check(s) failed.`);
  process.exitCode = 1;
} else {
  console.log('\nAll mobile Problems checks passed.');
}
