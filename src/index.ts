import { writeFileSync } from "node:fs";
import * as core from "@actions/core";

import { analyze } from "./analyzer/analyzer.js";
import { buildContext } from "./context/builder.js";
import { updateReadme } from "./updater/updater.js";
import { createBranch, commit, push } from "./git/git.js";
import { createPullRequest } from "./git/pullRequest.js";
import { createGeminiClient } from "./ai/gemini.js";
import { validateUpdate } from "./validator/validator.js";
import { loadConfig, validateConfig } from "./config/config.js";
import { logger } from "./logger/logger.js";
import { handleError } from "./errors/errors.js";

async function main() {
    logger.startGroup("AI README Maintainer");

    try {
        // Load and validate configuration
        logger.info("Loading configuration...");
        const config = loadConfig();

        const configErrors = validateConfig(config);
        if (configErrors.length > 0) {
            throw new Error(`Configuration errors: ${configErrors.join(", ")}`);
        }

        // Initialize clients
        logger.info("Initializing Gemini client...");
        const geminiClient = createGeminiClient(config.geminiApiKey);

        // Build context
        logger.logStep("Building repository context", "pending");
        const context = buildContext();

        if (context.changedFiles.length === 0) {
            logger.info("No files changed. Skipping analysis.");
            logger.endGroup();
            return;
        }

        logger.logStep(
            `Found ${context.changedFiles.length} changed files`,
            "success"
        );

        // Analyze changes
        logger.logStep("Analyzing repository changes", "pending");
        const analysis = await analyze(context, geminiClient);

        logger.info(`Analysis complete. Needs update: ${analysis.needsUpdate}`);

        if (!analysis.needsUpdate) {
            logger.logStep("README is already up to date", "success");
            logger.endGroup();
            return;
        }

        logger.logStep(`Update required: ${analysis.reason}`, "success");

        if (config.dryRun) {
            logger.info("DRY RUN MODE - Skipping actual changes");
            logger.info("Changes would be made:");
            logger.info(`- Reason: ${analysis.reason}`);
            logger.endGroup();
            return;
        }

        // Update README
        logger.logStep("Generating updated README", "pending");
        const updatedReadme = await updateReadme(
            context.readme,
            analysis.updatePrompt,
            geminiClient
        );

        // Validate update
        logger.info("Validating updated README...");
        const validation = validateUpdate(context.readme, updatedReadme);

        if (!validation.valid) {
            const errors = validation.errors.join(", ");
            throw new Error(`README validation failed: ${errors}`);
        }

        if (validation.warnings.length > 0) {
            validation.warnings.forEach((warning) => {
                logger.warning(`${warning}`);
            });
        }

        logger.logStep("README validation passed", "success");

        // Create branch and commit
        const sha = process.env.GITHUB_SHA?.slice(0, 7) ?? "local";
        const timestamp = new Date().getTime();
        const branch = `${config.branchPrefix}/${sha}-${timestamp}`;

        logger.logStep(`Creating branch: ${branch}`, "pending");
        createBranch(branch);

        logger.info("Writing updated README...");
        writeFileSync("README.md", updatedReadme);

        logger.logStep("Committing changes", "pending");
        commit(config.commitMessage);

        logger.logStep("Pushing branch", "pending");
        push(branch);
        logger.logStep("Branch pushed successfully", "success");

        // Create pull request
        const repository = process.env.GITHUB_REPOSITORY!;
        const [owner, repo] = repository.split("/");
        const baseBranch = process.env.GITHUB_REF_NAME ?? config.baseBranch;

        logger.logStep(
            `Creating pull request to ${baseBranch}`,
            "pending"
        );
        await createPullRequest(
            owner,
            repo,
            branch,
            baseBranch,
            config.githubToken,
            analysis,
            context.summary
        );

        logger.logStep("Pull request created successfully", "success");
        logger.endGroup();
    } catch (error) {
        const message = handleError(error);
        core.setFailed(message);
        logger.endGroup();
        process.exit(1);
    }
}

main();