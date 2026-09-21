import 'dotenv/config';

import { createImapClient } from './email/imapClient.js';
import { getMailboxes } from './email/getMailboxes.js';

async function main() {
    const client = createImapClient();

    try {
        console.log('🥣 Goldpan starting...');
        console.log('📡 Connecting to IMAP...');

        await client.connect();
        console.log('✅ Connected to IMAP server');
        const mailboxes = await getMailboxes(client);
        console.log('\n📬 Mailboxes:', mailboxes);
        for (const mailbox of mailboxes) {
            console.log(
                `- ${mailbox.path}${mailbox.specialUse ? ` (${mailbox.specialUse})` : ''}`,
            );
        }
    } catch (error) {
        console.error('❌ Failed to connect to IMAP server:');
        console.error(error);
    } finally {
        await client.logout().catch(() => { });
    }
}

main();