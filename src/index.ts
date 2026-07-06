import { writeFileSync } from "node:fs";

import { analyze } from "./analyzer/analyzer.js";
import { buildContext } from "./context/builder.js";
import { updateReadme } from "./updater/updater.js";
import { createBranch, commit, push } from "./git/git.js"

async function main() {
    const context = buildContext();

    const analysis = await analyze(context);

    console.log(analysis);

    if (!analysis.needsUpdate) {
        console.log("README is already up to date.");
        return;
    }

    const updatedReadme = await updateReadme(
        context.readme,
        analysis.updatePrompt
    );

    const sha = process.env.GITHUB_SHA?.slice(0, 7) ?? "local";
    const branch = `readme-ai/${sha}`;
    createBranch(branch);

    writeFileSync("README.md", updatedReadme);

    if (updatedReadme === context.readme) {
        console.log("README is already up to date.");
        return;
    }

    commit("docs: update README");
    push(branch);

    console.log("Changes pushed successfully.");

        console.log("Updated README written to README.generated.md");
    }

main().catch((err) => {
    console.error(err);
    process.exit(1);
});