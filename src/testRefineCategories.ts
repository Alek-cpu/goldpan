import 'dotenv/config';

import { readFile } from 'node:fs/promises';

import { panEmails } from './analysis/panEmails.js';
import { refineCategories } from './analysis/refineCategories.js';
import { validateCategoryRefinement } from './analysis/validateCategoryRefinement.js';

import type { Email } from './types/email.js';

async function main() {
    console.log('🥣 Goldpan Category Refinement');

    const raw = await readFile('./data/emails.json', 'utf-8');

    const emails = JSON.parse(raw) as Email[];

    console.log(`📨 Loaded ${emails.length} emails`);

    const analysis = await panEmails(emails);

    console.log(
        `📁 Found ${analysis.categories.length} categories`,
    );

    console.log('🧠 Asking GigaChat for refinement suggestions...');

    const refinement = await refineCategories(analysis);

    const validation = validateCategoryRefinement(
        analysis,
        refinement,
    );

    console.log('\n✨ Suggestions:\n');

    for (const suggestion of refinement.suggestions) {
        console.log(
            `${suggestion.action.toUpperCase()}: ${suggestion.categories.join(' + ')}`,
        );

        if (suggestion.suggestedName) {
            console.log(`   → ${suggestion.suggestedName}`);
        }

        console.log(`   ${suggestion.reason}`);
        console.log();
    }

    console.log('🔎 Refinement validation:');
    console.log(`Input categories: ${validation.totalInput}`);
    console.log(`Covered: ${validation.totalCovered}`);
    console.log(`Missing: ${validation.missingCategories.length}`);
    console.log(
        `Duplicates: ${validation.duplicateCategories.length}`,
    );
    console.log(`Unknown: ${validation.unknownCategories.length}`);
    console.log(`Invalid: ${validation.invalidSuggestions}`);
    console.log(`Valid: ${validation.isValid}`);
}

main().catch((error) => {
    console.error('❌ Refinement failed:');
    console.error(error);
});