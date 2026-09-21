import 'dotenv/config';

import { readFile } from 'node:fs/promises';

import type { EmailAnalysisResult } from './types/emailAnalysis.js';

import { refineCategories } from './analysis/refineCategories.js';
import { validateCategoryRefinement } from './analysis/validateCategoryRefinement.js';
import { confirmRefinements } from './cli/confirmRefinements.js';
import { applyCategoryRefinement } from './analysis/applyCategoryRefinement.js';
import { printAnalysis } from './cli/printAnalysis.js';
import { completeCategoryRefinement } from './analysis/completeCategoryRefinement.js';
import { saveEmailAnalysis } from './storage/saveEmailAnalysis.js';

async function main() {
    console.log('🧠 Запускаем Refinement...');

    const raw = await readFile(
        './data/analysis.json',
        'utf-8',
    );

    const analysis =
        JSON.parse(raw) as EmailAnalysisResult;

    const rawRefinement =
        await refineCategories(
            analysis,
        );

    const refinement =
        completeCategoryRefinement(
            analysis,
            rawRefinement,
        );

    const validation =
        validateCategoryRefinement(
            analysis,
            refinement,
        );

    if (!validation.isValid) {
        throw new Error(
            [
                'Category refinement failed validation',
                `Input categories: ${validation.totalInput}`,
                `Covered: ${validation.totalCovered}`,
                `Missing: ${validation.missingCategories.join(', ') || 'none'}`,
                `Duplicates: ${validation.duplicateCategories.join(', ') || 'none'}`,
                `Unknown: ${validation.unknownCategories.join(', ') || 'none'}`,
                `Invalid suggestions: ${validation.invalidSuggestions}`,
            ].join('\n'),
        );
    }

    const accepted =
        await confirmRefinements(
            refinement,
        );

    const result =
        applyCategoryRefinement(
            analysis,
            accepted,
        );

    await saveEmailAnalysis(
        result,
        './data/refined-analysis.json',
    );

    console.log(
        '💾 Итоговая структура сохранена в data/refined-analysis.json',
    );

    console.log('\n✨ Итоговая структура:\n');

    printAnalysis(result);
}

main().catch((error: unknown) => {
    const message =
        error instanceof Error
            ? error.message
            : 'Unknown error';

    console.error(
        `\n❌ Goldpan refinement error:\n${message}`,
    );

    process.exitCode = 1;
});