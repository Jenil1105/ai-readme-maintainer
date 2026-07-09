import { logger } from "../logger/logger.js";

export class AIError extends Error {
    constructor(message: string, public readonly code: string) {
        super(message);
        this.name = "AIError";
    }
}

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ValidationError";
    }
}

export class GitError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "GitError";
    }
}

export function handleError(error: unknown): string {
    if (error instanceof AIError) {
        logger.error(`AI Error [${error.code}]: ${error.message}`);

        switch (error.code) {
            case "GEMINI_TIMEOUT":
                return "Gemini API request timed out. Please try again.";
            case "GEMINI_RATE_LIMIT":
                return "Gemini API rate limit exceeded. Please try again later.";
            case "GEMINI_INVALID_JSON":
                return "Gemini returned invalid JSON. Please try again.";
            case "GEMINI_EMPTY_RESPONSE":
                return "Gemini returned an empty response. Please try again.";
            default:
                return `AI Error: ${error.message}`;
        }
    }

    if (error instanceof ValidationError) {
        logger.error(`Validation Error: ${error.message}`);
        return `Validation failed: ${error.message}`;
    }

    if (error instanceof GitError) {
        logger.error(`Git Error: ${error.message}`);
        return `Git operation failed: ${error.message}`;
    }

    if (error instanceof Error) {
        logger.error(`Error: ${error.message}`);
        return error.message;
    }

    const message = String(error);
    logger.error(`Unknown error: ${message}`);
    return message;
}

export function throwValidationError(message: string): never {
    throw new ValidationError(message);
}

export function throwGitError(message: string): never {
    throw new GitError(message);
}

export function throwAIError(message: string, code: string): never {
    throw new AIError(message, code);
}
