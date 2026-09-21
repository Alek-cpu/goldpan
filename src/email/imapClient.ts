import { ImapFlow } from 'imapflow';

export function createImapClient() {
    const host = process.env.IMAP_HOST;
    const port = Number(process.env.IMAP_PORT);
    const user = process.env.IMAP_USER;
    const password = process.env.IMAP_PASSWORD;

    if (!host || !port || !user || !password) {
        throw new Error('IMAP configuration is missing in environment variables');
    }

    return new ImapFlow({
        host,
        port: Number(process.env.IMAP_PORT ?? 993),
        secure: true,
        auth: {
            user,
            pass: password
        },

        logger: false,
    });
}