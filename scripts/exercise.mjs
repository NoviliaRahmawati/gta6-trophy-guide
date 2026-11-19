// Headless exercise of the running app: stage-grouped checklist, filters with
// counts, spoiler shield (header toggle), missable warning pane, counters, notes,
// roadmap, missables page, planner, export/import, persistence and offline-ness.
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

// 1. Full list renders, grouped into the 9 roadmap stages.
check('55 trophy rows', await page.locator('.trow').count() === 55);
check('9 stage bands', await page.locator('.stage-band').count() === 9);

// 2. Fresh save: header 0/55; the 28 PlayStation-hidden trophies are masked.
check('header starts 0/55', (await page.locator('#progress .big').innerText()).includes('0'));
check('28 masked rows', await page.locator('.trow.masked').count() === 28);
check('shield toggle shows count', (await page.locator('.shield-btn').innerText()).includes('Spoilers hidden — 28'));

// 3. Default pane: the missable Positive Mental Attitude with red warning + sources.
check('pane opens on Positive Mental Attitude', (await page.locator('.pane h2').innerText()) === 'Positive Mental Attitude');
check('red missable warning present', await page.locator('.pane .warnbox').count() === 1);
check('warning names the window', (await page.locator('.pane .warnbox').innerText()).includes('Chapter 1'));
check('pane has >= 5 named sources', await page.locator('.pane .sources a').count() >= 5);
check('pane has numbered steps', await page.locator('.pane ol.steps li').count() >= 3);
check('pane has PSN counter', await page.locator('.pane .counterbox').count() === 1);

// 4. Search (non-masked trophy).
await page.fill('input[data-focus="search"]', 'waink');
check('search waink -> 1 row', await page.locator('.trow').count() === 1);
await page.fill('input[data-focus="search"]', '');

// 5. Kind filter: missable -> 1; grade filter: silver -> 6. Pill counts visible.
check('missable pill count is 1', (await page.locator('.chip[data-kind="missable"]').innerText()).includes('1'));
await page.click('.chip[data-kind="missable"]');
check('missable filter -> 1 row', await page.locator('.trow').count() === 1);
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
check('counter shows 10 / 10', (await page.locator('.pane .counterbox').innerText()).includes('10 / 10'));

// 8. Spoiler shield: a masked row reveals when marked earned.
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

// 10. Roadmap: 9 stages with progress and the missable window callout.
await page.goto(`${BASE}/#/roadmap`);
await page.waitForSelector('.stage');
check('roadmap 9 stages', await page.locator('.stage').count() === 9);
check('roadmap stage progress text', (await page.locator('.stage-count').first().innerText()).includes('/'));
check('roadmap flags the missable window', (await page.locator('.stage-miss').first().innerText()).includes('Chapter 1'));

// 11. Missables page: 1 flagged card + the 6-item watchlist.
await page.goto(`${BASE}/#/missables`);
await page.waitForSelector('.mcard');
check('missables 1 card', await page.locator('.mcard').count() === 1);
check('missables watchlist 6 items', await page.locator('.watch').count() === 6);
check('missable card names point of no return', (await page.locator('.mcard .warnbox').innerText()).includes('Point of no return'));

// 12. Planner: 5 suggestions (missable first), queue add persists.
await page.goto(`${BASE}/#/planner`);
await page.waitForSelector('.sugg');
check('planner 5 suggestions', await page.locator('.sugg').count() === 5);
check('missable suggested first', (await page.locator('.sugg .s-name').first().innerText()).includes('Positive Mental Attitude'));
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

page.once('dialog', (d) => d.accept());
await page.click('button:has-text("Reset")');
await page.waitForFunction(() => document.querySelector('#progress .big')?.textContent.includes('0'));
await page.setInputFiles('#import-file', savePath);
await page.waitForSelector('.msg.ok');
check('import restores save', (await page.locator('.msg.ok').innerText()).includes('Imported'));
check('import restored earned count', !(await page.locator('#progress .big').innerText()).includes('0'));

// 14. Header shield toggle changes masking live.
await page.goto(`${BASE}/#/checklist`);
await page.waitForSelector('.trow');
const maskedOn = await page.locator('.trow.masked').count();
await page.click('.shield-btn');
check('shield off unmasks all', await page.locator('.trow.masked').count() === 0 && maskedOn > 0);
await page.click('.shield-btn');
check('shield on re-masks', await page.locator('.trow.masked').count() === maskedOn);

// 15. Offline: every request stayed on our own origin.
const foreign = requests.filter((u) => !u.startsWith(BASE) && !u.startsWith('data:'));
check('no foreign requests', foreign.length === 0, foreign.slice(0, 3).join(', '));

await browser.close();
console.log(failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
