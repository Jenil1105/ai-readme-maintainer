import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { RepositoryContext } from "./types.js";

const ignoredPaths = [
    "dist/",
    "node_modules/",
    ".git/",
];

export function buildContext(): RepositoryContext {

    const changedFiles = execSync(
        "git diff --name-only HEAD~1 HEAD",
        { encoding: "utf-8" }
    )
        .trim()
        .split("\n")
        .filter(Boolean)
        .filter(file =>
            !ignoredPaths.some(path => file.startsWith(path))
        );

    const gitDiff = changedFiles
        .map(file =>
            execSync(`git diff HEAD~1 HEAD -- "${file}"`, {
                encoding: "utf-8",
            })
        )
        .join("\n");

    let readme = "";

    if (existsSync("README.md")) {
        readme = readFileSync("README.md", "utf-8");
    }

    return {
        changedFiles,
        gitDiff,
        readme,
    };
}