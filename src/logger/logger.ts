import * as core from "@actions/core";
import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";

export enum LogLevel {
    DEBUG = "debug",
    INFO = "info",
    WARNING = "warning",
    ERROR = "error",
}

export class Logger {
    private prefix: string;

    constructor(prefix?: string) {
        this.prefix = prefix ? `[${prefix}]` : "";
    }

    debug(message: string): void {
        if (this.prefix) {
            core.debug(`${this.prefix} ${message}`);
        } else {
            core.debug(message);
        }
    }

    info(message: string): void {
        if (this.prefix) {
            core.info(`${this.prefix} ${message}`);
        } else {
            core.info(message);
        }
    }

    warning(message: string): void {
        if (this.prefix) {
            core.warning(`${this.prefix} ${message}`);
        } else {
            core.warning(message);
        }
    }

    error(message: string): void {
        if (this.prefix) {
            core.error(`${this.prefix} ${message}`);
        } else {
            core.error(message);
        }
    }

    startGroup(name: string): void {
        core.startGroup(this.prefix ? `${this.prefix} ${name}` : name);
    }

    endGroup(): void {
        core.endGroup();
    }

    logStep(step: string, status: "pending" | "success" | "failed"): void {
        const icon =
            status === "success"
                ? "✓"
                : status === "failed"
                  ? "✗"
                  : "⟳";
        this.info(`${icon} ${step}`);
    }
}

export const logger = new Logger("AI README Maintainer");

export function isDebugLoggingEnabled(): boolean {
    const debugFlag = process.env.DEBUG?.toLowerCase();
    const inputDebugFlag = process.env.INPUT_DEBUG?.toLowerCase();

    return debugFlag === "true" || debugFlag === "1" || inputDebugFlag === "true" || inputDebugFlag === "1";
}

export function logContextDebugInfo(context: {
    readmePath?: string;
    readme?: string;
    changedFiles?: Array<{ path: string; diff?: string }>;
    summary?: { totalFiles?: number; totalAdditions?: number; totalDeletions?: number };
    repoInfo?: Record<string, string | undefined>;
}): void {
    if (!isDebugLoggingEnabled()) {
        return;
    }

    logger.startGroup("Context diagnostics");

    try {
        const repoInfo = context.repoInfo ?? {};

        logger.info(`Repository root: ${repoInfo.repositoryRoot ?? process.cwd()}`);
        logger.info(`Current directory: ${process.cwd()}`);
        logger.info(`Repository name: ${repoInfo.repositoryName ?? "<unknown>"}`);
        logger.info(`Branch: ${repoInfo.branch ?? "<unknown>"}`);
        logger.info(`HEAD: ${repoInfo.headSha ?? "<unknown>"}`);
        logger.info(`Previous: ${repoInfo.previousSha ?? "<not available>"}`);

        for (const key of [
            "GITHUB_SHA",
            "GITHUB_REF",
            "GITHUB_REF_NAME",
            "GITHUB_EVENT_NAME",
            "GITHUB_WORKFLOW",
            "GITHUB_REPOSITORY",
            "GITHUB_ACTOR",
        ]) {
            const value = process.env[key];
            logger.info(`${key}: ${value ?? "<not set>"}`);
        }

        try {
            const logOutput = execFileSync("git", ["log", "--oneline", "-5"], {
                encoding: "utf-8",
                stdio: ["ignore", "pipe", "pipe"],
            });
            logger.info("Recent commits:");
            logger.info(logOutput.trim() || "<no commits>");
        } catch (error) {
            logger.info("Failed to execute: git log --oneline -5");
            logger.info(`stderr: ${error instanceof Error ? error.message : String(error)}`);
        }

        if (context.readmePath) {
            const exists = existsSync(context.readmePath);
            logger.info(`README exists: ${exists}`);
            logger.info(`README path: ${context.readmePath}`);
            if (exists) {
                const fileStats = statSync(context.readmePath);
                logger.info(`README size: ${fileStats.size} bytes`);
            }
        }

        if (context.readme !== undefined) {
            logger.info(`README content length: ${context.readme.length}`);
        }

        if (context.changedFiles) {
            logger.info("Raw changed files:");
            context.changedFiles.forEach((file) => logger.info(`- ${file.path}`));
        }

        if (context.summary) {
            const gitDiffSize = (context.changedFiles ?? []).reduce(
                (total, file) => total + (file.diff?.length ?? 0),
                0
            );

            logger.info("RepositoryContext");
            logger.info(`README size: ${context.readme?.length ?? 0} bytes`);
            logger.info(`Changed files: ${context.summary.totalFiles ?? 0}`);
            logger.info(`Git diff size: ${gitDiffSize} characters`);
        }
    } finally {
        logger.endGroup();
    }
}
