import * as core from "@actions/core";

export interface ActionConfig {
    geminiApiKey: string;
    githubToken: string;
    model: string;
    branchPrefix: string;
    commitMessage: string;
    prTitle: string;
    baseBranch: string;
    dryRun: boolean;
}

export function loadConfig(): ActionConfig {
    return {
        geminiApiKey: core.getInput("gemini-api-key", { required: true }),
        githubToken: core.getInput("github-token", { required: true }),
        model: core.getInput("model") || "gemini-2.5-flash",
        branchPrefix: core.getInput("branch-prefix") || "readme-ai",
        commitMessage:
            core.getInput("commit-message") || "docs: update README",
        prTitle: core.getInput("pr-title") || "docs: update README",
        baseBranch: core.getInput("base-branch") || "main",
        dryRun: core.getInput("dry-run")?.toLowerCase() === "true" || false,
    };
}

export function validateConfig(config: ActionConfig): string[] {
    const errors: string[] = [];

    if (!config.geminiApiKey) {
        errors.push("gemini-api-key is required");
    }

    if (!config.githubToken) {
        errors.push("github-token is required");
    }

    if (!config.branchPrefix) {
        errors.push("branchPrefix must not be empty");
    }

    if (!config.commitMessage) {
        errors.push("commitMessage must not be empty");
    }

    return errors;
}
