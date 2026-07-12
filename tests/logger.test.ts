import { afterEach, describe, expect, it } from "vitest";
import { isDebugLoggingEnabled } from "../src/logger/logger.js";

describe("isDebugLoggingEnabled", () => {
    afterEach(() => {
        delete process.env.DEBUG;
        delete process.env.INPUT_DEBUG;
    });

    it("returns false when debug flags are unset", () => {
        expect(isDebugLoggingEnabled()).toBe(false);
    });

    it("returns true when DEBUG is enabled", () => {
        process.env.DEBUG = "true";
        expect(isDebugLoggingEnabled()).toBe(true);
    });

    it("returns true when INPUT_DEBUG is enabled", () => {
        process.env.INPUT_DEBUG = "1";
        expect(isDebugLoggingEnabled()).toBe(true);
    });
});
