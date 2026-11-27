#!/usr/bin/env node
// Hook PreToolUse (Edit|Write|MultiEdit) : interdit à Claude de modifier un test qui existe déjà sur origin/main.
// Créer un nouveau fichier de test reste permis (tests de régression d'un bug, scénarios d'une nouvelle feature).
// « If a test fails, fix the code, not the test. » (playbook AI-native SDLC, étape Test)
import { execFileSync } from 'node:child_process';
import { relative } from 'node:path';

let input = '';
process.stdin.on('data', (c) => (input += c));
process.stdin.on('end', () => {
  const { tool_input = {}, cwd = process.cwd() } = JSON.parse(input || '{}');
  const file = tool_input.file_path;
  if (!file) process.exit(0);
  const root = process.env.CLAUDE_PROJECT_DIR ?? cwd;
  const rel = relative(root, file).split('\\').join('/');
  if (!/^(tests\/properties|e2e)\//.test(rel)) process.exit(0);
  try {
    execFileSync('git', ['cat-file', '-e', `origin/main:${rel}`], { cwd: root, stdio: 'ignore' });
  } catch {
    process.exit(0); // fichier nouveau : autorisé
  }
  console.error(
    `Bloqué : ${rel} est un test gelé (présent sur main). Corrige le code, pas le test. ` +
      `Si le test lui-même est faux, passe l'issue en Blocked et explique pourquoi en commentaire : ` +
      `sa modification fera passer le déploiement par une validation humaine.`,
  );
  process.exit(2);
});
