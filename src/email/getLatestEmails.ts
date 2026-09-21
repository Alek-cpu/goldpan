import type { ImapFlow } from 'imapflow';

import type { Email } from '../types/email.js';

export async function getLatestEmails(
    client: ImapFlow,
    limit = 5,
): Promise<Email[]> {
    const lock = await client.getMailboxLock('INBOX');

    try {
        const totalMessages = client.mailbox ? client.mailbox.exists : 0;

        if (totalMessages === 0) {
            return [];
        }

        const start = Math.max(1, totalMessages - limit + 1);

        const emails: Email[] = [];

        for await (const message of client.fetch(`${start}:*`, {
            uid: true,
            envelope: true,
        })) {
            emails.push({
                id: String(message.uid),

                from:
                    message.envelope?.from
                        ?.map((address) => {
                            if (address.name) {
                                return address.name;
                            }

                            if (address.address) {
                                return address.address;
                            }

                            return 'Unknown';
                        })
                        .join(', ') ?? 'Unknown',

                subject: message.envelope?.subject ?? '(no subject)',

                date: message.envelope?.date
                    ? new Date(message.envelope.date)
                    : new Date(0),
            });
        }

        return emails.reverse();
    } finally {
        lock.release();
    }
}