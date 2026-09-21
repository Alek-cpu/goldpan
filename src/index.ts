import 'dotenv/config';

import { createImapClient } from './email/imapClient.js';
import { getMailboxes } from './email/getMailboxes.js';
import { getLatestEmails } from './email/getLatestEmails.js';
import {saveEmails} from './storage/saveEmails.js';

async function main() {
    const client = createImapClient();

    try {
        console.log('🥣 Goldpan starting...');
        console.log('📡 Connecting to IMAP...');

        await client.connect();
        console.log('✅ Connected to IMAP server');
        // const mailboxes = await getMailboxes(client);

        const emails = await getLatestEmails(client, 50);

        console.log(`Fetched ${emails.length} emails`);

        await saveEmails(emails, './data/emails.json');

        console.log(`💾 Saved ${emails.length} emails to data/emails.json`);
    } catch (error) {
        console.error('❌ Failed to connect to IMAP server:');
        console.error(error);
    } finally {
        await client.logout().catch(() => { });
    }
}

main();