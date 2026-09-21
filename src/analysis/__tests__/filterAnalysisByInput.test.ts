import { describe, expect, it } from 'vitest';

import { filterAnalysisByInput } from '../filterAnalysisByInput.js';

import type { EmailForAnalysis } from '../../types/emailForAnalysis.js';

describe('filterAnalysisByInput', () => {
    it('removes unknown email ids', () => {
        const emails: EmailForAnalysis[] = [
            {
                id: '1',
                from: '',
                subject: '',
                textPreview: '',
            },
            {
                id: '2',
                from: '',
                subject: '',
                textPreview: '',
            },
        ];

        const result = filterAnalysisByInput(
            emails,
            {
                categories: [
                    {
                        name: 'Покупки',
                        description: '',
                        emailIds: [
                            '1',
                            '2',
                            '999',
                        ],
                    },
                ],
            },
        );

        expect(
            result.categories[0]?.emailIds,
        ).toEqual(['1', '2']);
    });

    it('removes empty categories', () => {
        const emails: EmailForAnalysis[] = [
            {
                id: '1',
                from: '',
                subject: '',
                textPreview: '',
            },
        ];

        const result = filterAnalysisByInput(
            emails,
            {
                categories: [
                    {
                        name: 'Выдуманная категория',
                        description: '',
                        emailIds: ['999'],
                    },
                ],
            },
        );

        expect(result.categories).toEqual([]);
    });
});