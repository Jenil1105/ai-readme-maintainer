import { readFileSync, existsSync } from "node:fs";

export function loadReadme(filePath: string = "README.md"): string {
    if (!existsSync(filePath)) {
        return "";
    }

    return readFileSync(filePath, "utf-8");
}

export function validateReadme(
    readme: string
): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!readme || readme.trim() === "") {
        errors.push("README is empty");
    }

    if (!readme.includes("#")) {
        errors.push("README must contain at least one Markdown heading");
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
