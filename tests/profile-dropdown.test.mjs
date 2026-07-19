import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

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

const index = read('index.html');
const profileDropdownModulePath = resolve(root, 'assets/js/profile-dropdown.mjs');
const profileDropdownModuleExists = existsSync(profileDropdownModulePath);
const profilePagePath = resolve(root, 'assets/pages/profil.html');
const profilePageExists = existsSync(profilePagePath);
const profilePage = profilePageExists ? read('assets/pages/profil.html') : '';

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

if (failures.length > 0) {
  console.error(`\n${failures.length} profile dropdown check(s) failed.`);
  process.exitCode = 1;
} else {
  console.log('\nAll profile dropdown checks passed.');
}
