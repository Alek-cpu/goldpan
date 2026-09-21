import type { EmailForAnalysis } from '../types/emailForAnalysis.js';
import type { EmailAnalysisResult } from '../types/emailAnalysis.js';

export function filterAnalysisByInput(
  emails: EmailForAnalysis[],
  analysis: EmailAnalysisResult,
): EmailAnalysisResult {
  const allowedIds = new Set(
    emails.map((email) => email.id),
  );

  return {
    categories: analysis.categories
      .map((category) => ({
        ...category,
        emailIds: category.emailIds.filter(
          (id) => allowedIds.has(id),
        ),
      }))
      .filter(
        (category) => category.emailIds.length > 0,
      ),
  };
}