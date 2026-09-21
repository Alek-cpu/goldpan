import { describe, expect, it } from 'vitest';

import { applyCategoryRefinement } from '../applyCategoryRefinement.js';

import type { EmailAnalysisResult } from '../../types/emailAnalysis.js';
import type { CategoryRefinementSuggestion } from '../../types/categoryRefinement.js';

describe('applyCategoryRefinement', () => {
  it('merges categories', () => {
    const analysis: EmailAnalysisResult = {
      categories: [
        {
          name: 'Покупки',
          description: 'Покупки',
          emailIds: ['1', '2'],
        },
        {
          name: 'Бонусы',
          description: 'Бонусы',
          emailIds: ['3', '4'],
        },
      ],
    };

    const suggestions: CategoryRefinementSuggestion[] = [
      {
        action: 'merge',
        categories: ['Покупки', 'Бонусы'],
        suggestedName: 'Магазины и акции',
        reason: 'Похожие категории',
      },
    ];

    const result = applyCategoryRefinement(
      analysis,
      suggestions,
    );

    expect(result.categories).toHaveLength(1);

    expect(result.categories[0]?.name).toBe(
      'Магазины и акции',
    );

    expect(result.categories[0]?.emailIds).toEqual([
      '1',
      '2',
      '3',
      '4',
    ]);
  });

  it('renames category', () => {
    const analysis: EmailAnalysisResult = {
      categories: [
        {
          name: 'Безопасность',
          description: 'Оповещения',
          emailIds: ['1'],
        },
      ],
    };

    const suggestions: CategoryRefinementSuggestion[] = [
      {
        action: 'rename',
        categories: ['Безопасность'],
        suggestedName: 'Безопасность аккаунта',
        reason: 'Более понятное название',
      },
    ];

    const result = applyCategoryRefinement(
      analysis,
      suggestions,
    );

    expect(result.categories[0]?.name).toBe(
      'Безопасность аккаунта',
    );

    expect(result.categories[0]?.emailIds).toEqual(['1']);
  });

  it('rejects rename to an existing category', () => {
    const analysis: EmailAnalysisResult = {
      categories: [
        {
          name: 'Покупки',
          description: '',
          emailIds: ['1', '2'],
        },
        {
          name: 'Банки',
          description: '',
          emailIds: ['3', '4'],
        },
      ],
    };

    const suggestions: CategoryRefinementSuggestion[] = [
      {
        action: 'rename',
        categories: ['Покупки'],
        suggestedName: 'Банки',
        reason: '',
      },
    ];

    expect(() =>
      applyCategoryRefinement(
        analysis,
        suggestions,
      ),
    ).toThrow('category already exists');
  });
});