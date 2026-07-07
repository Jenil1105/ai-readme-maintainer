"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analysisSchema = void 0;
const genai_1 = require("@google/genai");
exports.analysisSchema = {
    type: genai_1.Type.OBJECT,
    properties: {
        needsUpdate: {
            type: genai_1.Type.BOOLEAN,
        },
        reason: {
            type: genai_1.Type.STRING,
        },
        updatePrompt: {
            type: genai_1.Type.STRING,
        },
    },
    required: ["needsUpdate", "reason", "updatePrompt"],
};
