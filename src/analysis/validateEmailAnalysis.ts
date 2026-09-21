import type { EmailForAnalysis } from '../types/emailForAnalysis.js';
import type { EmailAnalysisResult } from '../types/emailAnalysis.js';

export type EmailAnalysisValidation = {
  totalInput: number;
  totalAssigned: number;
  missingIds: string[];
  duplicateIds: string[];
  unknownIds: string[];
  isValid: boolean;
};

export function validateEmailAnalysis(
  emails: EmailForAnalysis[],
  result: EmailAnalysisResult,
): EmailAnalysisValidation {
  const inputIds = new Set(emails.map((email) => email.id));

  const assignedIds = result.categories.flatMap(
    (category) => category.emailIds,
  );

  const assignedSet = new Set(assignedIds);

  const missingIds = emails
    .map((email) => email.id)
    .filter((id) => !assignedSet.has(id));

  const unknownIds = assignedIds.filter(
    (id) => !inputIds.has(id),
  );

  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const id of assignedIds) {
    if (seen.has(id)) {
      duplicates.add(id);
    }

    seen.add(id);
  }

  return {
    totalInput: emails.length,
    totalAssigned: assignedSet.size,
    missingIds,
    duplicateIds: [...duplicates],
    unknownIds: [...new Set(unknownIds)],
    isValid:
      missingIds.length === 0 &&
      duplicates.size === 0 &&
      unknownIds.length === 0,
  };
}