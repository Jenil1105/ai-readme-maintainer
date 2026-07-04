import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { RepositoryContext } from "./types.js";

export function buildContext(): RepositoryContext {
    const changedFiles = execSync(
        "git diff --name-only HEAD~1 HEAD",
        { encoding: "utf-8" }
    )
        .trim()
        .split("\n")
        .filter(Boolean);

    const gitDiff = execSync(
        "git diff HEAD~1 HEAD",
        { encoding: "utf-8" }
    );

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