// Leonida Legend — hand-in program (Node 22, standard library only).
// The entry is the static guide in app/ plus its screenshots. This program copies
// both into the grader's output directory and writes dossier.json, the judge's
// summary, using the kit's vendored library. Outside the grader, MAKEFUN_OUTPUT_DIR
// stands in for /output. Two runs produce identical bytes: nothing here is random
// or time-dependent, and the vendored library is left untouched.

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

// The scorer's caps, mirrored here so a broken build fails loudly before handing in.
const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};
const INDEX_MAX_BYTES = 1024 * 1024;

/** Refuse to hand in a build the scorer would refuse. */
function preflight() {
  const index = join(repoRoot, 'app', 'index.html');
  if (!existsSync(index)) throw new Error('app/index.html is missing');
  if (statSync(index).size > INDEX_MAX_BYTES) throw new Error('app/index.html exceeds 1 MiB');

  const shotsDir = join(repoRoot, 'screenshots');
  const images = existsSync(shotsDir)
    ? readdirSync(shotsDir).filter((n) => /\.(png|jpe?g)$/i.test(n) && !n.startsWith('.'))
    : [];
  if (images.length < 3 || images.length > CAPS.screenshots.max) {
    throw new Error(`screenshots: expected 3-${CAPS.screenshots.max} images, found ${images.length}`);
  }
  for (const name of images) {
    if (statSync(join(shotsDir, name)).size > CAPS.screenshots.max_bytes) {
      throw new Error(`screenshot over 256 KiB: ${name}`);
    }
  }

  // The data is the entry's core: refuse to hand in a broken trophy file.
  const data = JSON.parse(readFileSync(join(repoRoot, 'app', 'data', 'trophies.json'), 'utf8'));
  const list = Array.isArray(data) ? data : data.trophies;
  if (!Array.isArray(list) || list.length !== 55) {
    throw new Error('app/data/trophies.json must hold the 55 official trophies');
  }
  for (const t of list) {
    if (!t.name || typeof t.guide !== 'string' || !t.guide.trim()) {
      throw new Error(`trophy ${t.id ?? '?'} has no name or a blank guide`);
    }
  }
}

function handIn() {
  preflight();
  mkdirSync(outputDir, { recursive: true });
  cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
  const dossier = buildDossier(outputDir, CAPS);
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
  console.log(`handed in app/ + screenshots/ + dossier.json (${dossier.length} bytes) -> ${outputDir}`);
}

handIn();
