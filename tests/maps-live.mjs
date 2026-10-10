import { chromium } from 'playwright';
import { serve } from '../scripts/serve.mjs';
import { mkdirSync } from 'node:fs';
import assert from 'node:assert/strict';
const server = serve(0);
await new Promise(r => server.once('listening', r));
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const errors = [], external = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('request', req => { if (new URL(req.url()).hostname.endsWith('google.com')) external.push(req.url()); });
  page.on('requestfailed', req => console.log('FAILED',req.url(),req.failure()?.errorText));
  page.on('response', response => { if (response.request().isNavigationRequest()) console.log('NAV',response.status(),response.url()); });
  await page.goto(process.env.MAPS_TEST_URL || `http://127.0.0.1:${server.address().port}`);
  assert.equal(external.length,0,'No Google request before consent');
  await page.locator('#map-load').click();
  const frame = await (await page.locator('#map-content iframe').elementHandle()).contentFrame();
  await frame.waitForURL('https://www.google.com/maps/embed?*', { timeout: 30000 });
  await frame.getByText('In Maps öffnen', { exact: true }).first().waitFor({ timeout: 30000 });
  await page.waitForTimeout(3000);
  assert.deepEqual(errors.filter(error => /Content Security Policy|ERR_BLOCKED_BY_CSP/i.test(error)), []);
  console.log('FRAMES', page.frames().map(frame => frame.url()));
  mkdirSync('test-results', { recursive:true });
  await page.locator('#map-hold').screenshot({path:'test-results/maps-live.png'});
  await page.locator('#map-remove').click();
  assert.equal(await page.locator('#map-content iframe').count(),0);
  console.log('Real Google Maps loaded and removed successfully');
} finally { await browser.close(); server.close(); }
