"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReadme = updateReadme;
const genai_1 = require("@google/genai");
const node_fs_1 = require("node:fs");
const core = __importStar(require("@actions/core"));
const geminiApiKey = core.getInput("gemini-api-key");
const ai = new genai_1.GoogleGenAI({
    apiKey: geminiApiKey,
});
async function updateReadme(readme, updatePrompt) {
    let prompt = (0, node_fs_1.readFileSync)("src/prompts/update.md", "utf-8");
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
