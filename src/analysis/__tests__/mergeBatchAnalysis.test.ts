import { describe, expect, it } from 'vitest';

import { mergeBatchAnalysis } from '../mergeBatchAnalysis.js';

describe('mergeBatchAnalysis', () => {
    it('merges existing categories and adds new ones', () => {
        const current = {
            categories: [
                {
                    name: 'Акции',
                    description: 'Акции и скидки',
                    emailIds: ['1', '2'],
                },
                {
                    name: 'Банки',
                    description: 'Банковские письма',
                    emailIds: ['3'],
                },
            ],
        };

        const batch = {
            categories: [
                {
                    name: 'Акции',
                    description: 'Акции и скидки',
                    emailIds: ['51', '52'],
                },
                {
                    name: 'Работа',
                    description: 'Рабочие письма',
                    emailIds: ['53'],
                },
            ],
        };

        const result = mergeBatchAnalysis(
            current,
            batch,
        );

        expect(result.categories).toHaveLength(3);

        expect(
            result.categories.find(
                (category) => category.name === 'Акции',
            )?.emailIds,
        ).toEqual([
            '1',
            '2',
            '51',
            '52',
        ]);

        expect(
            result.categories.find(
                (category) => category.name === 'Банки',
            )?.emailIds,
        ).toEqual(['3']);

        expect(
            result.categories.find(
                (category) => category.name === 'Работа',
            )?.emailIds,
        ).toEqual(['53']);
    });

    it('does not mutate original analysis', () => {
        const current = {
            categories: [
                {
                    name: 'Акции',
                    description: '',
                    emailIds: ['1'],
                },
            ],
        };

        const batch = {
            categories: [
                {
                    name: 'Акции',
                    description: '',
                    emailIds: ['2'],
                },
            ],
        };

        mergeBatchAnalysis(current, batch);

        expect(
            current.categories[0]?.emailIds,
        ).toEqual(['1']);

        expect(
            batch.categories[0]?.emailIds,
        ).toEqual(['2']);
    });
});