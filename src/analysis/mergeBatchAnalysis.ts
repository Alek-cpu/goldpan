import type {
  EmailAnalysisResult,
  EmailCategory,
} from '../types/emailAnalysis.js';

export function mergeBatchAnalysis(
  current: EmailAnalysisResult,
  batch: EmailAnalysisResult,
): EmailAnalysisResult {
  const categories = new Map<string, EmailCategory>();

  for (const category of current.categories) {
    categories.set(category.name, {
      ...category,
      emailIds: [...category.emailIds],
    });
  }

  for (const category of batch.categories) {
    const existing = categories.get(category.name);

    if (existing) {
      existing.emailIds.push(...category.emailIds);
      continue;
    }

    categories.set(category.name, {
      ...category,
      emailIds: [...category.emailIds],
    });
  }

  return {
    categories: [...categories.values()],
  };
}