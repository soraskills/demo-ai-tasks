/**
 * Domaine de Créneau. Les interfaces sont définies dans plan/<NNN>.md ;
 * tant qu'une fonction n'est pas implémentée, elle lève NonImplemente
 * et les tests de propriété correspondants sont marqués « skipped » (pas « failed »).
 */
export class NonImplemente extends Error {
  constructor(quoi = 'fonction') {
    super(`NON_IMPLEMENTE: ${quoi}`);
    this.name = 'NonImplemente';
  }
}
