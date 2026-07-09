export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

export function validateReadmeContent(content: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if empty
    if (!content || content.trim().length === 0) {
        errors.push("README content is empty");
        return { valid: false, errors, warnings };
    }

    // Check for Markdown title
    if (!content.includes("#")) {
        errors.push("README must contain at least one Markdown heading (#)");
    }

    // Check for malformed Markdown
    const unclosedCodeBlocks = (content.match(/```/g) || []).length % 2 !== 0;
    if (unclosedCodeBlocks) {
        errors.push("README contains unclosed Markdown code blocks");
    }

    // Check for common issues
    const invalidLinks = content.match(/\[([^\]]+)\]\(\)/g);
    if (invalidLinks && invalidLinks.length > 0) {
        errors.push(`README contains ${invalidLinks.length} invalid Markdown links (empty href)`);
    }

    // Warnings
    if (content.length < 100) {
        warnings.push("README is quite short (less than 100 characters)");
    }

    if (!content.includes("##")) {
        warnings.push("README has no subheadings (## level headers)");
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}

export function compareReadmes(
    original: string,
    updated: string
): { isDifferent: boolean; changeSize: number } {
    const isDifferent = original.trim() !== updated.trim();
    const changeSize = Math.abs(updated.length - original.length);

    return { isDifferent, changeSize };
}

export function validateUpdate(
    original: string,
    updated: string
): ValidationResult {
    const { isDifferent } = compareReadmes(original, updated);

    if (!isDifferent) {
        return {
            valid: false,
            errors: ["Updated README is identical to original"],
            warnings: [],
        };
    }

    const contentValidation = validateReadmeContent(updated);

    return contentValidation;
}
