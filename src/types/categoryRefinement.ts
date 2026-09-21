export type CategoryRefinementSuggestion = {
  action: 'keep' | 'merge' | 'rename';
  categories: string[];
  suggestedName: string | null;
  reason: string;
};

export type CategoryRefinementResult = {
  suggestions: CategoryRefinementSuggestion[];
};