#!/usr/bin/env node
// Traçabilité spec → tests. Usage : node scripts/sdlc-trace.mjs [--strict]
//  - P-n manquant  → échec toujours (les tests de propriété arrivent avec la spec, avant la gate 1).
//  - SC-n manquant → avertissement, échec seulement avec --strict (ils arrivent au début du build).
import { appendFileSync } from 'node:fs';
import { trace } from './sdlc-lib.mjs';

const strict = process.argv.includes('--strict');
const { required, missing } = trace();
const missingP = missing.filter((m) => m.kind === 'P');
const missingSC = missing.filter((m) => m.kind === 'SC');

const lines = [
  `### Traçabilité spec → tests`,
  `${required.length} exigence(s) dans les specs, ${required.length - missing.length} couverte(s).`,
  ...missingP.map((m) => `- ❌ ${m.id} (propriété) sans test — ${m.spec}`),
  ...missingSC.map((m) => `- ${strict ? '❌' : '⏳'} ${m.id} (scénario) sans test — ${m.spec}`),
];
console.log(lines.join('\n'));
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n') + '\n\n');

if (missingP.length || (strict && missingSC.length)) process.exit(1);
