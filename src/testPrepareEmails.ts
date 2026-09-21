import { readFile } from 'node:fs/promises';

import { prepareEmailsForAnalysis } from './analysis/prepareEmailsForAnalysis.js';

import type { Email } from './types/email.js';

async function main() {
  const raw = await readFile('./data/emails.json', 'utf-8');

  const emails = JSON.parse(raw) as Email[];

  const prepared = prepareEmailsForAnalysis(emails);

  console.log(`📨 Original emails: ${emails.length}`);
  console.log(`🥣 Prepared emails: ${prepared.length}`);

  console.log('\nExample:');
  console.log(prepared[0]);
}

main().catch(console.error);