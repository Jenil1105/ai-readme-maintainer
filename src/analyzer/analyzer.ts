import { analysisSchema } from "./schema.js";
import { RepositoryContext } from "../context/types.js";
import { AnalysisResult } from "./types.js";
import { GeminiClient } from "../ai/gemini.js";
import { loadPrompt } from "../ai/promptLoader.js";

function formatChangedFiles(
    changedFiles: RepositoryContext["changedFiles"]
): string {
    return changedFiles
        .map(
            (file) => `
## File: ${file.path}
- Type: ${file.changeType}
- Extension: ${file.extension}
- Additions: ${file.additions}, Deletions: ${file.deletions}

\`\`\`diff
${file.diff.slice(0, 1000)}${file.diff.length > 1000 ? "...(truncated)" : ""}
\`\`\`
`
        )
        .join("\n");
}

export async function createAnalyzer(geminiClient: GeminiClient) {
    return {
        async analyze(context: RepositoryContext): Promise<AnalysisResult> {
            const changedFilesFormatted = formatChangedFiles(
                context.changedFiles
            );
            const summaryText = `
Total Files Changed: ${context.summary.totalFiles}
Total Additions: ${context.summary.totalAdditions}
Total Deletions: ${context.summary.totalDeletions}
Files by Type: ${JSON.stringify(context.summary.filesByType)}
`;

            const prompt = loadPrompt("analyze", {
                README: context.readme,
                CHANGED_FILES: changedFilesFormatted,
                SUMMARY: summaryText,
            });

            const response = await geminiClient.generateContent({
                prompt,
                responseSchema: analysisSchema,
                responseMimeType: "application/json",
            });

            return JSON.parse(response.text) as AnalysisResult;
        },
    };
}

export async function analyze(
    context: RepositoryContext,
    geminiClient: GeminiClient
): Promise<AnalysisResult> {
    const analyzer = await createAnalyzer(geminiClient);
    return analyzer.analyze(context);
}