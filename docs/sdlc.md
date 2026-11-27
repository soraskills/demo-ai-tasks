# Processus AI-native SDLC : profil petite équipe

Inspiré de *The AI-native SDLC playbook* (Anthropic, août 2026). Principe : chaque étape commite un artefact versionné que l'étape suivante lit. La suite des commits sert de piste d'audit.

## Deux validations humaines, pas plus
| Gate | Où | Qui | Quand |
|---|---|---|---|
| **1. Go dev** | Feature : merge de la PR `sdlc:spec`. Bug/chore : passage en *Ready for Claude* | l'équipe | toujours |
| **2. Déploiement** | environment `production-approval` du workflow Deploy | l'équipe | **seulement** si la gate automatique n'est pas verte |

Gate automatique (`scripts/sdlc-gate.mjs`), verte si, sur le commit déployé :
1. les tests ont tourné (rapports présents, au moins 1 test exécuté) ;
2. 0 échec, 0 skip, 0 flaky, en Vitest (unitaires + propriétés) comme en Playwright ;
3. chaque exigence `P-n` / `SC-n` des specs a un test, et ce test est passé ;
4. aucun test existant au dernier déploiement (tag `prod`) n'a été modifié, renommé ou supprimé.

Écart assumé avec le playbook : il garde une approbation humaine du code owner sur chaque PR. Ici, les PR de code sont mergées automatiquement si CI et revue Claude sont vertes. La sécurité repose sur des tests validés ou écrits **avant** le code, puis gelés.

## Voie Feature
1. **Plan** : l'humain rédige `intent/NNN-<slug>.md` avec Claude (skill `redaction-intent`) et le pousse sur `main`.
2. **Design** : `spec.yml` lance Claude (skill `redaction-spec`). Il ouvre une PR `sdlc:spec` avec :
   - `spec/NNN-<slug>.md` : parcours, règles, scénarios `SC-n`, propriétés `P-n` ;
   - `plan/NNN-<slug>.md` : interfaces du domaine, fichiers, ordre, découpage en sous-issues ;
   - les tests de propriété `[NNN:P-n]`, en skip tant que le domaine lève `NonImplemente`.
3. **Gate 1** : l'humain relit et merge. Les sous-issues passent en *Ready for Claude*.
4. **Build** : par sous-issue, l'agent `testeur` écrit d'abord les scénarios Playwright `[NNN:SC-n]` (nouveaux fichiers). Ensuite l'implémenteur code jusqu'à ce que `npm run verify` soit vert. Revue Claude, puis merge automatique.
5. **Deploy** : gate automatique ou gate 2.

## Voie Fix (bug)
Pour un comportement **déjà spécifié** (un `SC-n` ou un `P-n` violé). Sinon, c'est une Feature.
1. Issue Bug (modèle), ou issue ouverte par la sonde de prod.
2. `triage.yml` (skill `triage-bug`) : reproduction, diagnostic en commentaire, PR brouillon avec **uniquement** le test rouge (nouveau fichier `bug-<n>`), classement Fix ou Feature.
3. **Gate 1** : l'humain passe l'issue en *Ready for Claude*.
4. Claude corrige sur la même branche sans toucher au test (hook + CI). Merge automatique.
5. Deploy : même gate.

## Voie Chore (refacto, infra, doc)
Issue, puis *Ready for Claude*, puis PR. Aucun changement de comportement : les tests existants passent sans modification.

## Maintain
`probe.yml` rejoue les tests `@sonde` contre la prod. S'ils sont rouges, il ouvre une issue `bug` + `sonde` et lance le triage. La boucle se ferme sur la voie Fix. Le déclenchement planifié est désactivé par défaut.

## Ce qui dépend de réglages GitHub
- Protection de `main` : PR obligatoire, check `verify` requis (puis `revue` une fois le secret Claude configuré).
- Environment `production-approval` avec validateur.
- Pages servi par GitHub Actions.
- Secrets `CLAUDE_CODE_OAUTH_TOKEN` (spec, triage, revue, claude) et `PROJECT_TOKEN` (statuts du Project).
- Application GitHub Claude installée sur le repo : sans elle, les PR ouvertes par un workflow ne déclenchent pas la CI.

## Limites connues
- Le hook ne couvre que les outils d'édition de Claude : une modification par `sed` passerait. La CI et la gate 2 la détectent quand même.
- Personne ne valide les scénarios Playwright avant le build. Ils sont écrits par un agent distinct, vérifiés par la revue (correspondance avec la spec), puis gelés.
