#!/usr/bin/env node
// Gate 2 : décide si le déploiement peut partir sans validation humaine.
// « Vert » = TOUT est vrai sur le commit courant :
//   1. les rapports de tests existent (les tests ont tourné) ;
//   2. 0 échec, 0 skip, 0 flaky, et au moins 1 test exécuté, en unitaires/propriétés ET en Playwright ;
//   3. chaque exigence P-n / SC-n des specs a un test, et ce test est passé ;
//   4. aucun test existant au dernier déploiement (tag « prod ») n'a été modifié, renommé ou supprimé.
// Écrit green=true|false dans $GITHUB_OUTPUT et le détail dans $GITHUB_STEP_SUMMARY. Ne fait jamais échouer le job.
import { existsSync, readFileSync, appendFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { trace, TEST_DIRS } from './sdlc-lib.mjs';

const reasons = [];
const passedTitles = [];

function readJson(path) {
  if (!existsSync(path)) { reasons.push(`rapport absent : ${path} (tests non lancés ?)`); return null; }
  try { return JSON.parse(readFileSync(path, 'utf8')); } catch { reasons.push(`rapport illisible : ${path}`); return null; }
}

// Vitest (reporter json, format proche de Jest)
const unit = readJson('reports/unit.json');
if (unit) {
  const all = unit.testResults.flatMap((f) => f.assertionResults);
  const by = (s) => all.filter((t) => t.status === s).length;
  const failed = by('failed'), skipped = all.length - by('passed') - failed;
  if (all.length === 0) reasons.push('Vitest : aucun test exécuté');
  if (failed) reasons.push(`Vitest : ${failed} test(s) en échec`);
  if (skipped) reasons.push(`Vitest : ${skipped} test(s) sautés/todo (domaine non implémenté ?)`);
  if (unit.success === false && !failed) reasons.push('Vitest : exécution en échec');
  passedTitles.push(...all.filter((t) => t.status === 'passed').map((t) => t.fullName ?? t.title));
}

// Playwright (reporter json)
const e2e = readJson('reports/e2e.json');
if (e2e) {
  const specs = [];
  const visit = (s) => { specs.push(...(s.specs ?? [])); (s.suites ?? []).forEach(visit); };
  (e2e.suites ?? []).forEach(visit);
  const tests = specs.flatMap((sp) => sp.tests.map((t) => ({ title: sp.title, status: t.status })));
  const n = (s) => tests.filter((t) => t.status === s).length;
  if (tests.length === 0) reasons.push('Playwright : aucun test exécuté');
  if (n('unexpected')) reasons.push(`Playwright : ${n('unexpected')} test(s) en échec`);
  if (n('skipped')) reasons.push(`Playwright : ${n('skipped')} test(s) sautés`);
  if (n('flaky')) reasons.push(`Playwright : ${n('flaky')} test(s) instables`);
  if ((e2e.errors ?? []).length) reasons.push(`Playwright : ${e2e.errors.length} erreur(s) globale(s)`);
  passedTitles.push(...tests.filter((t) => t.status === 'expected').map((t) => t.title));
}

// Traçabilité : chaque exigence a un test, et ce test est passé
const { required, missing } = trace();
for (const m of missing) reasons.push(`exigence ${m.id} sans test (${m.spec})`);
for (const r of required.filter((r) => !missing.includes(r)))
  if (!passedTitles.some((t) => t.includes(`[${r.id}]`))) reasons.push(`exigence ${r.id} : test présent mais pas passé`);

// Tests gelés : rien de modifié/supprimé depuis le dernier déploiement
let base = null;
try { base = execSync('git rev-parse --verify -q prod', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch {}
if (base) {
  const changed = execSync(`git diff --name-status ${base} HEAD -- ${TEST_DIRS.join(' ')}`).toString().trim();
  const touched = changed.split('\n').filter((l) => l && !l.startsWith('A'));
  for (const l of touched) reasons.push(`test gelé modifié depuis le dernier déploiement : ${l.replace(/\s+/g, ' ')}`);
}

const green = reasons.length === 0;
const summary = [
  `### Gate de déploiement : ${green ? '✅ vert, déploiement automatique' : '🟠 validation humaine requise'}`,
  `Base « tests gelés » : ${base ? base.slice(0, 7) : 'aucun déploiement précédent'}`,
  ...reasons.map((r) => `- ${r}`),
].join('\n');
console.log(summary);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + '\n');
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `green=${green}\n`);
