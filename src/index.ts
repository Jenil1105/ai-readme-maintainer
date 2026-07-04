import { buildContext } from "./context/builder.js";

async function main() {
    console.log("AI README Maintainer");

    const context = buildContext();

    console.log(context.changedFiles);

    console.log("\nREADME Preview:");
    console.log(context.readme.substring(0, 200));
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});