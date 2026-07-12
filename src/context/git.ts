import { execFileSync } from "node:child_process";
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
    const ref = resolveCompareRef(compareRef);
    const effectiveRef = ensureCompareRef(ref);
    logger.debug(`Using compare ref: ${effectiveRef || ref || "<none>"}`);
    const fileNames = getChangedFiles(effectiveRef || ref);
    if (fileNames.length === 0) {
        logger.info(`No changed files detected when comparing against '${effectiveRef || ref || "<none>"}'`);
    }

    const changedFiles: ChangedFile[] = fileNames.map((file) => {
        const diff = execFileSync("git", ["diff", effectiveRef || ref, "HEAD", "--", file], {
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

function resolveCompareRef(compareRef?: string): string {
    const explicitRef = compareRef?.trim();
    if (explicitRef) {
        return explicitRef;
    }

    return getDefaultCompareRef();
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
            execFileSync("git", ["fetch", "--no-tags", "--prune", "--depth=1", "origin"], { stdio: "ignore" });
            const mergeBase = execFileSync("git", ["merge-base", "HEAD", "origin/HEAD"], {
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
            const commits = execFileSync("git", ["rev-list", "--max-count=2", "HEAD"], {
                encoding: "utf-8",
            })
                .trim()
                .split(/\s+/)
                .filter(Boolean);

            if (commits.length > 1) {
                return "HEAD~1";
            }

            logger.debug("No previous commit available for diffing");
            return "";
        } catch (err) {
            logger.debug(`Previous commit lookup failed: ${err}`);
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

    const effectiveRef = ensureCompareRef(ref);
    if (!effectiveRef) {
        return [];
    }

    try {
        // Ensure the compare ref exists locally; if not, try to fetch it from origin
        try {
            execFileSync("git", ["rev-parse", "--verify", effectiveRef], { stdio: "pipe" });
        } catch (err) {
            logger.debug(`Compare ref '${effectiveRef}' not found locally: ${err}`);
            logger.info(`Attempting to fetch compare ref '${effectiveRef}' from origin`);
            try {
                // Try fetching the specific ref first (works if it's a branch or tag)
                execFileSync("git", ["fetch", "--no-tags", "--prune", "--depth=1", "origin", effectiveRef], {
                    stdio: "ignore",
                });
            } catch (err2) {
                logger.debug(`Fetching specific ref failed: ${err2}`);
                try {
                    // Fall back to fetching a bit more history from origin
                    execFileSync("git", ["fetch", "--no-tags", "--prune", "--depth=50", "origin"], {
                        stdio: "ignore",
                    });
                } catch (err3) {
                    logger.debug(`Fallback fetch failed: ${err3}`);
                }
            }
        }

        const output = execFileSync("git", ["diff", "--name-only", effectiveRef, "HEAD"], {
            encoding: "utf-8",
        });
        logger.debug(`git diff --name-only ${effectiveRef} HEAD output:\n${output}`);

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

function ensureCompareRef(ref: string): string {
    if (!ref) {
        return "";
    }

    try {
        const target = ref.trim();
        if (!target) {
            return "";
        }

        const currentCommit = execFileSync("git", ["rev-parse", "HEAD"], {
            encoding: "utf-8",
        }).trim();
        const resolvedRef = execFileSync("git", ["rev-parse", "--verify", target], {
            encoding: "utf-8",
        }).trim();

        if (resolvedRef === currentCommit) {
            logger.debug(`Compare ref '${target}' resolves to HEAD; using parent commit instead`);
            try {
                execFileSync("git", ["rev-parse", "--verify", "HEAD^"], { stdio: "pipe" });
                return "HEAD^";
            } catch {
                return "HEAD~1";
            }
        }

        return target;
    } catch (err) {
        logger.debug(`Compare ref '${ref}' could not be resolved: ${err}`);

        if (/[~^]/.test(ref)) {
            return "";
        }

        return ref;
    }
}

function getChangeType(
    file: string,
    ref: string
): "added" | "modified" | "deleted" {
    if (!ref) {
        return "added";
    }

    const effectiveRef = ensureCompareRef(ref);
    if (!effectiveRef) {
        return "added";
    }

    try {
        const status = execFileSync("git", ["diff", "--name-status", effectiveRef, "HEAD", "--", file], {
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
