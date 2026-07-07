"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const analyzer_js_1 = require("./analyzer/analyzer.js");
const builder_js_1 = require("./context/builder.js");
const updater_js_1 = require("./updater/updater.js");
const git_js_1 = require("./git/git.js");
const pullRequest_js_1 = require("./git/pullRequest.js");
async function main() {
    const context = (0, builder_js_1.buildContext)();
    const analysis = await (0, analyzer_js_1.analyze)(context);
    console.log(analysis);
    if (!analysis.needsUpdate) {
        console.log("README is already up to date.");
        return;
    }
    const updatedReadme = await (0, updater_js_1.updateReadme)(context.readme, analysis.updatePrompt);
    const sha = process.env.GITHUB_SHA?.slice(0, 7) ?? "local";
    const branch = `readme-ai/${sha}`;
    (0, git_js_1.createBranch)(branch);
    (0, node_fs_1.writeFileSync)("README.md", updatedReadme);
    if (updatedReadme === context.readme) {
        console.log("README is already up to date.");
        return;
    }
    (0, git_js_1.commit)("docs: update README");
    (0, git_js_1.push)(branch);
    console.log("Changes pushed successfully.");
    const repository = process.env.GITHUB_REPOSITORY;
    const [owner, repo] = repository.split("/");
    await (0, pullRequest_js_1.createPullRequest)(owner, repo, branch, process.env.GITHUB_REF_NAME ?? "main");
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
