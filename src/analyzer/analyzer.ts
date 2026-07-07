import { GoogleGenAI, Type } from "@google/genai";
import { readFileSync } from "node:fs";
import {analysisSchema} from "./schema";

import { RepositoryContext } from "../context/types.js";
import { AnalysisResult } from "./types.js";
import * as core from "@actions/core";

const geminiApiKey = core.getInput("gemini-api-key");

const ai = new GoogleGenAI({
    apiKey: geminiApiKey!,
});

export async function analyze(
    context: RepositoryContext
): Promise<AnalysisResult> {

    let prompt = readFileSync("src/prompts/analyze.md", "utf-8");

    prompt = prompt
        .replace("{{README}}", context.readme)
        .replace("{{CHANGED_FILES}}", context.changedFiles.join("\n"))
        .replace("{{GIT_DIFF}}", context.gitDiff);

    const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
    },
    });

    const text = response.text?.trim();
    console.log(text)

    if (!text) {
        throw new Error("Gemini returned an empty response.");
    }

    return JSON.parse(text) as AnalysisResult;
}