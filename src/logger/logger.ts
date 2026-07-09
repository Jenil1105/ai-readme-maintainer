import * as core from "@actions/core";

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
