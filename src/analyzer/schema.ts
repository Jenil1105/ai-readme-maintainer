import { Type } from "@google/genai";

export const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        needsUpdate: {
            type: Type.BOOLEAN,
        },
        reason: {
            type: Type.STRING,
        },
        updatePrompt: {
            type: Type.STRING,
        },
    },
    required: ["needsUpdate", "reason", "updatePrompt"],
};