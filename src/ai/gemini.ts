import { GoogleGenAI } from "@google/genai";
import { AIResponse, GenerateContentOptions, GeminiConfig } from "./types.js";

export class GeminiClient {
    private ai: GoogleGenAI;
    private model: string;

    constructor(config: GeminiConfig) {
        this.ai = new GoogleGenAI({ apiKey: config.apiKey });
        this.model = config.model;
    }

    async generateContent(
        options: GenerateContentOptions
    ): Promise<AIResponse> {
        const response = await this.ai.models.generateContent({
            model: this.model,
            contents: options.prompt,
            config:
                options.responseSchema || options.responseMimeType
                    ? {
                          responseSchema: options.responseSchema,
                          responseMimeType:
                              options.responseMimeType ||
                              "application/json",
                      }
                    : undefined,
        });

        const text = response.text?.trim();

        if (!text) {
            throw new Error("Gemini returned an empty response.");
        }

        return { text };
    }
}

export function createGeminiClient(apiKey: string): GeminiClient {
    return new GeminiClient({
        apiKey,
        model: "gemini-2.5-flash",
    });
}
