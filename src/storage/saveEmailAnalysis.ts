import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import type { EmailAnalysisResult } from '../types/emailAnalysis.js';

export async function saveEmailAnalysis(
    analysis: EmailAnalysisResult,
    filePath: string,
): Promise<void> {
    await mkdir(
        dirname(filePath),
        { recursive: true },
    );

    await writeFile(
        filePath,
        JSON.stringify(analysis, null, 2),
        'utf-8',
    );
}