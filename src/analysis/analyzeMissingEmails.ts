import type { EmailForAnalysis } from '../types/emailForAnalysis.js';
import type {
  EmailAnalysisResult,
  EmailCategory,
} from '../types/emailAnalysis.js';

import { createGigaChatClient } from '../llm/gigaChatClient.js';
import { parseLlmJson } from '../llm/utils/parseLlmJson.js';

export async function analyzeMissingEmails(
  emails: EmailForAnalysis[],
  existingCategories: EmailCategory[],
): Promise<EmailAnalysisResult> {
  const client = createGigaChatClient();

  const categories = existingCategories.map((category) => ({
    name: category.name,
    description: category.description,
  }));

  const prompt = `
Ты выполняешь второй этап классификации электронной почты.

На первом этапе часть писем уже была распределена по категориям.
Тебе передаются только письма, которые остались без категории.

Используй существующие категории:

${JSON.stringify(categories)}

Правила:

1. Распредели КАЖДОЕ переданное письмо.
2. Используй существующие категории, если письмо им подходит.
3. Не создавай новые категории.
4. Если письмо не подходит ни к одной категории,
   используй категорию "Прочее".
5. Каждое письмо должно встретиться ровно один раз.
6. Не придумывай emailId.
7. Верни только JSON без Markdown.

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

  return parseLlmJson<EmailAnalysisResult>(content);
}