import { describe, expect, test } from 'vitest';
import { NonImplemente } from '../../src/domain';

describe('outillage SDLC', () => {
  test('NonImplemente porte le marqueur reconnu par propriete()', () => {
    expect(new NonImplemente('reserver').message).toContain('NON_IMPLEMENTE');
  });
});
