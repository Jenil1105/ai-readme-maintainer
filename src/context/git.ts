import { execSync } from "node:child_process";
import { ChangedFile } from "./types.js";
import { logger } from "../logger/logger.js";

const ignoredPaths = [
    "dist/",
    "node_modules/",
    ".git/",
    ".github/workflows/",
];

export interface GitInfo {
    changedFiles: ChangedFile[];
    summary: {
        totalFiles: number;
        totalAdditions: number;
        totalDeletions: number;
        filesByType: Record<string, number>;
    };
}

export function getGitInfo(compareRef?: string): GitInfo {
    const ref = compareRef || getDefaultCompareRef();
    logger.debug(`Using compare ref: ${ref}`);
    const fileNames = getChangedFiles(ref);
    if (fileNames.length === 0) {
        logger.info(`No changed files detected when comparing against '${ref || "<none>"}'`);
    }

    const changedFiles: ChangedFile[] = fileNames.map((file) => {
        const diff = execSync(`git diff ${ref} HEAD -- "${file}"`, {
            encoding: "utf-8",
        });

        const additions = (diff.match(/^\+/gm) || []).length - 1; // -1 to exclude the +++ line
        const deletions = (diff.match(/^\-/gm) || []).length - 1; // -1 to exclude the --- line

        const extension = file.split(".").pop() || "unknown";

        return {
            path: file,
            extension,
            diff,
            additions,
            deletions,
            changeType: getChangeType(file, ref),
        };
    });

    const filesByType: Record<string, number> = {};
    let totalAdditions = 0;
    let totalDeletions = 0;

    for (const file of changedFiles) {
        filesByType[file.extension] = (filesByType[file.extension] || 0) + 1;
        totalAdditions += file.additions;
        totalDeletions += file.deletions;
    }

    return {
        changedFiles,
        summary: {
            totalFiles: changedFiles.length,
            totalAdditions,
            totalDeletions,
            filesByType,
        },
    };
}

function getDefaultCompareRef(): string {
    try {
        // Prefer GitHub Actions provided base ref when available
        const githubBaseRef = process.env.GITHUB_BASE_REF;
        const githubEventBefore = process.env.GITHUB_EVENT_BEFORE;

        if (githubBaseRef) {
            logger.debug(`GITHUB_BASE_REF detected: ${githubBaseRef}`);
            return `origin/${githubBaseRef}`;
        }

        if (githubEventBefore) {
            logger.debug(`GITHUB_EVENT_BEFORE detected: ${githubEventBefore}`);
            return githubEventBefore;
        }

        // Try to use a merge-base with origin/HEAD (works when origin fetched)
        try {
            logger.debug("Attempting shallow fetch and merge-base with origin/HEAD");
            execSync("git fetch --no-tags --prune --depth=1 origin", { stdio: "ignore" });
            const mergeBase = execSync("git merge-base HEAD origin/HEAD", {
                encoding: "utf-8",
            }).trim();

            logger.debug(`merge-base result: ${mergeBase}`);

            if (mergeBase) return mergeBase;
        } catch (err) {
            logger.debug(`merge-base attempt failed: ${err}`);
            // ignore and fall back
        }

        // Last resort: compare to previous commit if available
        try {
            execSync("git rev-parse --verify HEAD~1", { stdio: "pipe" });
            return "HEAD~1";
        } catch (err) {
            logger.debug(`HEAD~1 not available: ${err}`);
            return "";
        }
    } catch {
        return "";
    }
}

function getChangedFiles(ref: string): string[] {
    if (!ref) {
        return [];
    }

    try {
        // Ensure the compare ref exists locally; if not, try to fetch it from origin
        try {
            execSync(`git rev-parse --verify ${ref}`, { stdio: "pipe" });
        } catch (err) {
            logger.debug(`Compare ref '${ref}' not found locally: ${err}`);
            logger.info(`Attempting to fetch compare ref '${ref}' from origin`);
            try {
                // Try fetching the specific ref first (works if it's a branch or tag)
                execSync(`git fetch --no-tags --prune --depth=1 origin ${ref}`, {
                    stdio: "ignore",
                });
            } catch (err2) {
                logger.debug(`Fetching specific ref failed: ${err2}`);
                try {
                    // Fall back to fetching a bit more history from origin
                    execSync(`git fetch --no-tags --prune --depth=50 origin`, {
                        stdio: "ignore",
                    });
                } catch (err3) {
                    logger.debug(`Fallback fetch failed: ${err3}`);
                }
            }
        }

        const output = execSync(`git diff --name-only ${ref} HEAD`, {
            encoding: "utf-8",
        });
        logger.debug(`git diff --name-only ${ref} HEAD output:\n${output}`);

        return output
            .trim()
            .split("\n")
            .filter(Boolean)
            .filter(
                (file) =>
                    !ignoredPaths.some((path) => file.startsWith(path)) &&
                    !isGeneratedFile(file)
            );
    } catch {
        return [];
    }
}

function getChangeType(
    file: string,
    ref: string
): "added" | "modified" | "deleted" {
    if (!ref) {
        return "added";
    }

    try {
        const status = execSync(`git diff --name-status ${ref} HEAD -- "${file}"`, {
            encoding: "utf-8",
        }).trim();

        if (status.startsWith("A")) return "added";
        if (status.startsWith("D")) return "deleted";
        return "modified";
    } catch {
        return "modified";
    }
}

function isGeneratedFile(filePath: string): boolean {
    const generatedPatterns = [
        /\.min\.js$/,
        /\.bundle\.js$/,
        /\/dist\//,
        /\/build\//,
    ];

    return generatedPatterns.some((pattern) => pattern.test(filePath));
}
