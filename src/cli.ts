import 'dotenv/config';

import { readFile } from 'node:fs/promises';

import { panEmails } from './analysis/panEmails.js';
import { refineCategories } from './analysis/refineCategories.js';
import { validateCategoryRefinement } from './analysis/validateCategoryRefinement.js';
import { applyCategoryRefinement } from './analysis/applyCategoryRefinement.js';

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
  const analysis = await panEmails(emails);

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
      'Category refinement failed validation',
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