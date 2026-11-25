# demo-ai-tasks

## Gestion des tâches
- Les tâches vivent dans le GitHub Project **soraskills #3 « Tasks »** : https://github.com/orgs/soraskills/projects/3
- Flux : Backlog → Ready for Claude → In progress (Claude) → Needs review → Done (+ Blocked).
- Une issue = une PR. Ne jamais merger soi-même.
- Prendre la tâche suivante : `/next-task` (ou `/next-task 42` pour une issue précise).
- Mettre à jour un statut : `bash .claude/scripts/project-status.sh <url-issue> "<Statut>"`.
- Tâche ambiguë ou bloquée : statut **Blocked** + question précise en commentaire de l'issue, ne pas deviner.
- Exécution automatique : le label `claude` sur une issue déclenche la GitHub Action (`.github/workflows/claude.yml`).

## Conventions
- Branches : `claude/<numéro>-<slug>`.
- Commits courts et explicites, référencent `#<numéro>`.
- Le corps de PR contient `Closes #<numéro>`, le résumé, les critères d'acceptation vérifiés et les points d'attention.
