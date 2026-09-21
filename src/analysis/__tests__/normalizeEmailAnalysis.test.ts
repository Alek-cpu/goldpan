import { describe, expect, it } from 'vitest';

import { normalizeEmailAnalysis } from '../normalizeEmailAnalysis.js';

describe('normalizeEmailAnalysis', () => {
  it('removes duplicate email ids', () => {
    const result = normalizeEmailAnalysis({
      categories: [
        {
          name: 'Покупки',
          description: '',
          emailIds: ['1', '2'],
        },
        {
          name: 'Банки',
          description: '',
          emailIds: ['2', '3'],
        },
      ],
    });

    expect(result.categories[0]?.emailIds).toEqual([
      '1',
      '2',
    ]);

    expect(result.categories[1]?.emailIds).toEqual([
      '3',
    ]);
  });

  it('normalizes aliases of other category', () => {
    const result = normalizeEmailAnalysis({
      categories: [
        {
          name: 'Прочие',
          description: '',
          emailIds: ['1'],
        },
        {
          name: 'Прочее',
          description: '',
          emailIds: ['2'],
        },
      ],
    });

    expect(result.categories).toHaveLength(1);

    expect(result.categories[0]?.name).toBe('Прочее');

    expect(result.categories[0]?.emailIds).toEqual([
      '1',
      '2',
    ]);
  });
});