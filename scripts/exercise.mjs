// Headless exercise of the running app: filters, spoiler shield, counters, notes,
// roadmap, missables, planner, export/import, persistence and offline-ness.
// Run: node scripts/exercise.mjs   (expects node serve.ts on :8080)

import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
const require = createRequire('/home/boxd/makefun/tools/package.json');
const { chromium } = require('playwright-core');

const CHROME = '/home/boxd/.hermes/tools/chromium-1248/chrome-linux64/chrome';
const BASE = 'http://localhost:8080';
const SCRATCH = '/home/boxd/.hermes/profiles/makefun/cache/scratch';
mkdirSync(SCRATCH, { recursive: true });

let failures = 0;
function check(name, ok, extra = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? `  (${extra})` : ''}`);
  if (!ok) failures++;
}

const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const requests = [];
page.on('request', (r) => requests.push(r.url()));

await page.goto(`${BASE}/#/checklist`);
await page.waitForSelector('.trow');

// 1. Full list renders.
check('55 trophy rows', await page.locator('.trow').count() === 55);

// 2. Fresh save: header 0/55, all 29 story trophies masked by the shield.
check('header starts 0/55', (await page.locator('#progress .big').innerText()).includes('0'));
check('29 masked story rows', await page.locator('.trow.masked').count() === 29);

// 3. Guide pane opens on The Shootist with two visible sources.
check('guide pane: The Shootist', (await page.locator('.pane h2').innerText()) === 'The Shootist');
check('guide pane: 2 sources', await page.locator('.pane .sources a').count() === 2);

// 4. Search (non-masked trophy).
await page.fill('input[data-focus="search"]', 'waink');
check('search waink -> 1 row', await page.locator('.trow').count() === 1);
await page.fill('input[data-focus="search"]', '');

// 5. Kind filter: missable -> 8; grade filter: silver -> 6.
await page.click('.chip[data-kind="missable"]');
check('missable filter -> 8 rows', await page.locator('.trow').count() === 8);
await page.click('.chip[data-kind="all"]');
await page.selectOption('.toolbar select', 'silver');
check('silver filter -> 6 rows', await page.locator('.trow').count() === 6);
await page.selectOption('.toolbar select', 'all');

// 6. Earn a trophy via its checkbox; header updates.
await page.locator('.trow', { hasText: 'On the Spot' }).locator('input[type="checkbox"]').check();
check('earn On the Spot -> 1/55', (await page.locator('#progress .big').innerText()).includes('1'));

// 7. Counter to target auto-earns (On the Spot, target 10).
await page.locator('.trow', { hasText: 'On the Spot' }).click();
await page.fill('.pane input[data-focus="counter"]', '10');
await page.press('.pane input[data-focus="counter"]', 'Tab');
check('counter 10/10 auto-earns', (await page.locator('#progress .big').innerText()).includes('1'));
check('counter shows 10 / 10', (await page.locator('.pane .counterbox').innerText()).includes('10 / 10'));

// 8. Spoiler shield: masked row reveals when marked earned.
const maskedBefore = await page.locator('.trow.masked').count();
await page.evaluate(() => document.querySelector('.trow.masked input[type="checkbox"]').click());
check('mask lifts on earn', await page.locator('.trow.masked').count() === maskedBefore - 1);

// 9. Notes persist across reload.
await page.locator('.trow', { hasText: 'The Shootist' }).click();
await page.fill('.pane textarea[data-focus="note"]', 'exercise note: pistol stages are slow');
await page.press('.pane textarea[data-focus="note"]', 'Tab');
await page.reload();
await page.waitForSelector('.trow');
await page.locator('.trow', { hasText: 'The Shootist' }).click();
check('note persists', (await page.locator('.pane textarea').inputValue()).includes('exercise note'));

// 10. Roadmap: 7 stages with progress.
await page.goto(`${BASE}/#/roadmap`);
await page.waitForSelector('.stage');
check('roadmap 7 stages', await page.locator('.stage').count() === 7);
check('roadmap stage progress text', (await page.locator('.stage-count').first().innerText()).includes('/'));

// 11. Missables: 8 flagged rows.
await page.goto(`${BASE}/#/missables`);
await page.waitForSelector('.mrow');
check('missables 8 rows', await page.locator('.mrow').count() === 8);

// 12. Planner: 5 suggestions, queue add persists.
await page.goto(`${BASE}/#/planner`);
await page.waitForSelector('.sugg');
check('planner 5 suggestions', await page.locator('.sugg').count() === 5);
await page.locator('.sugg .btn', { hasText: 'Add' }).first().click();
await page.reload();
await page.waitForSelector('.qrow');
check('queue persists (1 row)', await page.locator('.qrow').count() === 1);

// 13. Settings: export downloads a JSON save; import restores it.
await page.goto(`${BASE}/#/settings`);
await page.waitForSelector('.setrow');
const [download] = await Promise.all([
  page.waitForEvent('download'),
  page.click('button:has-text("Export save")'),
]);
const savePath = `${SCRATCH}/exercise-save.json`;
await download.saveAs(savePath);
check('export filename', download.suggestedFilename() === 'leonida-legend-save.json');

// Reset, then import the exported file back.
page.once('dialog', (d) => d.accept());
await page.click('button:has-text("Reset")');
await page.waitForFunction(() => document.querySelector('#progress .big')?.textContent.includes('0'));
await page.setInputFiles('#import-file', savePath);
await page.waitForSelector('.msg.ok');
check('import restores save', (await page.locator('.msg.ok').innerText()).includes('Imported'));
check('import restored earned count', !(await page.locator('#progress .big').innerText()).includes('0'));

// 14. Shield toggle changes masking live.
await page.goto(`${BASE}/#/checklist`);
await page.waitForSelector('.trow');
const maskedOn = await page.locator('.trow.masked').count();
await page.goto(`${BASE}/#/settings`);
await page.waitForSelector('.setrow');
await page.evaluate(() => document.querySelector('.setrow .switch input').click());
await page.goto(`${BASE}/#/checklist`);
await page.waitForSelector('.trow');
check('shield off un.masks all', await page.locator('.trow.masked').count() === 0 && maskedOn > 0);

// 15. Offline: every request stayed on our own origin.
const foreign = requests.filter((u) => !u.startsWith(BASE) && !u.startsWith('data:'));
check('no foreign requests', foreign.length === 0, foreign.slice(0, 3).join(', '));

await browser.close();
console.log(failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
