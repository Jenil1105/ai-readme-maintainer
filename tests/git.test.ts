import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { execSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";
import { getGitInfo } from "../src/context/git.js";

describe("getGitInfo", () => {
    let tempDir: string;
    let previousCwd: string;

    beforeEach(() => {
        previousCwd = process.cwd();
        tempDir = mkdtempSync(join(tmpdir(), "ai-readme-maintainer-"));
        process.chdir(tempDir);

        execSync("git init", { stdio: "pipe" });
        execSync('git config user.name "Test User"', { stdio: "pipe" });
        execSync('git config user.email "test@example.com"', { stdio: "pipe" });

        writeFileSync(join(tempDir, "README.md"), "# test\n", "utf-8");
        execSync("git add README.md", { stdio: "pipe" });
        execSync('git commit -m "initial commit"', { stdio: "pipe" });
    });

    afterEach(() => {
        process.chdir(previousCwd);
        rmSync(tempDir, { recursive: true, force: true });
    });

    it("returns an empty change summary when no previous revision is available", () => {
        const gitInfo = getGitInfo();

        expect(gitInfo.changedFiles).toEqual([]);
        expect(gitInfo.summary).toEqual({
            totalFiles: 0,
            totalAdditions: 0,
            totalDeletions: 0,
            filesByType: {},
        });
    });

    it("uses the parent commit when the compare ref resolves to HEAD", () => {
        writeFileSync(join(tempDir, "README.md"), "# test\n\nUpdated\n", "utf-8");
        execSync("git add README.md", { stdio: "pipe" });
        execSync('git commit -m "update README"', { stdio: "pipe" });

        const gitInfo = getGitInfo("HEAD");

        expect(gitInfo.changedFiles.map((file) => file.path)).toEqual(["README.md"]);
        expect(gitInfo.summary.totalFiles).toBe(1);
    });

    it("returns an empty summary when the previous revision is unavailable", () => {
        const gitInfo = getGitInfo("HEAD~1");

        expect(gitInfo.changedFiles).toEqual([]);
        expect(gitInfo.summary).toEqual({
            totalFiles: 0,
            totalAdditions: 0,
            totalDeletions: 0,
            filesByType: {},
        });
    });
});
