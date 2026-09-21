import type { EmailAnalysisResult } from '../types/emailAnalysis.js';
import type { CategoryRefinementResult } from '../types/categoryRefinement.js';

import { createGigaChatClient } from '../llm/gigaChatClient.js';
import { parseLlmJson } from '../llm/utils/parseLlmJson.js';

export async function refineCategories(
  result: EmailAnalysisResult,
): Promise<CategoryRefinementResult> {
  const client = createGigaChatClient();

  const categories = result.categories.map((category) => ({
    name: category.name,
    description: category.description,
    emailCount: category.emailIds.length,
  }));

  const prompt = `
Ты анализируешь структуру категорий электронной почты
в приложении Goldpan.

Первичная классификация уже выполнена.

Твоя задача — оценить получившиеся категории и предложить,
как сделать структуру понятнее и полезнее для пользователя.

Ты НЕ видишь сами письма, поэтому не делай выводов
о содержимом отдельных писем.

Для каждой категории предложи одно из действий:

"keep" — оставить категорию без изменений.

"merge" — объединить несколько явно близких по смыслу
категорий.

"rename" — переименовать категорию, если название
непонятное или слишком узкое.

Правила:

1. Не объединяй категории только потому, что в них мало писем.
2. Не объединяй категории с разным смыслом.
3. Не придумывай категории, которых нет во входных данных.
4. Для merge укажи все объединяемые категории.
5. Для merge предложи новое название.
6. Для rename предложи новое название.
7. Для keep suggestedName должен быть null.
8. Каждая исходная категория должна быть учтена.
9. Категория "Прочее" должна оставаться отдельной.
10. Верни только JSON без Markdown.

Формат:

{
  "suggestions": [
    {
      "action": "keep",
      "categories": ["Название категории"],
      "suggestedName": null,
      "reason": "Причина"
    }
  ]
}

Категории:

${JSON.stringify(categories)}
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

  return parseLlmJson<CategoryRefinementResult>(content);
}