---
name: redaction-spec
description: Transforme un intent/NNN-*.md accepté en spec, plan et tests de propriété, livrés dans une PR « sdlc:spec » (étape Design du SDLC). À utiliser quand un intent vient d'arriver sur main, ou quand on demande « écris la spec de l'intent NNN ».
---

# Rédiger spec, plan et tests de propriété

Entrée : `intent/NNN-<slug>.md`. Sortie : une PR qui ne change aucun comportement existant.

## 1. Spec : `spec/NNN-<slug>.md` (modèle `spec/TEMPLATE.md`)
- Parcours utilisateur et règles métier, dérivés de l'intent sans rien inventer. Ce que l'intent ne tranche pas va dans « Points à valider ».
- **Scénarios** `### SC-n — <titre>` en Étant donné / Quand / Alors. Ils sont observables par l'utilisateur ou par un client de l'API, et ne dépendent d'aucune maquette.
- **Propriétés** `### P-n — <titre>` : invariants vrais pour *toute* entrée valide. Formes utiles :
  - invariant (« jamais plus que la capacité ») ;
  - aller-retour (« réserver puis annuler rend l'état initial ») ;
  - idempotence ;
  - oracle simple (comparer à une implémentation naïve) ;
  - bornes (« toute heure affichée ∈ horaires d'ouverture, Europe/Paris »).
- Chaque règle métier est couverte par au moins un SC ou un P.

## 2. Plan : `plan/NNN-<slug>.md` (modèle `plan/TEMPLATE.md`)
Le plan doit pouvoir être exécuté par un ingénieur qui n'a jamais vu la conversation. Il contient :
- les signatures TypeScript des fonctions du domaine (`src/domain/…`) ;
- les fichiers touchés et l'ordre de travail ;
- les sous-issues : une par PR, avec catégorie, effort et exécution (Local ou Action) ;
- les risques.

## 3. Tests de propriété : `tests/properties/NNN-<slug>.test.ts`
- Un test par P-n : `propriete('[NNN:P-n] <titre>', () => fc.assert(fc.property(…)))`, avec `propriete` de `tests/sdlc.ts` et `fc` de `fast-check`.
- Crée dans `src/domain/` les stubs des signatures du plan, qui lèvent `new NonImplemente('<nom>')`. Les tests sont donc *skipped*, ni rouges ni verts.
- Vérifie : `npm run lint`, `npm test` (0 échec), `npm run sdlc:trace` (aucun P manquant ; les SC sont « en attente », c'est normal).

## 4. PR de spec
Branche `claude/spec-NNN`, label `sdlc:spec` (crée-le s'il manque : `gh label create sdlc:spec --color 5319e7`). Corps de la PR :
- `Intent : intent/NNN-….md` ;
- un résumé en 5 lignes ;
- la liste des SC et P ;
- les points à valider ;
- les sous-issues prévues ;
- la phrase « **Merger cette PR = gate 1 (go dev).** ».

Ne merge jamais.
