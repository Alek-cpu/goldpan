import type { EmailForAnalysis } from '../types/emailForAnalysis.js';
import type {
    EmailAnalysisResult,
    EmailCategory,
} from '../types/emailAnalysis.js';

import { createGigaChatClient } from '../llm/gigaChatClient.js';
import { parseLlmJson } from '../llm/utils/parseLlmJson.js';

export async function analyzeEmailBatch(
    emails: EmailForAnalysis[],
    existingCategories: EmailCategory[],
): Promise<EmailAnalysisResult> {
    const client = createGigaChatClient();

    const categories = existingCategories.map(
        (category) => ({
            name: category.name,
            description: category.description,
        }),
    );

    const prompt = `
Ты анализируешь очередную группу email-писем.

У Goldpan уже существуют категории:

${JSON.stringify(categories, null, 2)}

Новые письма:

${JSON.stringify(emails, null, 2)}

Распредели КАЖДОЕ письмо по категориям.

Правила:

1. Сначала пытайся использовать существующие категории.
2. Не создавай новую категорию, если письмо разумно подходит существующей.
3. Новую категорию создавай только если существующие категории действительно не подходят.
4. Каждое письмо должно присутствовать ровно в одной категории.
5. Используй только ID из входных данных.
6. Не придумывай ID.
7. Если письмо невозможно уверенно классифицировать, используй категорию "Прочее".
8. Не возвращай существующие категории, в которые не попало ни одного письма этого батча.
9. Верни только JSON без Markdown.

Формат:

{
  "categories": [
    {
      "name": "Название категории",
      "description": "Краткое описание",
      "emailIds": ["1", "2"]
    }
  ]
}
`.trim();

    const response = await client.chat({
        messages: [
            {
                role: 'user',
                content: prompt,
            },
        ],
    });

    const content =
        response.choices[0]?.message.content;

    if (!content) {
        throw new Error(
            'GigaChat returned an empty response',
        );
    }

    return parseLlmJson<EmailAnalysisResult>(
        content,
    );
}