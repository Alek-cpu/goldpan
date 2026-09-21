import type { Email } from '../types/email.js';
import type { EmailAnalysisResult } from '../types/emailAnalysis.js';

import { prepareEmailsForAnalysis } from './prepareEmailsForAnalysis.js';
import { analyzeEmails } from './analyzeEmails.js';
import { analyzeMissingEmails } from './analyzeMissingEmails.js';
import { normalizeEmailAnalysis } from './normalizeEmailAnalysis.js';
import { validateEmailAnalysis } from './validateEmailAnalysis.js';
import { mergeEmailAnalysis } from './mergeEmailAnalysis.js';

export async function panEmails(
  emails: Email[],
): Promise<EmailAnalysisResult> {
  const prepared = prepareEmailsForAnalysis(emails);

  // Первый проход
  const rawResult = await analyzeEmails(prepared);
  const firstResult = normalizeEmailAnalysis(rawResult);

  const firstValidation = validateEmailAnalysis(
    prepared,
    firstResult,
  );

  // Всё получилось с первого раза
  if (firstValidation.isValid) {
    return firstResult;
  }

  // Находим письма, которые модель пропустила
  const missingEmails = prepared.filter((email) =>
    firstValidation.missingIds.includes(email.id),
  );

  // Если проблема не в пропущенных письмах,
  // второй проход нам не поможет
  if (missingEmails.length === 0) {
    throw new Error('Email analysis validation failed');
  }

  // Второй проход
  const secondRawResult = await analyzeMissingEmails(
    missingEmails,
    firstResult.categories,
  );

  const secondResult = normalizeEmailAnalysis(
    secondRawResult,
  );

  const secondValidation = validateEmailAnalysis(
    missingEmails,
    secondResult,
  );

  if (!secondValidation.isValid) {
    throw new Error(
      'Second email analysis pass failed validation',
    );
  }

  // Объединяем оба результата
  const finalResult = mergeEmailAnalysis(
    firstResult,
    secondResult,
  );

  // Последняя страховка
  const finalValidation = validateEmailAnalysis(
    prepared,
    finalResult,
  );

  if (!finalValidation.isValid) {
    throw new Error(
      'Final email analysis failed validation',
    );
  }

  return finalResult;
}