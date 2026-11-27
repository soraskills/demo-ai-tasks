# demo-ai-tasks · Créneau

Appli fictive **Créneau** : réservation de créneaux de retrait de panier pour l'épicerie coopérative fictive *La Cagette du Quai*.
Démo du playbook « AI-native SDLC » d'Anthropic, profil petite équipe. Processus complet : `docs/sdlc.md`.

## Commandes
- Installer : `npm ci && npx playwright install chromium`
- Tout vérifier (à lancer avant de dire « fini ») : `npm run verify` (types, unitaires + propriétés, build, Playwright, traçabilité)
- Ciblé : `npm test`, `npm run test:props`, `npm run e2e`, `npm run sdlc:trace`

## Vérifier ton travail
Une tâche n'est finie que si `npm run verify` sort en 0. Colle la fin de sa sortie dans la PR.
Dans GitHub Actions, sur une PR ouverte par un bot, les commandes npm te sont refusées : pousse ton commit, attends le check `verify` (`gh pr checks`, `gh run view --log-failed`) et rapporte son résultat. Ne déclare jamais « vérifié » sans l'un ou l'autre.
Sortie saine : `Test Files … passed`, `… passed` côté Playwright, `0 exigence(s) manquante(s)` ou aucune ligne ❌.

## Voies (champ « Catégorie » du Project soraskills #3)
- **Feature** : `intent/NNN-*.md` → (auto) PR `sdlc:spec` avec `spec/NNN-*.md`, `plan/NNN-*.md` et les tests de propriété → **gate 1 : un humain merge** → build.
- **Bug** : issue Bug → (auto) triage : diagnostic + PR brouillon contenant uniquement le test rouge → **gate 1 : un humain passe l'issue en Ready for Claude** → fix.
- **Refacto / Infra / Doc** (chore) : issue → Ready for Claude → PR. Aucun changement de comportement, aucun test existant modifié.
- **Gate 2** (déploiement) : automatique si `scripts/sdlc-gate.mjs` est vert, sinon validation dans l'environment `production-approval`.

## Tests : règles non négociables
- Chaque exigence de spec a son test, titré par son ID : `[001:P-2] …` (propriété, `tests/properties/`, via `propriete()` de `tests/sdlc.ts`) ou `[001:SC-1] …` (scénario, `e2e/`, Playwright).
- Un test présent sur `main` est **gelé** : ne le modifie pas, corrige le code (un hook le bloque). Pour un bug, crée un **nouveau** fichier `tests/properties/bug-<n>.test.ts` ou `e2e/bug-<n>.spec.ts`.
- Si un test gelé est faux : statut Blocked + commentaire ; ne le contourne pas (pas de `.skip`, `.only`, `test.fixme`, retry).
- Domaine non implémenté : lever `NonImplemente` (`src/domain`), jamais un faux retour.
- Les tests de prod portent le tag `@sonde` dans leur titre.

## Tâches et PR
- Les tâches vivent dans le Project **soraskills #3** : Backlog → Ready for Claude → In progress (Claude) → Needs review → Done (+ Blocked).
- Prendre la suivante : `/next-task` (ou `/next-task 42`). Statut : `bash .claude/scripts/project-status.sh <url-issue> "<Statut>"`.
- Une issue = une PR, branche `claude/<numéro>-<slug>`, commits qui référencent `#<numéro>`, corps avec `Closes #<numéro>`.
- Ne merge jamais toi-même. Les PR `claude/*` (hors `sdlc:spec`) sont mergées automatiquement quand les checks sont verts.
- Ambigu ou bloqué : statut **Blocked** + question précise en commentaire, ne pas deviner.
- Si l'implémentation s'écarte de `plan/NNN-*.md`, mets à jour le plan dans le même commit.

## Domaine
- Fuseau de référence : `Europe/Paris`. Toute heure affichée est calculée dans ce fuseau, jamais celui du navigateur ou d'UTC.
