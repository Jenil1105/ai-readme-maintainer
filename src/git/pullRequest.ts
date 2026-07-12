import { Octokit } from "@octokit/rest";
import { AnalysisResult } from "../analyzer/types.js";

function generatePRBody(
    analysis: AnalysisResult,
    summary?: {
        totalFiles: number;
        totalAdditions: number;
        totalDeletions: number;
    }
): string {
    const sections: string[] = [
        "## AI README Maintainer",
        "",
        "### Summary",
        `${analysis.reason}`,
        "",
        "### Why This Update",
        `${analysis.reason}`,
    ];

    if (analysis.affectedSections && analysis.affectedSections.length > 0) {
        sections.push("");
        sections.push("### Affected Sections");
        analysis.affectedSections.forEach((section) => {
            sections.push(`- ${section}`);
        });
    }

    if (summary) {
        sections.push("");
        sections.push("### Changes Statistics");
        sections.push(`- Files Changed: ${summary.totalFiles}`);
        sections.push(`- Additions: ${summary.totalAdditions}`);
        sections.push(`- Deletions: ${summary.totalDeletions}`);
    }

    sections.push("");
    sections.push("---");
    sections.push("");
    sections.push("Please review the generated documentation before merging.");
    sections.push("If any adjustments are needed, feel free to edit this PR.");

    return sections.join("\n");
}

export async function createPullRequest(
    owner: string,
    repo: string,
    head: string,
    base: string,
    githubToken: string,
    analysis: AnalysisResult,
    summary?: {
        totalFiles: number;
        totalAdditions: number;
        totalDeletions: number;
    }
) {
    const octokit = new Octokit({
        auth: githubToken,
    });

    const body = generatePRBody(analysis, summary);

    await octokit.pulls.create({
        owner,
        repo,
        head,
        base,
        title: "docs: update README",
        body,
    });
}