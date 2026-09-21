import type { ImapFlow } from 'imapflow';

export async function getMailboxes(client: ImapFlow) {
  const mailboxes = await client.list();

  return mailboxes;
}