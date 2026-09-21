import type {
  EmailAnalysisResult,
  EmailCategory,
} from '../types/emailAnalysis.js';

const OTHER_CATEGORY_NAME = 'Прочее';

const OTHER_CATEGORY_ALIASES = new Set([
  'прочее',
  'прочие',
  'другое',
  'другие',
]);

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
        name: normalizeCategoryName(category.name),
        emailIds,
      };
    })
    .filter((category) => category.emailIds.length > 0);

  return {
    categories: mergeSameCategories(categories),
  };
}

function normalizeCategoryName(name: string): string {
  const normalized = name.trim().toLowerCase();

  if (OTHER_CATEGORY_ALIASES.has(normalized)) {
    return OTHER_CATEGORY_NAME;
  }

  return name.trim();
}

function mergeSameCategories(
  categories: EmailCategory[],
): EmailCategory[] {
  const merged = new Map<string, EmailCategory>();

  for (const category of categories) {
    const existing = merged.get(category.name);

    if (existing) {
      existing.emailIds.push(...category.emailIds);
      continue;
    }

    merged.set(category.name, {
      ...category,
      emailIds: [...category.emailIds],
    });
  }

  return [...merged.values()];
}