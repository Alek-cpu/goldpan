import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

import type {
  CategoryRefinementResult,
  CategoryRefinementSuggestion,
} from '../types/categoryRefinement.js';

export async function confirmRefinements(
  refinement: CategoryRefinementResult,
): Promise<CategoryRefinementSuggestion[]> {
  const readline = createInterface({
    input,
    output,
  });

  const accepted: CategoryRefinementSuggestion[] = [];

  try {
    console.log('\n✨ Goldpan предлагает изменения:\n');

    for (const suggestion of refinement.suggestions) {
      if (suggestion.action === 'keep') {
        continue;
      }

      printSuggestion(suggestion);

      const answer = await readline.question(
        '\nПринять? [y/n]: ',
      );

      if (answer.trim().toLowerCase() === 'y') {
        accepted.push(suggestion);
        console.log('✅ Принято\n');
      } else {
        console.log('⏭️ Отклонено\n');
      }
    }
  } finally {
    readline.close();
  }

  return accepted;
}

function printSuggestion(
  suggestion: CategoryRefinementSuggestion,
): void {
  if (suggestion.action === 'rename') {
    console.log('✏️ Переименовать:');
    console.log(
      `   ${suggestion.categories[0]} → ${suggestion.suggestedName}`,
    );
  }

  if (suggestion.action === 'merge') {
    console.log('🔀 Объединить:');
    console.log(
      `   ${suggestion.categories.join(' + ')}`,
    );
    console.log(
      `   → ${suggestion.suggestedName}`,
    );
  }

  console.log(`   Причина: ${suggestion.reason}`);
}