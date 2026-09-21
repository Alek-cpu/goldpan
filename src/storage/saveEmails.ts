import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import type { Email } from '../types/email.js';

export async function saveEmails(
    emails: Email[],
    filePath: string
): Promise<void> {
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, JSON.stringify(emails, null, 2),
        'utf-8',
    );
}