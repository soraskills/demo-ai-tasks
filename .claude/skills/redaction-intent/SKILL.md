---
name: redaction-intent
description: Aide un humain à transformer une idée, un besoin ou un retour utilisateur en intent/NNN-<slug>.md (étape Plan du SDLC). À utiliser quand quelqu'un dit « j'ai une idée », « on devrait… », « nouvel intent », ou veut démarrer une nouvelle fonctionnalité.
---

# Rédiger un intent

Tu fais l'analyste : tu poses les questions, l'humain décide. Pas de solution technique ici.

1. Pose au plus 5 questions, une par message, sur : le problème (qui souffre, quand, à quelle fréquence), le résultat attendu, les utilisateurs et systèmes touchés, les contraintes, et comment on saura que c'est réussi.
2. Prends le prochain numéro libre : `ls intent/` (3 chiffres, ex. `002`).
3. Écris `intent/NNN-<slug>.md` d'après `intent/TEMPLATE.md`. Reprends les mots de l'humain et ne comble aucun trou : ce qui n'est pas tranché va dans « Questions ouvertes ».
4. Fais relire, corrige, puis commite sur `main` : « Intent NNN : <titre> ». Le push lance la rédaction de la spec (`spec.yml`).

Un intent tient sur une page. S'il en faut plus, c'est qu'il y en a deux.
