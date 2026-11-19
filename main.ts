// Leonida Legend — the hand-in program (Node 22, standard library only).
// Copies app/ and screenshots/ into the grader's output directory and writes
// dossier.json with the kit's vendored buildDossier. Outside the grader,
// MAKEFUN_OUTPUT_DIR stands in for /output. Deterministic: no timestamps, no
// randomness — two runs write identical bytes. Preflight mirrors the scorer's
// caps so a broken build fails here, loudly, before it is handed in.

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};
const INDEX_CAP = 1024 * 1024;
const DATA_CAP = 2 * 1024 * 1024;
const GRADE_TOTALS: Record<string, number> = { platinum: 1, gold: 2, silver: 6, bronze: 46 };

/** Refuse to hand in anything the scorer would refuse. */
function preflight(): void {
  const index = join(repoRoot, 'app', 'index.html');
  if (!existsSync(index)) throw new Error('app/index.html is missing');
  if (statSync(index).size > INDEX_CAP) throw new Error('app/index.html exceeds 1 MiB');

  const shotsDir = join(repoRoot, 'screenshots');
  const images = existsSync(shotsDir)
    ? readdirSync(shotsDir).filter((n) => /\.(png|jpe?g)$/i.test(n) && !n.startsWith('.'))
    : [];
  if (images.length < 3 || images.length > CAPS.screenshots.max) {
    throw new Error(`screenshots: expected 3-${CAPS.screenshots.max} images, found ${images.length}`);
  }
  for (const name of images) {
    const size = statSync(join(shotsDir, name)).size;
    if (size > CAPS.screenshots.max_bytes) throw new Error(`screenshot over 256 KiB: ${name}`);
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(name)) throw new Error(`bad screenshot name: ${name}`);
  }

  // The data is the entry's core: 55 official trophies, verbatim grades, guides + sources.
  const dataPath = join(repoRoot, 'app', 'data', 'trophies.json');
  if (statSync(dataPath).size > DATA_CAP) throw new Error('trophies.json exceeds 2 MiB');
  const doc = JSON.parse(readFileSync(dataPath, 'utf8'));
  const list = Array.isArray(doc) ? doc : doc.trophies;
  if (!Array.isArray(list) || list.length !== 55) throw new Error('trophies.json must hold the 55 official trophies');
  const seen = new Map<string, number>();
  for (const t of list) {
    if (!t.name || typeof t.guide !== 'string' || !t.guide.trim()) {
      throw new Error(`trophy ${t.id ?? '?'} has no name or a blank guide`);
    }
    if (!Array.isArray(t.sources) || t.sources.length < 3) {
      throw new Error(`trophy ${t.id ?? '?'} needs at least 3 named sources`);
    }
    seen.set(t.grade, (seen.get(t.grade) ?? 0) + 1);
  }
  for (const [grade, total] of Object.entries(GRADE_TOTALS)) {
    if (seen.get(grade) !== total) throw new Error(`grade totals wrong: ${grade} = ${seen.get(grade) ?? 0}, expected ${total}`);
  }
}

function handIn(): void {
  preflight();
  mkdirSync(outputDir, { recursive: true });
  cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
  const dossier = buildDossier(outputDir, CAPS);
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
  console.log(`handed in app/ + screenshots/ + dossier.json (${dossier.length} bytes) -> ${outputDir}`);
}

handIn();
