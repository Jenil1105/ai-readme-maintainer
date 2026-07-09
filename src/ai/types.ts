export interface AIResponse {
    text: string;
}

export interface AIModel {
    generateContent(options: GenerateContentOptions): Promise<AIResponse>;
}

export interface GenerateContentOptions {
    prompt: string;
    responseSchema?: any;
    responseMimeType?: string;
}

export interface GeminiConfig {
    apiKey: string;
    model: string;
}
