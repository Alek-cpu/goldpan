import { applyCategoryRefinement } from './analysis/applyCategoryRefinement.js';
import { validateEmailAnalysis } from './analysis/validateEmailAnalysis.js';

import type { EmailAnalysisResult } from './types/emailAnalysis.js';
import type { EmailForAnalysis } from './types/emailForAnalysis.js';
import type { CategoryRefinementSuggestion } from './types/categoryRefinement.js';

const analysis: EmailAnalysisResult = {
  categories: [
    {
      name: 'Покупки',
      description: 'Письма о покупках',
      emailIds: ['1', '2'],
    },
    {
      name: 'Бонусы',
      description: 'Программы лояльности',
      emailIds: ['3', '4'],
    },
    {
      name: 'Безопасность',
      description: 'Оповещения безопасности',
      emailIds: ['5'],
    },
  ],
};

const acceptedSuggestions: CategoryRefinementSuggestion[] = [
  {
    action: 'merge',
    categories: ['Покупки', 'Бонусы'],
    suggestedName: 'Магазины и акции',
    reason: 'Категории связаны с покупками и бонусами.',
  },
  {
    action: 'rename',
    categories: ['Безопасность'],
    suggestedName: 'Безопасность аккаунта',
    reason: 'Более понятное название.',
  },
];

const emails: EmailForAnalysis[] = [
  { id: '1', from: '', subject: '', textPreview: '' },
  { id: '2', from: '', subject: '', textPreview: '' },
  { id: '3', from: '', subject: '', textPreview: '' },
  { id: '4', from: '', subject: '', textPreview: '' },
  { id: '5', from: '', subject: '', textPreview: '' },
];

const result = applyCategoryRefinement(
  analysis,
  acceptedSuggestions,
);

console.log('✨ Result:\n');

for (const category of result.categories) {
  console.log(
    `📁 ${category.name} — ${category.emailIds.length}`,
  );
}

const validation = validateEmailAnalysis(
  emails,
  result,
);

console.log('\n🔎 Validation:');
console.log(`Input: ${validation.totalInput}`);
console.log(`Assigned: ${validation.totalAssigned}`);
console.log(`Missing: ${validation.missingIds.length}`);
console.log(`Duplicates: ${validation.duplicateIds.length}`);
console.log(`Unknown: ${validation.unknownIds.length}`);
console.log(`Valid: ${validation.isValid}`);