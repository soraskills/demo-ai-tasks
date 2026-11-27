// Fonctions partagées par sdlc-trace.mjs et sdlc-gate.mjs. Aucune dépendance externe.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

export const TEST_DIRS = ['tests/properties', 'e2e'];

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

/**
 * IDs exigés par les specs acceptées (fichiers spec/NNN-*.md, hors TEMPLATE).
 * Une exigence est un titre de niveau 3 : « ### P-1 — … » ou « ### SC-2 — … ».
 * Elle devient l'ID « NNN:P-1 », attendu dans le titre d'un test : test('[NNN:P-1] …').
 */
export function specIds() {
  const ids = [];
  for (const f of walk('spec')) {
    const m = basename(f).match(/^(\d{3})-.*\.md$/);
    if (!m) continue;
    for (const line of readFileSync(f, 'utf8').split('\n')) {
      const h = line.match(/^###\s+(P|SC)-(\d+)\b/);
      if (h) ids.push({ id: `${m[1]}:${h[1]}-${h[2]}`, kind: h[1], spec: f });
    }
  }
  return ids;
}

/** IDs présents dans les fichiers de test (recherche textuelle de « [NNN:P-n] » / « [NNN:SC-n] »). */
export function testIds() {
  const found = new Map();
  for (const dir of TEST_DIRS)
    for (const f of walk(dir))
      for (const m of readFileSync(f, 'utf8').matchAll(/\[(\d{3}:(?:P|SC)-\d+)\]/g))
        found.set(m[1], [...(found.get(m[1]) ?? []), f]);
  return found;
}

export function trace() {
  const required = specIds();
  const present = testIds();
  const missing = required.filter((r) => !present.has(r.id));
  return { required, present, missing };
}
