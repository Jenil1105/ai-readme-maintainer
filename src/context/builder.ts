import { RepositoryContext } from "./types.js";
import { getGitInfo } from "./git.js";
import { loadReadme } from "./readme.js";
import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { isDebugLoggingEnabled, logContextDebugInfo } from "../logger/logger.js";

export function buildContext(readmeFilePath?: string, compareRef?: string): RepositoryContext {
    const gitInfo = getGitInfo(compareRef);
    const readme = loadReadme(readmeFilePath);

    if (isDebugLoggingEnabled()) {
        const readmePath = readmeFilePath ?? "README.md";
        const repoInfo: Record<string, string | undefined> = {
            repositoryRoot: process.cwd(),
            repositoryName: process.env.GITHUB_REPOSITORY?.split("/").pop() ?? "<unknown>",
            branch: process.env.GITHUB_REF_NAME ?? "<unknown>",
            headSha: process.env.GITHUB_SHA ?? undefined,
            previousSha: undefined,
        };

        try {
            repoInfo.previousSha = execFileSync("git", ["rev-parse", "HEAD~1"], {
                encoding: "utf-8",
                stdio: ["ignore", "pipe", "pipe"],
            }).trim();
        } catch {
            repoInfo.previousSha = "<not available>";
        }

        let readmeSize = 0;
        if (existsSync(readmePath)) {
            readmeSize = statSync(readmePath).size;
        }

        logContextDebugInfo({
            readmePath,
            readme,
            changedFiles: gitInfo.changedFiles,
            summary: gitInfo.summary,
            repoInfo: {
                ...repoInfo,
                readmeSize: String(readmeSize),
            },
        });
    }

    return {
        readme,
        changedFiles: gitInfo.changedFiles,
        summary: gitInfo.summary,
    };
}