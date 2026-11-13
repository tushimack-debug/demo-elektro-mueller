import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const read = path => readFileSync(path, 'utf8');
test('All HTML pages keep demo indexing, language and restrictive defaults', () => {
  for (const file of ['index.html','impressum.html','datenschutz.html']) {
    const html = read(file);
    assert.match(html, /lang="de"/);
    assert.match(html, /noindex, nofollow/);
    assert.match(html, /Content-Security-Policy/);
    assert.match(html, /connect-src 'none'/);
    assert.match(html, /object-src 'none'/);
    assert.match(html, /name="referrer" content="no-referrer"/);
    for (const link of html.matchAll(/(?:href|src)="([^"#?:]+)"/g)) assert.ok(existsSync(link[1]), link[1]);
    for (const link of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) assert.match(link[0], /rel="[^"]*noopener/);
  }
});
test('No inline scripts and no 3D runtime', () => {
  const html = read('index.html');
  assert.doesNotMatch(html, /<script(?![^>]*\bsrc=)[^>]*>/);
  assert.doesNotMatch(html, /importmap|three|webgl/i);
  assert.ok(!existsSync('scene.js') && !existsSync('vendor'));
  assert.match(html, /script-src 'self';/);
  assert.match(read('_headers'), /script-src 'self';/);
});
test('Tracked source has no known token or private-key patterns', () => {
  const files = execFileSync('git', ['ls-files','-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
  const patterns = [/gh[pousr]_[A-Za-z0-9]{30,}/, /github_pat_[A-Za-z0-9_]{50,}/, /AKIA[A-Z0-9]{16}/, /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, /sk-[A-Za-z0-9]{32,}/];
  for (const file of files.filter(f => !/\.ttf$/.test(f))) for (const pattern of patterns) assert.ok(!pattern.test(read(file)), `Potential secret in ${file}`);
});
test('Local font loading and independent app entry point', () => {
  assert.match(read('styles.css'), /url\("fonts\/Fraunces.ttf"\)/);
  assert.doesNotMatch(read('index.html'), /fonts\.googleapis|unpkg|jsdelivr/);
  assert.match(read('index.html'), /src="app.js"/);
});
test('Available Git history has no known token or private-key patterns', () => {
  const commits = execFileSync('git', ['rev-list','--all'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const pattern = /gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,}|AKIA[A-Z0-9]{16}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|sk-[A-Za-z0-9]{32,}/;
  for (const commit of commits) {
    const files = execFileSync('git', ['ls-tree','-r','--name-only',commit], { encoding: 'utf8' }).trim().split('\n');
    for (const file of files.filter(f => f && !/\.ttf$/.test(f))) {
      const contents = execFileSync('git', ['show',`${commit}:${file}`], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
      assert.ok(!pattern.test(contents), `Potential secret in history: ${commit}:${file}`);
    }
  }
});
