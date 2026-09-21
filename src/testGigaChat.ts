import 'dotenv/config';

import { createGigaChatClient } from './llm/gigaChatClient.js';

async function main() {
  const client = createGigaChatClient();

  console.log('🧠 Sending test request to GigaChat...');

  const response = await client.chat({
    messages: [
      {
        role: 'user',
        content: 'Ответь только одним словом: работает',
      },
    ],
  });

  console.log(
    '🤖 GigaChat:',
    response.choices[0]?.message.content,
  );
}

main().catch((error) => {
  console.error('❌ GigaChat error:');
  console.error(error);
});