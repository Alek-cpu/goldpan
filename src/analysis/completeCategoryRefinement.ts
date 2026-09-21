import type { EmailAnalysisResult } from '../types/emailAnalysis.js';
import type { CategoryRefinementResult } from '../types/categoryRefinement.js';

export function completeCategoryRefinement(
  analysis: EmailAnalysisResult,
  refinement: CategoryRefinementResult,
): CategoryRefinementResult {
  const coveredCategories = new Set(
    refinement.suggestions.flatMap(
      (suggestion) => suggestion.categories,
    ),
  );

  const missingCategories =
    analysis.categories.filter(
      (category) =>
        !coveredCategories.has(category.name),
    );

  if (missingCategories.length === 0) {
    return refinement;
  }

  return {
    suggestions: [
      ...refinement.suggestions,

      ...missingCategories.map((category) => ({
        action: 'keep' as const,
        categories: [category.name],
        suggestedName: null,
        reason:
          'Категория не была обработана моделью и оставлена без изменений.',
      })),
    ],
  };
}