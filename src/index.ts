import 'dotenv/config';

import { createImapClient } from './email/imapClient.js';

async function main() {
    const client = createImapClient();

    try {
        console.log('🥣 Goldpan starting...');
        console.log('📡 Connecting to IMAP...');

        await client.connect();
        console.log('✅ Connected to IMAP server');
    } catch (error) {
        console.error('❌ Failed to connect to IMAP server:');
        console.error(error);
    } finally {
        await client.logout().catch(() => {});
    }
}

main();