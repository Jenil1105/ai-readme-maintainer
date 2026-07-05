import { GoogleGenAI } from "@google/genai";
import { readFileSync } from "node:fs";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
});

export async function updateReadme(
    readme: string,
    updatePrompt: string
): Promise<string> {
    let prompt = readFileSync("src/prompts/update.md", "utf-8");

    prompt = prompt
        .replace("{{UPDATE_PROMPT}}", updatePrompt)
        .replace("{{README}}", readme);

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });

    const updatedReadme = response.text?.trim();

    if (!updatedReadme) {
        throw new Error("Gemini returned an empty README.");
    }

    return updatedReadme;
}