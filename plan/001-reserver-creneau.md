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
// Retrait sans créneau (R-9, SC-8) : ajouté par le bénévole, hors capacité (R-2 ne compte que les réservations).
// Type distinct et champ optionnel d'Etat : n'affecte ni Reservation ni les propriétés P-1 à P-4.
export interface RetraitSansCreneau { distribution: string /* YYYY-MM-DD, Paris */; nom?: string /* supprimé par purger (R-7) */; recupere: boolean }
export interface Etat { reservations: readonly Reservation[]; sansCreneau?: readonly RetraitSansCreneau[] }
export type Resultat = { ok: true; etat: Etat } | { ok: false; raison: 'complet' | 'deja_reserve' | 'trop_tard' | 'introuvable' };

export type Fermetures = ReadonlySet<string>;           // dates fermées, YYYY-MM-DD (Paris)
export function creneauxDuJour(jour: string /* YYYY-MM-DD, Paris */, fermetures?: Fermetures): Creneau[];
export function distributionsOuvertes(maintenant: Date, fermetures?: Fermetures): string[]; // 2 prochaines (R-12)
export function heureAffichee(instant: Date): string;    // « HH:mm » Europe/Paris
export function placesRestantes(etat: Etat, creneau: Creneau): number;
export function modifiable(maintenant: Date, creneau: Creneau): boolean;   // ≥ 24 h
export function reserver(etat: Etat, r: Omit<Reservation, 'recupere'>, creneau: Creneau): Resultat;
export function annuler(etat: Etat, commande: string, maintenant: Date): Resultat;
export function deplacer(etat: Etat, commande: string, vers: Creneau, maintenant: Date): Resultat;
export function heureRappel(creneau: Creneau): Date;     // début − 1 h
export function purger(etat: Etat, jour: string): Etat;  // supprime nom/téléphone du jour, réservations ET retraits sans créneau (P-9)
```

## Ordre de travail
1. Domaine pur (`src/domain/creneaux.ts`) : faire passer P-1 à P-7, P-10 à P-12 (P-8 et P-9 relèvent de la sous-issue 5).
   L'horizon R-12 s'applique dans l'API (sous-issue 2) avec `distributionsOuvertes` : `reserver` et `deplacer` du domaine ne le contrôlent pas.
2. Stockage et API (lien personnel par jeton, lecture des créneaux des `distributionsOuvertes`, réserver/annuler/déplacer refusés hors horizon, liste des dates fermées).
3. UI adhérent (mobile) : SC-1 à SC-6, SC-10, SC-11.
4. UI bénévole : liste par créneau, case « récupéré », ajout d'un retrait sans créneau, dates fermées : SC-7, SC-8, SC-12.
5. Rappel SMS (`EnvoiSms`, tâche planifiée) et purge après distribution.

## Sous-issues (une PR chacune)
| # | Titre | Catégorie | Effort | Exécution | Couvre |
|---|---|---|---|---|---|
| 1 | Domaine : créneaux, capacité, délai, fuseau, fermetures, horizon | Feature | Medium | Action (auto) | P-1 à P-7, P-10 à P-12 |
| 2 | Stockage, API et lien personnel | Feature | Medium | Action (auto) | SC-9 (l'API doit préserver P-3, P-4) |
| 3 | UI adhérent : réserver, annuler, déplacer | Feature | Medium | Action (auto) | SC-1 à SC-6, SC-10, SC-11 |
| 4 | UI bénévole : liste, retraits, dates fermées | Feature | Medium | Action (auto) | SC-7, SC-8, SC-12 |
| 5 | Rappel SMS et purge RGPD | Feature | Medium | Local (clés SMS) | P-8, P-9 |

## Fichiers touchés
- `src/domain/creneaux.ts` (nouveau ; importé directement, `src/domain/index.ts` ne le ré-exporte pas pour éviter un import circulaire)
- `tests/properties/001-reserver-creneau.test.ts`, `e2e/001-*.spec.ts` (scénarios)
- UI et API : à préciser dans les sous-issues 2 à 4

## Risques et points d'attention
- **Fuseau et changement d'heure** : calculer en Europe/Paris avec `Intl`, jamais `getHours()`. Tester les dates de bascule.
- **Concurrence** : deux adhérents sur la dernière place, le stockage doit refuser le second (P-1).
- **Intégration commande** : inconnue (point à valider) : peut changer les sous-issues 2 et 5.
- **RGPD** : pas de nom ni téléphone dans les journaux.
