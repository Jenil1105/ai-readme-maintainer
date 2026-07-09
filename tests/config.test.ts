import { describe, it, expect, beforeEach, vi } from "vitest";
import { validateConfig } from "../src/config/config";

describe("Config", () => {
    describe("validateConfig", () => {
        it("should report missing gemini-api-key", () => {
            const errors = validateConfig({
                geminiApiKey: "",
                githubToken: "token",
                model: "gemini-2.5-flash",
                branchPrefix: "readme-ai",
                commitMessage: "docs: update README",
                prTitle: "docs: update README",
                baseBranch: "main",
                dryRun: false,
            });

            expect(errors).toContain("gemini-api-key is required");
        });

        it("should report missing github-token", () => {
            const errors = validateConfig({
                geminiApiKey: "key",
                githubToken: "",
                model: "gemini-2.5-flash",
                branchPrefix: "readme-ai",
                commitMessage: "docs: update README",
                prTitle: "docs: update README",
                baseBranch: "main",
                dryRun: false,
            });

            expect(errors).toContain("github-token is required");
        });

        it("should validate correct config", () => {
            const errors = validateConfig({
                geminiApiKey: "key",
                githubToken: "token",
                model: "gemini-2.5-flash",
                branchPrefix: "readme-ai",
                commitMessage: "docs: update README",
                prTitle: "docs: update README",
                baseBranch: "main",
                dryRun: false,
            });

            expect(errors).toHaveLength(0);
        });

        it("should reject empty branch prefix", () => {
            const errors = validateConfig({
                geminiApiKey: "key",
                githubToken: "token",
                model: "gemini-2.5-flash",
                branchPrefix: "",
                commitMessage: "docs: update README",
                prTitle: "docs: update README",
                baseBranch: "main",
                dryRun: false,
            });

            expect(errors).toContain("branchPrefix must not be empty");
        });

        it("should reject empty commit message", () => {
            const errors = validateConfig({
                geminiApiKey: "key",
                githubToken: "token",
                model: "gemini-2.5-flash",
                branchPrefix: "readme-ai",
                commitMessage: "",
                prTitle: "docs: update README",
                baseBranch: "main",
                dryRun: false,
            });

            expect(errors).toContain("commitMessage must not be empty");
        });
    });
});
