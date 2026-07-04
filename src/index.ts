import { buildContext } from "./context/builder.js";
import { analyze } from "./analyzer/analyzer.js";

async function main() {

    const context = buildContext();

    const result = await analyze(context);

    console.log(result);

}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});