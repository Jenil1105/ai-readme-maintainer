import { execSync } from "node:child_process";

export function branchExists(name: string): boolean {
    try {
        execSync(`git rev-parse --verify ${name}`, { stdio: "pipe" });
        return true;
    } catch {
        return false;
    }
}

export function createBranch(name: string): void {
    if (branchExists(name)) {
        execSync(`git checkout ${name}`, { stdio: "inherit" });
    } else {
        execSync(`git checkout -b ${name}`, { stdio: "inherit" });
    }
}

export function commit(message: string): void {
    execSync('git config user.name "github-actions[bot]"', {
        stdio: "pipe",
    });
    execSync(
        'git config user.email "41898282+github-actions[bot]@users.noreply.github.com"',
        { stdio: "pipe" }
    );

    // Check if there are changes to commit
    try {
        execSync("git diff --quiet --exit-code", { stdio: "pipe" });
        execSync("git diff --cached --quiet --exit-code", {
            stdio: "pipe",
        });
        // No changes
        return;
    } catch {
        // Changes exist, proceed
    }

    execSync("git add README.md", { stdio: "inherit" });
    execSync(`git commit -m "${message}"`, { stdio: "inherit" });
}

export function push(branch: string): void {
    try {
        execSync(`git push -u origin ${branch}`, { stdio: "inherit" });
    } catch (error) {
        throw new Error(`Failed to push branch "${branch}": ${error}`);
    }
}

export function getCurrentBranch(): string {
    return execSync("git rev-parse --abbrev-ref HEAD", {
        encoding: "utf-8",
    }).trim();
}

export function getLastCommitSha(): string {
    return execSync("git rev-parse HEAD", {
        encoding: "utf-8",
    }).trim();
}