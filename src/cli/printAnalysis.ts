import type { EmailAnalysisResult } from '../types/emailAnalysis.js';

export function printAnalysis(
  analysis: EmailAnalysisResult,
): void {
  const totalEmails = analysis.categories.reduce(
    (total, category) =>
      total + category.emailIds.length,
    0,
  );

  console.log('\n🥣 Goldpan\n');

  console.log(
    `Проанализировано писем: ${totalEmails}`,
  );

  console.log(
    `Найдено категорий: ${analysis.categories.length}`,
  );

  console.log('\n📁 Категории:\n');

  const sortedCategories = [...analysis.categories].sort(
    (a, b) =>
      b.emailIds.length - a.emailIds.length,
  );

  sortedCategories.forEach((category, index) => {
    console.log(
      `${index + 1}. ${category.name} — ${category.emailIds.length}`,
    );
  });
}