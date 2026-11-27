# Consignes de revue (Claude)

Relis le diff en 4 passes, dans cet ordre. Chaque finding est classé **Important** (bloque le merge) ou **Nit** (5 au plus par PR, regroupés dans la synthèse).

1. **Correction** : bugs, cas limites, fuseau horaire (tout calcul d'heure en `Europe/Paris`), concurrence, erreurs avalées.
2. **Sécurité** : secrets, injection, XSS (pas de `innerHTML` avec une donnée utilisateur), dépendances ajoutées sans justification, permissions des workflows élargies.
3. **Conformité au processus** :
   - le diff correspond à `plan/NNN-*.md`, sinon le plan est mis à jour dans la même PR ;
   - chaque test `[NNN:SC-n]` / `[NNN:P-n]` teste vraiment ce que dit la spec (lis les deux côte à côte) ;
   - aucun test existant n'est modifié, sauté (`.skip`, `.only`, `fixme`) ou affaibli (assertion retirée, timeout gonflé) : c'est **Important** à chaque fois.
4. **Lisibilité** : uniquement des Nits.

Ne commente pas le style que le linter couvre déjà. Pas de finding sans fichier et ligne. Si rien n'est Important, dis-le en une phrase.
