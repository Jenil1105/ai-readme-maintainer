import { GeminiClient } from "../ai/gemini.js";
import { loadPrompt } from "../ai/promptLoader.js";

export async function createUpdater(geminiClient: GeminiClient) {
    return {
        async updateReadme(
            readme: string,
            updatePrompt: string
        ): Promise<string> {
            const prompt = loadPrompt("update", {
                UPDATE_PROMPT: updatePrompt,
                README: readme,
            });

            const response = await geminiClient.generateContent({
                prompt,
            });

            return response.text;
        },
    };
}

export async function updateReadme(
    readme: string,
    updatePrompt: string,
    geminiClient: GeminiClient
): Promise<string> {
    const updater = await createUpdater(geminiClient);
    return updater.updateReadme(readme, updatePrompt);
}