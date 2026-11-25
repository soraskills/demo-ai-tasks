#!/usr/bin/env bash
# Met à jour le Status d'une issue dans le GitHub Project soraskills #3.
# Usage : project-status.sh <url-issue-ou-PR> "<Statut>"
#   Statuts : Backlog | Ready for Claude | In progress (Claude) | Needs review | Blocked | Done
# Ajoute l'issue au projet si elle n'y est pas encore.
set -euo pipefail
OWNER="${PROJECT_OWNER:-soraskills}"
NUMBER="${PROJECT_NUMBER:-3}"
URL="$1"; STATUS="$2"

PROJECT_ID=$(gh project view "$NUMBER" --owner "$OWNER" --format json | jq -r .id)
FIELD_JSON=$(gh project field-list "$NUMBER" --owner "$OWNER" --format json)
FIELD_ID=$(jq -r '.fields[] | select(.name=="Status") | .id' <<<"$FIELD_JSON")
OPTION_ID=$(jq -r --arg s "$STATUS" '.fields[] | select(.name=="Status") | .options[] | select(.name==$s) | .id' <<<"$FIELD_JSON")
[ -n "$OPTION_ID" ] || { echo "Statut inconnu : $STATUS" >&2; exit 1; }

# item-add est idempotent : renvoie l'item existant s'il est déjà dans le projet
ITEM_ID=$(gh project item-add "$NUMBER" --owner "$OWNER" --url "$URL" --format json | jq -r .id)

gh project item-edit --id "$ITEM_ID" --project-id "$PROJECT_ID" \
  --field-id "$FIELD_ID" --single-select-option-id "$OPTION_ID" >/dev/null
echo "✓ $URL → $STATUS"
