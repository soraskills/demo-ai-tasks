---
name: triage-bug
description: Trie une issue de bug (voie Fix du SDLC) : reproduire, diagnostiquer, écrire le test rouge dans une PR brouillon, classer Fix ou Feature. À utiliser sur une issue labellisée « bug » ou ouverte par la sonde de prod.
---

# Trier un bug

Tu ne corriges rien : tu prépares la décision humaine (gate 1). Aucun fichier sous `src/` ne doit changer.

1. **Lire** l'issue et ses commentaires (`gh issue view <n> --comments`), ainsi que le run de sonde éventuel.
2. **Rattacher à la spec** : quel `SC-n` ou `P-n` de `spec/*.md` le comportement viole-t-il ?
   - Aucun, ou le comportement attendu n'est pas écrit → **Feature** : commente pourquoi, propose un amendement de spec ou un nouvel intent, et arrête-toi là.
3. **Reproduire** avec un test **nouveau**, qui ne touche aucun test existant :
   - de préférence une propriété : `tests/properties/bug-<n>.test.ts`, `propriete('[BUG-<n>] …', …)` ;
   - sinon un scénario Playwright : `e2e/bug-<n>.spec.ts`, `test('[BUG-<n>] …')`.

   Il doit être **rouge** pour la bonne raison : colle l'assertion qui échoue.
4. **Diagnostiquer** dans un commentaire d'issue :
   - le symptôme ;
   - l'exigence violée ;
   - la cause probable (fichier et ligne) ;
   - le rayon d'action ;
   - la correction envisagée en 3 lignes au plus.
5. **Livrer** une PR **brouillon** depuis la branche `claude/<n>-fix-<slug>`, avec uniquement le test, et `Closes #<n>` dans le corps.
6. **Classer** : catégorie `Bug`, priorité (`Urgent` si la sonde de prod est rouge), statut **Backlog**. La phrase finale du commentaire : « Passer en Ready for Claude = gate 1 (go fix). »
