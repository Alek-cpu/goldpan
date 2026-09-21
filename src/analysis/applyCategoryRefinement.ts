import type {
    EmailAnalysisResult,
    EmailCategory,
} from '../types/emailAnalysis.js';

import type {
    CategoryRefinementSuggestion,
} from '../types/categoryRefinement.js';

export function applyCategoryRefinement(
    analysis: EmailAnalysisResult,
    acceptedSuggestions: CategoryRefinementSuggestion[],
): EmailAnalysisResult {
    const categories = new Map<string, EmailCategory>();

    for (const category of analysis.categories) {
        categories.set(category.name, {
            ...category,
            emailIds: [...category.emailIds],
        });
    }

    for (const suggestion of acceptedSuggestions) {
        if (suggestion.action === 'keep') {
            continue;
        }

        if (suggestion.action === 'rename') {
            applyRename(categories, suggestion);
            continue;
        }

        if (suggestion.action === 'merge') {
            applyMerge(categories, suggestion);
        }
    }

    return {
        categories: [...categories.values()],
    };
}

function applyRename(
    categories: Map<string, EmailCategory>,
    suggestion: CategoryRefinementSuggestion,
): void {
    const oldName = suggestion.categories[0];
    const newName = suggestion.suggestedName;

    if (!oldName || !newName) {
        throw new Error('Invalid rename suggestion');
    }

    const category = categories.get(oldName);

    if (!category) {
        throw new Error(
            `Category "${oldName}" not found`,
        );
    }

    if (
        oldName !== newName &&
        categories.has(newName)
    ) {
        throw new Error(
            `Cannot rename "${oldName}" to "${newName}": category already exists`,
        );
    }

    categories.delete(oldName);

    categories.set(newName, {
        ...category,
        name: newName,
    });
}

function applyMerge(
    categories: Map<string, EmailCategory>,
    suggestion: CategoryRefinementSuggestion,
): void {
    const newName = suggestion.suggestedName;

    if (!newName) {
        throw new Error('Invalid merge suggestion');
    }

    const mergingNames = new Set(
        suggestion.categories,
    );

    if (
        categories.has(newName) &&
        !mergingNames.has(newName)
    ) {
        throw new Error(
            `Cannot merge into "${newName}": category already exists`,
        );
    }

    const categoriesToMerge = suggestion.categories.map(
        (name) => {
            const category = categories.get(name);

            if (!category) {
                throw new Error(
                    `Category "${name}" not found`,
                );
            }

            return category;
        },
    );

    const emailIds = categoriesToMerge.flatMap(
        (category) => category.emailIds,
    );

    for (const category of categoriesToMerge) {
        categories.delete(category.name);
    }

    categories.set(newName, {
        name: newName,
        description: suggestion.reason,
        emailIds,
    });
}