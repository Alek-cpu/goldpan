import GigaChat from 'gigachat';
import { Agent } from 'node:https';

export function createGigaChatClient() {
  const credentials = process.env.GIGACHAT_CREDENTIALS;

  if (!credentials) {
    throw new Error(
      'GIGACHAT_CREDENTIALS is missing in environment variables',
    );
  }

  const httpsAgent = new Agent({
    rejectUnauthorized: false,
  });

  return new GigaChat({
  credentials,
  scope: 'GIGACHAT_API_PERS',
  model: process.env.GIGACHAT_MODEL ?? 'GigaChat-2-Pro',
  httpsAgent,
  timeout: 120_000,
});
}