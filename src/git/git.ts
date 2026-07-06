import { execSync } from "node:child_process";

export function createBranch(name: string): void {
    execSync(`git checkout -b ${name}`, { stdio: "inherit" });
}

export function commit(message: string): void {
    execSync("git add README.md", { stdio: "inherit" });
    execSync(`git commit -m "${message}"`, { stdio: "inherit" });
}

export function push(branch: string): void {
    execSync(`git push -u origin ${branch}`, { stdio: "inherit" });
}