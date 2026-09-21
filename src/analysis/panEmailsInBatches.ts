import type { Email } from '../types/email.js';
import type { EmailAnalysisResult } from '../types/emailAnalysis.js';

import { splitIntoBatches } from '../utils/splitIntoBatches.js';

import { prepareEmailsForAnalysis } from './prepareEmailsForAnalysis.js';
import { panEmails } from './panEmails.js';
import { analyzeEmailBatch } from './analyzeEmailBatch.js';
import { normalizeEmailAnalysis } from './normalizeEmailAnalysis.js';
import { validateEmailAnalysis } from './validateEmailAnalysis.js';
import { mergeBatchAnalysis } from './mergeBatchAnalysis.js';
import { analyzeMissingEmails } from './analyzeMissingEmails.js';
import { filterAnalysisByInput } from './filterAnalysisByInput.js';

const DEFAULT_BATCH_SIZE = 50;

export async function panEmailsInBatches(
    emails: Email[],
    batchSize = DEFAULT_BATCH_SIZE,
): Promise<EmailAnalysisResult> {
    if (emails.length === 0) {
        return {
            categories: [],
        };
    }

    const batches = splitIntoBatches(
        emails,
        batchSize,
    );

    console.log(
        `📦 Батчей для анализа: ${batches.length}`,
    );

    const firstBatch = batches[0];

    if (!firstBatch) {
        return {
            categories: [],
        };
    }

    console.log(
        `⛏️ Батч 1/${batches.length}: ${firstBatch.length} писем`,
    );

    let result = await panEmails(firstBatch);

    for (
        let index = 1;
        index < batches.length;
        index++
    ) {
        const batch = batches[index];

        if (!batch) {
            continue;
        }

        console.log(
            `⛏️ Батч ${index + 1}/${batches.length}: ${batch.length} писем`,
        );

        const prepared =
            prepareEmailsForAnalysis(batch);

        const rawBatchResult =
            await analyzeEmailBatch(
                prepared,
                result.categories,
            );

        let batchResult =
            normalizeEmailAnalysis(
                filterAnalysisByInput(
                    prepared,
                    rawBatchResult,
                ),
            );

        let validation =
            validateEmailAnalysis(
                prepared,
                batchResult,
            );

        if (!validation.isValid) {
            const missingEmails = prepared.filter(
                (email) =>
                    validation.missingIds.includes(email.id),
            );

            if (missingEmails.length === 0) {
                throw new Error(
                    `Batch ${index + 1} failed validation`,
                );
            }

            console.log(
                `🔧 Исправляем пропущенные письма: ${missingEmails.length}`,
            );

            const repairRawResult =
                await analyzeMissingEmails(
                    missingEmails,
                    result.categories,
                );

            const repairResult =
                normalizeEmailAnalysis(
                    filterAnalysisByInput(
                        missingEmails,
                        repairRawResult,
                    ),
                );

            const repairValidation =
                validateEmailAnalysis(
                    missingEmails,
                    repairResult,
                );

            if (!repairValidation.isValid) {
                throw new Error(
                    [
                        `Batch ${index + 1} repair failed validation`,
                        `Input: ${repairValidation.totalInput}`,
                        `Assigned: ${repairValidation.totalAssigned}`,
                        `Missing: ${repairValidation.missingIds.length}`,
                        `Duplicates: ${repairValidation.duplicateIds.length}`,
                        `Unknown: ${repairValidation.unknownIds.length}`,
                    ].join('\n'),
                );
            }

            batchResult = mergeBatchAnalysis(
                batchResult,
                repairResult,
            );

            validation = validateEmailAnalysis(
                prepared,
                batchResult,
            );
        }

        if (!validation.isValid) {
            throw new Error(
                [
                    `Batch ${index + 1} failed final validation`,
                    `Input: ${validation.totalInput}`,
                    `Assigned: ${validation.totalAssigned}`,
                    `Missing: ${validation.missingIds.length}`,
                    `Duplicates: ${validation.duplicateIds.length}`,
                    `Unknown: ${validation.unknownIds.length}`,
                ].join('\n'),
            );
        }

        result = mergeBatchAnalysis(
            result,
            batchResult,
        );
    }

    return result;
}