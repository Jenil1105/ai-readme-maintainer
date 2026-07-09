export interface AnalysisResult {
    needsUpdate: boolean;
    reason: string;
    updatePrompt: string;
    severity?: "low" | "medium" | "high";
    affectedSections?: string[];
}