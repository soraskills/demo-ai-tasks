import fc from 'fast-check';
import { describe, expect } from 'vitest';
import { propriete } from '../sdlc';
import {
  CAPACITE, annuler, creneauxDuJour, deplacer, heureAffichee, heureRappel,
  modifiable, purger, reserver, type Creneau, type Etat,
} from '../../src/domain/creneaux';

const H = 3_600_000;
const MIN = 60_000;
const VIDE: Etat = { reservations: [] };

const jourArb = fc
  .integer({ min: Date.UTC(2026, 0, 1), max: Date.UTC(2028, 11, 31) })
  .map((t) => new Date(t).toISOString().slice(0, 10));
const instantArb = fc.date({ min: new Date('2026-01-01'), max: new Date('2029-01-01'), noInvalidDate: true });
const jourParis = (d: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
// Rejoue le corps sous plusieurs fuseaux de processus : le résultat ne doit pas en dépendre.
const FUSEAUX = ['UTC', 'Europe/Paris', 'America/New_York', 'Pacific/Auckland'];
function sousFuseaux(corps: () => void) {
  const avant = process.env.TZ;
  try {
    for (const tz of FUSEAUX) { process.env.TZ = tz; corps(); }
  } finally {
    if (avant === undefined) delete process.env.TZ; else process.env.TZ = avant;
  }
}
// Jours de changement d'heure (Europe/Paris) et voisins, 2026-2028.
const BASCULES = [
  '2026-03-26', '2026-03-27', '2026-03-28', '2026-03-31', '2026-10-27', '2026-10-30', '2026-10-31',
  '2027-03-25', '2027-03-26', '2027-03-27', '2027-03-30', '2027-10-26', '2027-10-29', '2027-10-30',
  '2028-03-28', '2028-03-31', '2028-10-27', '2028-10-31',
];
const parisParts = (d: Date) =>
  Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Paris', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(d).map((p) => [p.type, p.value]),
  );

// Opérations aléatoires sur un petit univers (4 créneaux, 8 commandes), toutes à plus de 24 h.
const NOW = new Date('2026-12-01T08:00:00Z');
const creneau = (i: number): Creneau => ({ debut: new Date(Date.UTC(2026, 11, 8, 16 + Math.floor(i / 4), (i % 4) * 15)) });
const opArb = fc.oneof(
  fc.record({ t: fc.constant('r' as const), c: fc.integer({ min: 0, max: 7 }), i: fc.integer({ min: 0, max: 3 }) }),
  fc.record({ t: fc.constant('a' as const), c: fc.integer({ min: 0, max: 7 }), i: fc.constant(0) }),
  fc.record({ t: fc.constant('d' as const), c: fc.integer({ min: 0, max: 7 }), i: fc.integer({ min: 0, max: 3 }) }),
);
type Op = { t: 'r' | 'a' | 'd'; c: number; i: number };
function appliquer(etat: Etat, o: Op): Etat {
  const cmd = `cmd-${o.c}`;
  const res =
    o.t === 'r' ? reserver(etat, { commande: cmd, creneau: creneau(o.i).debut.getTime() }, creneau(o.i))
    : o.t === 'a' ? annuler(etat, cmd, NOW)
    : deplacer(etat, cmd, creneau(o.i), NOW);
  return res.ok ? res.etat : etat;
}
const rejouer = (ops: Op[]) => ops.reduce(appliquer, VIDE);

