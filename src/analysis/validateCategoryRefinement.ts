import type { EmailAnalysisResult } from '../types/emailAnalysis.js';
import type { CategoryRefinementResult } from '../types/categoryRefinement.js';

export type CategoryRefinementValidation = {
  totalInput: number;
  totalCovered: number;
  missingCategories: string[];
  duplicateCategories: string[];
  unknownCategories: string[];
  invalidSuggestions: number;
  isValid: boolean;
};

export function validateCategoryRefinement(
  analysis: EmailAnalysisResult,
  refinement: CategoryRefinementResult,
): CategoryRefinementValidation {
  const inputNames = analysis.categories.map(
    (category) => category.name,
  );

  const inputSet = new Set(inputNames);

  const coveredNames = refinement.suggestions.flatMap(
    (suggestion) => suggestion.categories,
  );

  const coveredSet = new Set(
    coveredNames.filter((name) => inputSet.has(name)),
  );

  const missingCategories = inputNames.filter(
    (name) => !coveredSet.has(name),
  );

  const unknownCategories = [
    ...new Set(
      coveredNames.filter((name) => !inputSet.has(name)),
    ),
  ];

  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const name of coveredNames) {
    if (seen.has(name)) {
      duplicates.add(name);
    }

    seen.add(name);
  }

  let invalidSuggestions = 0;

  for (const suggestion of refinement.suggestions) {
    if (
      suggestion.action === 'merge' &&
      suggestion.categories.length < 2
    ) {
      invalidSuggestions++;
    }

    if (
      suggestion.action === 'keep' &&
      suggestion.categories.length !== 1
    ) {
      invalidSuggestions++;
    }

    if (
      suggestion.action === 'rename' &&
      suggestion.categories.length !== 1
    ) {
      invalidSuggestions++;
    }

    if (
      suggestion.action === 'keep' &&
      suggestion.suggestedName !== null
    ) {
      invalidSuggestions++;
    }

    if (
      (suggestion.action === 'merge' ||
        suggestion.action === 'rename') &&
      !suggestion.suggestedName
    ) {
      invalidSuggestions++;
    }
  }

  return {
    totalInput: inputNames.length,
    totalCovered: coveredSet.size,
    missingCategories,
    duplicateCategories: [...duplicates],
    unknownCategories,
    invalidSuggestions,
    isValid:
      missingCategories.length === 0 &&
      duplicates.size === 0 &&
      unknownCategories.length === 0 &&
      invalidSuggestions === 0,
  };
}