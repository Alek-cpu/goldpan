export function parseLlmJson<T>(content: string): T {
  const cleanedContent = content
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/, '')
    .replace(/\s*```$/, '')
    .trim();

  try {
    return JSON.parse(cleanedContent) as T;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unknown JSON parsing error';

    throw new Error(
      `LLM returned invalid JSON: ${message}`,
    );
  }
}