import type { Email } from '../types/email.js';
import type { EmailForAnalysis } from '../types/emailForAnalysis.js';

const MAX_TEXT_LENGTH = 1000;

export function prepareEmailsForAnalysis(
  emails: Email[],
): EmailForAnalysis[] {
  return emails.map((email) => ({
    id: email.id,
    from: email.from.trim(),
    subject: email.subject.trim(),
    textPreview: cleanText(email.text).slice(0, MAX_TEXT_LENGTH),
  }));
}

function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}