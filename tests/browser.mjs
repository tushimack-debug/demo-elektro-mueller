import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync } from 'node:fs';
import { serve } from '../scripts/serve.mjs';
const server = serve(0);
await new Promise(resolve => server.once('listening', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
mkdirSync('test-results', { recursive: true });
let checks = 0;
try {
  for (const width of [320,390,768,1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    const errors = [], external = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('request', req => { if (!req.url().startsWith(origin) && !req.url().startsWith('data:')) external.push(req.url()); });
    await page.goto(origin);
    await page.waitForTimeout(200);
    assert.equal(external.length, 0, 'No external requests before consent');
    assert.equal(await page.locator('iframe').count(), 0);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `No overflow at ${width}`);
    await page.evaluate(readFileSync('node_modules/axe-core/axe.min.js','utf8'));
    const results = await page.evaluate(() => axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21aa'] } }));
    assert.deepEqual(results.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })), []);
    if (width < 800) {
      await page.getByRole('button', { name: 'Menü', exact: true }).click();
      assert.equal(await page.locator('#nav').isVisible(), true);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('.nav-toggle').getAttribute('aria-expanded'), 'false');
    }
    await page.screenshot({ path: `test-results/home-${width}.png`, fullPage: true });
    assert.deepEqual(errors, []);
    await context.close(); checks++;
  }
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  await page.route('https://www.google.com/**', route => route.fulfill({ status: 200, contentType: 'text/html', body: '<p>Test map</p>' }));
  await page.goto(origin);
  await page.locator('#map-load').click();
  assert.equal(await page.locator('iframe').count(), 1);
  await page.frameLocator('#map-content iframe').getByText('Test map', { exact: true }).waitFor();
  assert.equal(await page.locator('iframe').getAttribute('referrerpolicy'), 'no-referrer');
  await page.locator('#map-remove').click();
  assert.equal(await page.locator('iframe').count(), 0); checks++;
  assert.deepEqual(errors, []); checks++;
  const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 900 } });
  const np = await nojs.newPage(); await np.goto(origin);
  assert.equal(await np.locator('h1').isVisible(), true);
  assert.equal(await np.locator('iframe').count(), 0);
  assert.equal(await np.locator('#nav').isVisible(), true);
  await nojs.close(); checks++;
  await page.goto(origin);
  await page.locator('button[type="submit"]').click();
  assert.equal(await page.locator('input[name="name"]').evaluate(input => input.validity.valueMissing), true);
  assert.equal(await page.locator('#form-status').textContent(), '');
  await page.locator('input[name="name"]').fill('Test & Rückfrage');
  await page.locator('textarea').fill('<script>alert(1)</script> & Frage');
  await page.locator('input[type="checkbox"]').check();
  await page.locator('button[type="submit"]').click();
  assert.match(await page.locator('#form-status').textContent(), /noch nicht versendet/);
  assert.equal(await page.locator('script:not([src])').count(), 0); checks++;
  for (const file of ['impressum.html','datenschutz.html']) {
    await page.goto(`${origin}/${file}`);
    await page.evaluate(readFileSync('node_modules/axe-core/axe.min.js','utf8'));
    const violations = await page.evaluate(() => axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21aa'] } }).then(r => r.violations.map(v => v.id)));
    assert.deepEqual(violations, []); checks++;
  }
  console.log(`Passed ${checks} browser scenarios (including automated accessibility checks)`);
} finally { await browser.close(); server.close(); }
