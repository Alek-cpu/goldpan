export function splitIntoBatches<T>(
    items: T[],
    batchSize: number,
): T[][] {
    if (batchSize <= 0) {
        throw new Error(
            'Batch size must be greater than 0',
        );
    }

    const batches: T[][] = [];

    for (
        let index = 0;
        index < items.length;
        index += batchSize
    ) {
        batches.push(
            items.slice(index, index + batchSize),
        );
    }

    return batches;
}