---
description: Prend la prochaine tâche "Ready for Claude" du GitHub Project soraskills #3, la réalise et ouvre une PR
argument-hint: "[numéro d'issue facultatif]"
allowed-tools: Bash(gh:*), Bash(git:*), Bash(jq:*), Bash(bash .claude/scripts/project-status.sh:*)
---

Tu traites une tâche du GitHub Project **soraskills #3** (https://github.com/orgs/soraskills/projects/3).

## 1. Choisir la tâche
- Si un numéro est fourni ($ARGUMENTS), prends cette issue dans le repo courant.
- Sinon, liste les items :
  `gh project item-list 3 --owner soraskills --format json --limit 200`
  Garde ceux dont `status == "Ready for Claude"` ET dont le repo correspond au repo courant
  (`gh repo view --json nameWithOwner -q .nameWithOwner`). Ignore ceux dont le champ "Exécution" vaut "Action (auto)" (traités par la GitHub Action).
  Trie par Priority (Urgent > High > Medium > Low ; champ d'issue de l'org, absent = Low), puis par ancienneté. Prends le premier.
- S'il n'y en a aucun, dis-le et arrête-toi.

## 2. Démarrer
- Lis l'issue complète : `gh issue view <n> --comments`.
- Si les critères d'acceptation sont absents ou ambigus : passe le statut à **Blocked**, commente l'issue avec tes questions précises, et arrête-toi.
- Sinon : `bash .claude/scripts/project-status.sh <url> "In progress (Claude)"`
  et crée la branche `claude/<n>-<slug-court>` depuis la branche par défaut à jour.

## 3. Réaliser
- Respecte le CLAUDE.md du repo et la section "Hors périmètre" de l'issue.
- Coche mentalement chaque critère d'acceptation ; lance les tests / le lint du projet.
- Commits petits et explicites, message référençant `#<n>`.

## 4. Livrer
- Pousse la branche et ouvre la PR : `gh pr create --fill --body "Closes #<n>\n\n<résumé + critères vérifiés + points d'attention>"`.
- `bash .claude/scripts/project-status.sh <url-issue> "Needs review"`.
- Commente l'issue avec le lien de la PR et ce qui reste éventuellement à vérifier par un humain.

## Règles
- Une tâche = une PR. Ne merge jamais toi-même.
- En cas de blocage (accès, décision métier, test impossible) : statut **Blocked** + commentaire, plutôt que de deviner.