describe('spec 001', () => {
  propriete('[001:P-1] la capacité d’un créneau n’est jamais dépassée', () =>
    fc.assert(fc.property(fc.array(opArb, { maxLength: 60 }), (ops) => {
      const etat = rejouer(ops);
      const parCreneau = new Map<number, number>();
      for (const r of etat.reservations) parCreneau.set(r.creneau, (parCreneau.get(r.creneau) ?? 0) + 1);
      return [...parCreneau.values()].every((n) => n <= CAPACITE);
    })));

  propriete('[001:P-2] réserver puis annuler rend l’état initial', () =>
    fc.assert(fc.property(fc.array(opArb, { maxLength: 30 }), fc.integer({ min: 0, max: 3 }), (ops, i) => {
      const etat = rejouer(ops);
      const res = reserver(etat, { commande: 'nouvelle', creneau: creneau(i).debut.getTime() }, creneau(i));
      fc.pre(res.ok);
      const apres = annuler((res as { etat: Etat }).etat, 'nouvelle', NOW);
      expect(apres.ok && apres.etat).toEqual(etat);
    })));

  propriete('[001:P-3] annuler est idempotent', () =>
    fc.assert(fc.property(fc.array(opArb, { maxLength: 30 }), fc.integer({ min: 0, max: 7 }), (ops, c) => {
      const etat = rejouer(ops);
      const une = annuler(etat, `cmd-${c}`, NOW);
      const e1 = une.ok ? une.etat : etat;
      const deux = annuler(e1, `cmd-${c}`, NOW);
      expect(deux.ok ? deux.etat : e1).toEqual(e1);
    })));

  propriete('[001:P-4] une réservation active par commande, déplacer conserve le total', () =>
    fc.assert(fc.property(fc.array(opArb, { maxLength: 60 }), fc.integer({ min: 0, max: 7 }), fc.integer({ min: 0, max: 3 }), (ops, c, i) => {
      const etat = rejouer(ops);
      const commandes = etat.reservations.map((r) => r.commande);
      expect(new Set(commandes).size).toBe(commandes.length);
      const apres = appliquer(etat, { t: 'd', c, i });
      expect(apres.reservations.length).toBe(etat.reservations.length);
    })));

  propriete('[001:P-5] les créneaux restent dans les horaires d’ouverture (Europe/Paris)', () =>
    sousFuseaux(() => fc.assert(fc.property(jourArb, (jour) => {
      const liste = creneauxDuJour(jour);
      const midi = new Date(`${jour}T12:00:00Z`);
      const ouvert = ['Tue', 'Fri'].includes(parisParts(midi).weekday);
      if (!ouvert) return liste.length === 0;
      if (liste.length !== 8) return false;
      return liste.every((c, k) => {
        const p = parisParts(c.debut);
        const minutes = Number(p.hour) * 60 + Number(p.minute);
        const suivant = liste[k + 1];
        return minutes === 17 * 60 + 15 * k && (!suivant || suivant.debut.getTime() - c.debut.getTime() === 15 * MIN);
      });
    }), { examples: BASCULES.map((j) => [j] as [string]) })));

  propriete('[001:P-6] l’heure affichée est celle d’Europe/Paris', () =>
    sousFuseaux(() => fc.assert(fc.property(instantArb, (d) => {
      const p = parisParts(d);
      expect(heureAffichee(d)).toBe(`${p.hour}:${p.minute}`);
    }), { examples: ['2026-03-29T00:59:59Z', '2026-03-29T01:00:00Z', '2026-10-25T00:59:59Z', '2026-10-25T01:00:00Z'].map((t) => [new Date(t)] as [Date]) })));

  propriete('[001:P-7] modification possible si et seulement si au moins 24 h avant', () =>
    fc.assert(fc.property(instantArb, fc.integer({ min: -48 * 60, max: 96 * 60 }), (debut, deltaMin) => {
      const maintenant = new Date(debut.getTime() - deltaMin * MIN);
      expect(modifiable(maintenant, { debut })).toBe(deltaMin * MIN >= 24 * H);
    }), { examples: [1438, 1439, 1440, 1441, 1442].map((m) => [new Date('2026-12-08T16:00:00Z'), m] as [Date, number]) }));

  propriete('[001:P-8] le rappel part 1 h avant le créneau', () =>
    fc.assert(fc.property(instantArb, (debut) => {
      expect(heureRappel({ debut }).getTime()).toBe(debut.getTime() - H);
    })));

  propriete('[001:P-9] la purge supprime nom et téléphone de la distribution, pas des autres', () =>
    fc.assert(fc.property(fc.array(fc.integer({ min: 0, max: 7 }), { maxLength: 8 }), (jours) => {
      const base = Date.UTC(2026, 11, 1, 16);
      const etat: Etat = {
        reservations: jours.map((j, k) => ({
          commande: `c${k}`, creneau: base + j * 24 * H, nom: 'Nom', telephone: '0600000000', recupere: false,
        })),
      };
      const cible = jourParis(new Date(base + 3 * 24 * H));
      const apres = purger(etat, cible);
      apres.reservations.forEach((r, k) => {
        const dujour = jourParis(new Date(r.creneau)) === cible;
        expect(r.nom === undefined && r.telephone === undefined).toBe(dujour);
        if (!dujour) expect(r).toEqual(etat.reservations[k]);
      });
    })));
});
