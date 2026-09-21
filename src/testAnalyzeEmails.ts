import 'dotenv/config';

import { readFile } from 'node:fs/promises';

import { panEmails } from './analysis/panEmails.js';

import type { Email } from './types/email.js';

async function main() {
  console.log('🥣 Goldpan Panning started...');

  const raw = await readFile('./data/emails.json', 'utf-8');

  const emails = JSON.parse(raw) as Email[];

  console.log(`📨 Loaded ${emails.length} emails`);
  console.log('🧠 Starting panning pipeline...');

  const result = await panEmails(emails);

  console.log('\n✨ Final categories:\n');

  for (const category of result.categories) {
    console.log(
      `📁 ${category.name} — ${category.emailIds.length}`,
    );
  }

  console.log('\n✅ Panning completed successfully');
}

main().catch((error) => {
  console.error('❌ Panning failed:');
  console.error(error);
});