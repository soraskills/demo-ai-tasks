import { test } from 'vitest';

/**
 * Déclare un test de propriété rattaché à la spec : propriete('[001:P-1] …', () => fc.assert(…)).
 * Si le domaine n'est pas encore implémenté (NonImplemente), le test est marqué « skipped » :
 * la CI des PR reste verte, mais la gate de déploiement le compte comme « non vert ».
 */
export function propriete(titre: string, corps: () => unknown | Promise<unknown>) {
  test(titre, async (ctx) => {
    try {
      await corps();
    } catch (e) {
      if (estNonImplemente(e)) ctx.skip();
      throw e;
    }
  });
}

/** Cherche le marqueur dans l'erreur et sa chaîne de causes (fast-check enveloppe l'erreur d'origine). */
function estNonImplemente(e: unknown, profondeur = 0): boolean {
  if (!e || profondeur > 5) return false;
  if (String((e as Error).message ?? e).includes('NON_IMPLEMENTE')) return true;
  return estNonImplemente((e as Error).cause, profondeur + 1);
}
