import 'dotenv/config';

import { readFile } from 'node:fs/promises';

import { panEmailsInBatches } from './analysis/panEmailsInBatches.js';
import { refineCategories } from './analysis/refineCategories.js';
import { validateCategoryRefinement } from './analysis/validateCategoryRefinement.js';
import { applyCategoryRefinement } from './analysis/applyCategoryRefinement.js';
import { saveEmailAnalysis } from './storage/saveEmailAnalysis.js';

import { printAnalysis } from './cli/printAnalysis.js';
import { confirmRefinements } from './cli/confirmRefinements.js';

import type { Email } from './types/email.js';

async function main() {
    console.log('⛏️ Запускаем Panning...');

    const raw = await readFile(
        './data/emails.json',
        'utf-8',
    );

    const emails = JSON.parse(raw) as Email[];

    // 1. Анализируем письма
    const analysis =
        await panEmailsInBatches(emails);

    await saveEmailAnalysis(
        analysis,
        './data/analysis.json',
    );

    console.log(
        '💾 Результат Panning сохранён в data/analysis.json',
    );

    printAnalysis(analysis);

    // 2. Просим GigaChat предложить улучшения
    console.log('\n🧠 Анализируем структуру категорий...');

    const refinement = await refineCategories(analysis);

    // 3. Проверяем ответ LLM
    const validation = validateCategoryRefinement(
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

    // 4. Пользователь выбирает изменения
    const acceptedSuggestions =
        await confirmRefinements(refinement);

    // 5. Применяем только принятые
    const finalAnalysis = applyCategoryRefinement(
        analysis,
        acceptedSuggestions,
    );

    // 6. Показываем итог
    console.log('\n🏆 Итоговая структура:');

    printAnalysis(finalAnalysis);
}

main().catch((error: unknown) => {
    console.error('\n❌ Goldpan error:');

    if (error instanceof Error) {
        console.error(error.message);
    } else {
        console.error(error);
    }

    process.exitCode = 1;
});