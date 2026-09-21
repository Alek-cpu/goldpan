import { describe, expect, it } from 'vitest';

import { completeCategoryRefinement } from '../completeCategoryRefinement.js';

import type { EmailAnalysisResult } from '../../types/emailAnalysis.js';
import type { CategoryRefinementResult } from '../../types/categoryRefinement.js';

describe('completeCategoryRefinement', () => {
    it('adds keep suggestions for missing categories', () => {
        const analysis: EmailAnalysisResult = {
            categories: [
                {
                    name: 'Покупки',
                    description: 'Письма о покупках',
                    emailIds: ['1', '2'],
                },
                {
                    name: 'Обучение',
                    description: 'Письма об обучении',
                    emailIds: ['3'],
                },
            ],
        };

        const refinement: CategoryRefinementResult = {
            suggestions: [
                {
                    action: 'keep',
                    categories: ['Покупки'],
                    suggestedName: null,
                    reason: 'Категория уже достаточно точная',
                },
            ],
        };

        const result = completeCategoryRefinement(
            analysis,
            refinement,
        );

        expect(result.suggestions).toHaveLength(2);

        expect(result.suggestions).toContainEqual({
            action: 'keep',
            categories: ['Обучение'],
            suggestedName: null,
            reason:
                'Категория не была обработана моделью и оставлена без изменений.',
        });
    });

    it('does not change complete refinement', () => {
        const analysis: EmailAnalysisResult = {
            categories: [
                {
                    name: 'Покупки',
                    description: '',
                    emailIds: ['1'],
                },
                {
                    name: 'Обучение',
                    description: '',
                    emailIds: ['2'],
                },
            ],
        };

        const refinement: CategoryRefinementResult = {
            suggestions: [
                {
                    action: 'keep',
                    categories: ['Покупки'],
                    suggestedName: null,
                    reason: 'Оставить',
                },
                {
                    action: 'keep',
                    categories: ['Обучение'],
                    suggestedName: null,
                    reason: 'Оставить',
                },
            ],
        };

        const result = completeCategoryRefinement(
            analysis,
            refinement,
        );

        expect(result).toEqual(refinement);
    });

    it('recognizes categories covered by merge', () => {
        const analysis: EmailAnalysisResult = {
            categories: [
                {
                    name: 'Обучение и гранты',
                    description: '',
                    emailIds: ['1'],
                },
                {
                    name: 'Образование и гранты',
                    description: '',
                    emailIds: ['2'],
                },
            ],
        };

        const refinement: CategoryRefinementResult = {
            suggestions: [
                {
                    action: 'merge',
                    categories: [
                        'Обучение и гранты',
                        'Образование и гранты',
                    ],
                    suggestedName: 'Образование и гранты',
                    reason: 'Категории имеют одинаковый смысл',
                },
            ],
        };

        const result = completeCategoryRefinement(
            analysis,
            refinement,
        );

        expect(result.suggestions).toHaveLength(1);
        expect(result).toEqual(refinement);
    });
});