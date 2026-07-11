import { readFileSync } from "node:fs";
import { join } from "node:path";

const promptCache = new Map<string, string>();

export function loadPrompt(
  promptName: string,
  replacements?: Record<string, string>
): string {
  const cacheKey = promptName + JSON.stringify(replacements ?? {});

  if (promptCache.has(cacheKey)) {
    return promptCache.get(cacheKey)!;
  }

  const promptPath = join(__dirname, "prompts", `${promptName}.md`);

  let prompt = readFileSync(promptPath, "utf8");

  if (replacements) {
    for (const [key, value] of Object.entries(replacements)) {
      prompt = prompt.replace(`{{${key}}}`, value);
    }
  }

  promptCache.set(cacheKey, prompt);
  return prompt;
}

export function clearPromptCache(): void {
  promptCache.clear();
}