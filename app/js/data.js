// Trophy data access and the derived roadmap model: stages, kinds, spoiler masking,
// progress math and the Next-up suggestion logic. All derived from the official list.

export const KIND_LABELS = { story: 'Story', collectible: 'Collectible', activity: 'Activity', online: 'Online' };
export const GRADES = ['platinum', 'gold', 'silver', 'bronze'];

/** Ordered platinum roadmap, derived from the official descriptions. */
export const STAGES = [
  { n: 1, title: 'Opening night', blurb: 'Play the prologue and Chapter 1. Watch for the Ocean Beach cocktail moment — its description reads like an early-story beat, so take it when offered.' },
  { n: 2, title: 'Chapters 2–4: the story unfolds', blurb: 'Complete the numbered chapters and named missions (Breakfast Run, The Cartel Heist, Child’s Play, Headliners, VCIA Takedown, Operation Savage Glory). Keep manual saves before big missions; take one-time moments (showroom, bowling, tanks) as they appear.' },
  { n: 3, title: 'Contacts & strangers', blurb: 'Finish the contact strands — Andy, Kenton, Billy, Randy, Tyrone — plus Bret’s unique hunt and Cal’s fishing challenge. Eight stranger strands feed the silver; do them while contacts are active.' },
  { n: 4, title: 'The finale', blurb: 'Clear the missables list first, then complete the final mission for the gold story trophy. Treat it as a point of no return until the game proves otherwise.' },
  { n: 5, title: 'Leonida cleanup: collect, explore, earn', blurb: 'Post-story sweep: 52 districts, 100 WAiNK spots, 18 meditation spots, 3 card sets, 100 vehicles, 8 garages, Scooter Bros registrations, and the $250k laundering / $100k spending pair.' },
  { n: 6, title: 'Activities, races & scores to settle', blurb: '250 stunts, 42 range golds, 14 drone-race locations, 20 different race wins, 50 challenges, 5 vaults, 9 gang operations, and the combat/stealth one-offs. Partner trophies go here only if the duo is still available — otherwise do them in stage 2.' },
  { n: 7, title: '100% and the platinum', blurb: 'Check the in-game completion stat for A Long Road, mop up anything left, and Vice Got a Price! lands with the other 54.' },
];

/** Fetch the local trophy file (same-origin only; the app never touches the network). */
export async function loadTrophies() {
  const res = await fetch('data/trophies.json');
  if (!res.ok) throw new Error(`trophy data failed: ${res.status}`);
  const doc = await res.json();
  return doc.trophies;
}

/** Spoiler shield: story trophies stay masked until earned. */
export function isMasked(t, state) {
  return state.settings.spoilerShield && t.kind === 'story' && !state.earned[t.id];
}

export function earnedCount(trophies, state) {
  return trophies.filter((t) => state.earned[t.id]).length;
}

export function gradeCounts(trophies, state) {
  const out = {};
  for (const g of GRADES) {
    const all = trophies.filter((t) => t.grade === g);
    out[g] = { earned: all.filter((t) => state.earned[t.id]).length, total: all.length };
  }
  return out;
}

export function stageTrophies(trophies, n) {
  return trophies.filter((t) => t.stage === n);
}

export function stageProgress(trophies, state, n) {
  const list = stageTrophies(trophies, n);
  return { earned: list.filter((t) => state.earned[t.id]).length, total: list.length };
}

export function missablesLeft(trophies, state) {
  return trophies.filter((t) => t.missable && !state.earned[t.id]).length;
}

/**
 * Next-up suggestions: unearned trophies, missables first, then roadmap order.
 * Each suggestion carries a plain-language reason.
 */
export function nextUp(trophies, state, limit = 5) {
  const pool = trophies.filter((t) => !state.earned[t.id]);
  pool.sort((a, b) =>
    (Number(b.missable) - Number(a.missable)) ||
    (a.stage - b.stage) ||
    (a.id - b.id));
  return pool.slice(0, limit).map((t) => ({ trophy: t, reason: suggestReason(t, state) }));
}

function suggestReason(t, state) {
  if (t.missable) return `Potentially missable — ${t.missableReason.split(':')[0].toLowerCase()}. Do it before the window closes.`;
  if (t.psnTarget && (state.counters[t.id] ?? 0) > 0) return `Counter already moving (${state.counters[t.id]}/${t.psnTarget}) — keep it going.`;
  if (t.kind === 'story') return `Stage ${t.stage} story progress — unlocks as you play.`;
  if (t.kind === 'collectible') return `Stage ${t.stage} cleanup — sweep it with the map loop.`;
  return `Stage ${t.stage} activity — knock it out in free roam.`;
}
