import type { EmailForAnalysis } from '../types/emailForAnalysis.js';
import type { EmailAnalysisResult } from '../types/emailAnalysis.js';

import { createGigaChatClient } from '../llm/gigaChatClient.js';
import { parseLlmJson } from '../llm/utils/parseLlmJson.js';

export async function analyzeEmails(
    emails: EmailForAnalysis[],
): Promise<EmailAnalysisResult> {
    const client = createGigaChatClient();

    const prompt = `
Ты анализатор электронной почты в приложении Goldpan.

Твоя задача — изучить набор писем пользователя и обнаружить
естественные смысловые категории.

Правила:

1. Не используй заранее заданный список категорий.
2. Создавай категории исходя только из предоставленных писем.
3. Объединяй письма с похожим назначением.
4. Не создавай отдельную категорию для каждого отправителя,
   если несколько отправителей имеют общий смысл.
5. Названия категорий должны быть короткими и понятными.
6. Не придумывай письма и ID, которых нет во входных данных.
7. Каждый emailId должен существовать во входных данных.
8. Не включай одно письмо сразу в несколько категорий.
9. Если письмо невозможно уверенно классифицировать,
   помести его в категорию "Прочее".
10. Верни ТОЛЬКО JSON. Без Markdown и пояснений.

Формат:

{
  "categories": [
    {
      "name": "Название категории",
      "description": "Краткое описание",
      "emailIds": ["id1", "id2"]
    }
  ]
}

Письма:

${JSON.stringify(emails)}
`;

    const MAX_ATTEMPTS = 2;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const response = await client.chat({
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
        });

        const content = response.choices[0]?.message.content;

        if (!content) {
            throw new Error('GigaChat returned an empty response');
        }

        try {
            return parseLlmJson<EmailAnalysisResult>(content);
        } catch (error) {
            console.warn(
                `⚠️ Invalid JSON from GigaChat. Attempt ${attempt}/${MAX_ATTEMPTS}`,
            );

            if (attempt === MAX_ATTEMPTS) {
                throw error;
            }
        }
    }

    throw new Error('Email analysis failed');
}