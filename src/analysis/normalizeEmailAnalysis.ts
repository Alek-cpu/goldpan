import type {
  EmailAnalysisResult,
  EmailCategory,
} from '../types/emailAnalysis.js';

export function normalizeEmailAnalysis(
  result: EmailAnalysisResult,
): EmailAnalysisResult {
  const usedIds = new Set<string>();

  const categories: EmailCategory[] = result.categories
    .map((category) => {
      const emailIds = category.emailIds.filter((id) => {
        if (usedIds.has(id)) {
          return false;
        }

        usedIds.add(id);
        return true;
      });

      return {
        ...category,
        emailIds,
      };
    })
    .filter((category) => category.emailIds.length > 0);

  return {
    categories,
  };
}