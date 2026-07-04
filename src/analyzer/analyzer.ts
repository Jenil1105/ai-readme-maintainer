import { RepositoryContext } from "../context/types.js";
import { AnalysisResult } from "./types.js";

export async function analyze(
    context: RepositoryContext
): Promise<AnalysisResult> {
    console.log("Running analyzer...");

    // Mock implementation for now
    return {
        needsUpdate: true,
        reason: "Mock analysis completed.",
        updatePrompt: `
Update the README based on the latest code changes.
Document all newly added features.
Do not modify unrelated sections.
`,
    };
}