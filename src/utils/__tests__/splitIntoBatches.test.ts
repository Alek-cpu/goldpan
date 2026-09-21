import { describe, expect, it } from 'vitest';

import { splitIntoBatches } from '../splitIntoBatches.js';

describe('splitIntoBatches', () => {
    it('splits items into batches', () => {
        const items = Array.from(
            { length: 237 },
            (_, index) => index,
        );

        const batches = splitIntoBatches(
            items,
            50,
        );

        expect(batches).toHaveLength(5);

        expect(
            batches.map((batch) => batch.length),
        ).toEqual([
            50,
            50,
            50,
            50,
            37,
        ]);
    });

    it('returns empty array for empty input', () => {
        const batches = splitIntoBatches(
            [],
            50,
        );

        expect(batches).toEqual([]);
    });

    it('throws for invalid batch size', () => {
        expect(() =>
            splitIntoBatches(
                [1, 2, 3],
                0,
            ),
        ).toThrow(
            'Batch size must be greater than 0',
        );
    });
});