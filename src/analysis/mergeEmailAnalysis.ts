import type {
  EmailAnalysisResult,
  EmailCategory,
} from '../types/emailAnalysis.js';

export function mergeEmailAnalysis(
  first: EmailAnalysisResult,
  second: EmailAnalysisResult,
): EmailAnalysisResult {
  const categories = new Map<string, EmailCategory>();

  for (const category of first.categories) {
    categories.set(category.name, {
      ...category,
      emailIds: [...category.emailIds],
    });
  }

  for (const category of second.categories) {
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