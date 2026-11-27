# Plan 001 : réserver un créneau de retrait

- **Spec** : spec/001-reserver-creneau.md

## Interfaces du domaine
```ts
// src/domain/creneaux.ts
export const CAPACITE = 5;
export const FUSEAU = 'Europe/Paris';

export interface Creneau { debut: Date }                 // instant UTC ; fin = debut + 15 min
export interface Reservation {
  commande: string;              // jeton opaque du lien personnel
  creneau: number;               // epoch ms du début
  nom?: string;                  // supprimés par purger (R-7)
  telephone?: string;
  recupere: boolean;
}
export interface Etat { reservations: readonly Reservation[] }
export type Resultat = { ok: true; etat: Etat } | { ok: false; raison: 'complet' | 'deja_reserve' | 'trop_tard' | 'introuvable' };

export function creneauxDuJour(jour: string /* YYYY-MM-DD, Paris */): Creneau[];
export function heureAffichee(instant: Date): string;    // « HH:mm » Europe/Paris
export function placesRestantes(etat: Etat, creneau: Creneau): number;
export function modifiable(maintenant: Date, creneau: Creneau): boolean;   // ≥ 24 h
export function reserver(etat: Etat, r: Omit<Reservation, 'recupere'>, creneau: Creneau): Resultat;
export function annuler(etat: Etat, commande: string, maintenant: Date): Resultat;
export function deplacer(etat: Etat, commande: string, vers: Creneau, maintenant: Date): Resultat;
export function heureRappel(creneau: Creneau): Date;     // début − 1 h
export function purger(etat: Etat, jour: string): Etat;  // supprime nom/téléphone du jour
```

## Ordre de travail
1. Domaine pur (`src/domain/creneaux.ts`) : faire passer P-1 à P-8 (P-9, la purge, relève de la sous-issue 5).
2. Stockage et API (lien personnel par jeton, lecture des créneaux, réserver/annuler/déplacer).
3. UI adhérent (mobile) : SC-1 à SC-6, SC-9.
4. UI bénévole : liste par créneau, case « récupéré », ajout d'un retrait sans créneau : SC-7, SC-8.
5. Rappel SMS (`EnvoiSms`, tâche planifiée) et purge après distribution.

## Sous-issues (une PR chacune)
| # | Titre | Catégorie | Effort | Exécution | Couvre |
|---|---|---|---|---|---|
| 1 | Domaine : créneaux, capacité, délai, fuseau | Feature | Medium | Action (auto) | P-1 à P-8 |
| 2 | Stockage, API et lien personnel | Feature | Medium | Action (auto) | SC-9 (l'API doit préserver P-3, P-4) |
| 3 | UI adhérent : réserver, annuler, déplacer | Feature | Medium | Action (auto) | SC-1 à SC-6 |
| 4 | UI bénévole : liste et retraits | Feature | Low | Action (auto) | SC-7, SC-8 |
| 5 | Rappel SMS et purge RGPD | Feature | Medium | Local (clés SMS) | P-8, P-9 |

## Fichiers touchés
- `src/domain/creneaux.ts` (nouveau), `src/domain/index.ts`
- `tests/properties/001-reserver-creneau.test.ts`, `e2e/001-*.spec.ts` (scénarios)
- UI et API : à préciser dans les sous-issues 2 à 4

## Risques et points d'attention
- **Fuseau et changement d'heure** : calculer en Europe/Paris avec `Intl`, jamais `getHours()`. Tester les dates de bascule.
- **Concurrence** : deux adhérents sur la dernière place, le stockage doit refuser le second (P-1).
- **Intégration commande** : inconnue (point à valider) : peut changer les sous-issues 2 et 5.
- **RGPD** : pas de nom ni téléphone dans les journaux.
