import { NonImplemente } from './index';

export const CAPACITE = 5;
export const FUSEAU = 'Europe/Paris';

export interface Creneau { debut: Date }
export interface Reservation {
  commande: string;
  creneau: number;
  nom?: string;
  telephone?: string;
  recupere: boolean;
}
/** Retrait sans créneau (R-9, SC-8), hors capacité. */
export interface RetraitSansCreneau { distribution: string; nom: string; recupere: boolean }
export interface Etat { reservations: readonly Reservation[]; sansCreneau?: readonly RetraitSansCreneau[] }
export type Resultat =
  | { ok: true; etat: Etat }
  | { ok: false; raison: 'complet' | 'deja_reserve' | 'trop_tard' | 'introuvable' };

/** Dates fermées (jours fériés, distributions annulées), au format YYYY-MM-DD, jour de Paris. */
export type Fermetures = ReadonlySet<string>;

export function creneauxDuJour(_jour: string, _fermetures: Fermetures = new Set()): Creneau[] { throw new NonImplemente('creneauxDuJour'); }
/** Les 2 prochaines distributions (YYYY-MM-DD, Paris) ouvertes à la réservation (R-12). */
export function distributionsOuvertes(_maintenant: Date, _fermetures: Fermetures = new Set()): string[] { throw new NonImplemente('distributionsOuvertes'); }
export function heureAffichee(_instant: Date): string { throw new NonImplemente('heureAffichee'); }
export function placesRestantes(_etat: Etat, _creneau: Creneau): number { throw new NonImplemente('placesRestantes'); }
export function modifiable(_maintenant: Date, _creneau: Creneau): boolean { throw new NonImplemente('modifiable'); }
export function reserver(_etat: Etat, _r: Omit<Reservation, 'recupere'>, _creneau: Creneau): Resultat { throw new NonImplemente('reserver'); }
export function annuler(_etat: Etat, _commande: string, _maintenant: Date): Resultat { throw new NonImplemente('annuler'); }
export function deplacer(_etat: Etat, _commande: string, _vers: Creneau, _maintenant: Date): Resultat { throw new NonImplemente('deplacer'); }
export function heureRappel(_creneau: Creneau): Date { throw new NonImplemente('heureRappel'); }
export function purger(_etat: Etat, _jour: string): Etat { throw new NonImplemente('purger'); }
