import { execFileSync } from "node:child_process";
import { ChangedFile } from "./types.js";
import { isDebugLoggingEnabled, logger } from "../logger/logger.js";

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
        const diff = runGitCommand("git", ["diff", effectiveRef || ref, "HEAD", "--", file], {
            encoding: "utf-8",
        });

        if (isDebugLoggingEnabled()) {
            logger.info("Generating diff for:");
            logger.info(file);
            logger.info(`Diff length: ${diff.length} characters`);
            const preview = diff.length > 200 ? `${diff.slice(0, 200)}...` : diff;
            logger.info(`First 200 characters: ${preview}`);
        }

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
            runGitCommand("git", ["fetch", "--no-tags", "--prune", "--depth=1", "origin"], { stdio: "ignore" });
            const mergeBase = runGitCommand("git", ["merge-base", "HEAD", "origin/HEAD"], {
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
            runGitCommand("git", ["rev-parse", "--verify", "HEAD~1"], { stdio: "pipe" });
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

    const effectiveRef = ensureCompareRef(ref);
    if (!effectiveRef) {
        return [];
    }

    try {
        // Ensure the compare ref exists locally; if not, try to fetch it from origin
        try {
            runGitCommand("git", ["rev-parse", "--verify", effectiveRef], { stdio: "pipe" });
        } catch (err) {
            logger.debug(`Compare ref '${effectiveRef}' not found locally: ${err}`);
            logger.info(`Attempting to fetch compare ref '${effectiveRef}' from origin`);
            try {
                // Try fetching the specific ref first (works if it's a branch or tag)
                runGitCommand("git", ["fetch", "--no-tags", "--prune", "--depth=1", "origin", effectiveRef], {
                    stdio: "ignore",
                });
            } catch (err2) {
                logger.debug(`Fetching specific ref failed: ${err2}`);
                try {
                    // Fall back to fetching a bit more history from origin
                    runGitCommand("git", ["fetch", "--no-tags", "--prune", "--depth=50", "origin"], {
                        stdio: "ignore",
                    });
                } catch (err3) {
                    logger.debug(`Fallback fetch failed: ${err3}`);
                }
            }
        }

        const output = runGitCommand("git", ["diff", "--name-only", effectiveRef, "HEAD"], {
            encoding: "utf-8",
        });
        logger.debug(`git diff --name-only ${effectiveRef} HEAD output:\n${output}`);

        const rawFiles = output
            .trim()
            .split("\n")
            .filter(Boolean);

        if (isDebugLoggingEnabled()) {
            logger.info("Raw changed files:");
            rawFiles.forEach((file) => logger.info(`- ${file}`));
        }

        const filteredFiles = rawFiles.filter(
            (file) =>
                !ignoredPaths.some((path) => file.startsWith(path)) &&
                !isGeneratedFile(file)
        );

        if (isDebugLoggingEnabled()) {
            logger.info("Filtered changed files:");
            filteredFiles.forEach((file) => logger.info(`- ${file}`));

            const ignoredFiles = rawFiles.filter((file) =>
                ignoredPaths.some((path) => file.startsWith(path)) || isGeneratedFile(file)
            );

            logger.info("Ignored:");
            ignoredFiles.forEach((file) => logger.info(`- ${file}`));
        }

        return filteredFiles;
    } catch {
        return [];
    }
}

function runGitCommand(command: string, args: string[], options?: { encoding?: BufferEncoding; stdio?: "pipe" | "ignore" | "inherit" }): string {
    if (isDebugLoggingEnabled()) {
        logger.info(`[Context] Running: ${command} ${args.join(" ")}`);
    }

    try {
        const result = execFileSync(command, args, options as any);
        if (isDebugLoggingEnabled()) {
            logger.info(`[Context] Exit code: 0`);
        }
        return typeof result === "string" ? result : String(result);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (isDebugLoggingEnabled()) {
            logger.info(`[Context] Exit code: 1`);
            logger.info(`[Context] stderr: ${message}`);
        }
        throw error;
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

        const currentCommit = runGitCommand("git", ["rev-parse", "HEAD"], {
            encoding: "utf-8",
        }).trim();
        const resolvedRef = runGitCommand("git", ["rev-parse", target], {
            encoding: "utf-8",
        }).trim();

        if (resolvedRef === currentCommit) {
            logger.debug(`Compare ref '${target}' resolves to HEAD; using parent commit instead`);
            try {
                runGitCommand("git", ["rev-parse", "--verify", "HEAD^"], { stdio: "pipe" });
                return "HEAD^";
            } catch {
                return "HEAD~1";
            }
        }

        return target;
    } catch {
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
        const status = runGitCommand("git", ["diff", "--name-status", effectiveRef, "HEAD", "--", file], {
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
