// Take the four entry screenshots: real renders of the app at 1280x800, JPEG q82.
// Seeds progress through the app's own localStorage save format (13/55 earned,
// counters part-way). Run: node scripts/shoot.mjs   (expects node serve.ts on :8080)

import { createRequire } from 'node:module';
import { statSync, unlinkSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const require = createRequire('/home/boxd/makefun/tools/package.json');
const { chromium } = require('playwright-core');

const CHROME = '/home/boxd/.hermes/tools/chromium-1248/chrome-linux64/chrome';
const BASE = 'http://localhost:8080';
const SHOTS = join(process.cwd(), 'screenshots');
const KEY = 'leonida-legend-save-v1';

const seed = {
  v: 1,
  earned: Object.fromEntries([2, 3, 4, 5, 8, 9, 10, 16, 20, 21, 22, 24, 27].map((id) => [id, '2026-11-19T12:00:00.000Z'])),
  counters: { 14: 22, 15: 87, 17: 12, 18: 5, 19: 8, 25: 3, 28: 7, 30: 1, 31: 34, 32: 18, 35: 61, 40: 2, 42: 23, 43: 4, 48: 214, 52: 84000, 53: 36500, 54: 3, 55: 6 },
  notes: {
    17: 'Gold on 12/42 so far — the timed pistol stages are the slow ones.',
    31: 'WAiNK spots cluster along the beach strip; sweep south first.',
  },
  settings: { spoilerShield: true, hideEarned: false },
  queue: [29, 33, 34, 17, 31],
};

// Replace the starter's screenshots.
for (const f of readdirSync(SHOTS)) {
  if (/\.(png|jpe?g)$/i.test(f)) unlinkSync(join(SHOTS, f));
}

const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

async function setSave(shield) {
  const save = { ...seed, settings: { ...seed.settings, spoilerShield: shield } };
  await page.goto(BASE);
  await page.evaluate(([k, v]) => localStorage.setItem(k, v), [KEY, JSON.stringify(save)]);
  // Force a real reload: hash-only navigation would not re-read localStorage.
  await page.reload();
  await page.waitForSelector('.trow, .stage, .mrow, .setrow');
}

async function shot(file, hash, wait) {
  // Skip navigation when already on the view: a re-goto could reset list scroll.
  if (!page.url().endsWith(hash)) await page.goto(`${BASE}/${hash}`);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForSelector(wait);
  await page.waitForTimeout(250); // let layout settle
  const path = join(SHOTS, file);
  await page.screenshot({ path, type: 'jpeg', quality: 82 });
  const size = statSync(path).size;
  console.log(`${file}: ${size} bytes ${size <= 262144 ? 'OK' : 'TOO BIG'}`);
  if (size > 262144) process.exitCode = 1;
}

// 1 — cover: checklist, progress header, filters, The Shootist guide pane with sources.
// Scroll the list so the visible window mixes earned story names, masked rows and
// part-way PSN counters (rows around Family Matters .. Top Fun).
await setSave(true);
await page.goto(`${BASE}/#/checklist`);
await page.waitForSelector('.pane .sources');
await page.evaluate(() => {
  const list = document.querySelector('.tlist');
  const row = [...list.children].find((r) => r.textContent.includes('Family Matters'));
  if (row) list.scrollTop += row.getBoundingClientRect().top - list.getBoundingClientRect().top;
});
await shot('1-cover.jpg', '#/checklist', '.pane .sources');

// 2 — roadmap: ordered stages with progress.
await shot('2-roadmap.jpg', '#/roadmap', '.stage');

// 3 — missables: shield OFF so every flag and its reason is readable.
await setSave(false);
await shot('3-missables.jpg', '#/missables', '.mrow');

// 4 — save & settings: shield ON with live preview, export/import, save stats.
await setSave(true);
await shot('4-settings.jpg', '#/settings', '.setrow');

await browser.close();
console.log('done');
