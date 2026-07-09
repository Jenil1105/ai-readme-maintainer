import { execSync } from "node:child_process";
import { ChangedFile } from "./types.js";

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
    const fileNames = getChangedFiles(ref);

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
        execSync("git rev-parse --verify HEAD~1", { stdio: "pipe" });
        return "HEAD~1";
    } catch {
        return "";
    }
}

function getChangedFiles(ref: string): string[] {
    if (!ref) {
        return [];
    }

    try {
        return execSync(`git diff --name-only ${ref} HEAD`, {
            encoding: "utf-8",
        })
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
