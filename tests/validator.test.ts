import { describe, it, expect } from "vitest";
import {
    validateReadmeContent,
    compareReadmes,
    validateUpdate,
} from "../src/validator/validator";

describe("Validator", () => {
    describe("validateReadmeContent", () => {
        it("should reject empty content", () => {
            const result = validateReadmeContent("");
            expect(result.valid).toBe(false);
            expect(result.errors).toContain("README content is empty");
        });

        it("should reject content without headings", () => {
            const result = validateReadmeContent("This is just text");
            expect(result.valid).toBe(false);
            expect(result.errors).toContain(
                "README must contain at least one Markdown heading (#)"
            );
        });

        it("should accept valid README", () => {
            const result = validateReadmeContent("# My Project\n\nDescription");
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it("should warn about short README", () => {
            const result = validateReadmeContent("# Short");
            expect(result.warnings).toContain(
                "README is quite short (less than 100 characters)"
            );
        });

        it("should detect unclosed code blocks", () => {
            const result = validateReadmeContent("# Test\n```\ncode");
            expect(result.valid).toBe(false);
            expect(result.errors).toContain(
                "README contains unclosed Markdown code blocks"
            );
        });
    });

    describe("compareReadmes", () => {
        it("should detect differences", () => {
            const result = compareReadmes("original", "updated");
            expect(result.isDifferent).toBe(true);
            expect(result.changeSize).toBeGreaterThan(0);
        });

        it("should detect identical content", () => {
            const result = compareReadmes("same", "same");
            expect(result.isDifferent).toBe(false);
            expect(result.changeSize).toBe(0);
        });

        it("should handle whitespace-only differences as same", () => {
            const result = compareReadmes("text", "text  ");
            expect(result.isDifferent).toBe(false);
        });
    });

    describe("validateUpdate", () => {
        it("should reject identical content", () => {
            const result = validateUpdate("# Test", "# Test");
            expect(result.valid).toBe(false);
            expect(result.errors).toContain(
                "Updated README is identical to original"
            );
        });

        it("should accept valid updates", () => {
            const result = validateUpdate("# Test", "# Test\n\nNew content");
            expect(result.valid).toBe(true);
        });
    });
});
