import { writeFileSync } from "node:fs";

import { analyze } from "./analyzer/analyzer.js";
import { buildContext } from "./context/builder.js";
import { updateReadme } from "./updater/updater.js";

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

    writeFileSync("README.generated.md", updatedReadme);

    console.log("Updated README written to README.generated.md");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});