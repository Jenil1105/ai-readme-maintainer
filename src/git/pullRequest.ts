import { Octokit } from "@octokit/rest";
import * as core from "@actions/core";

const githubToken = core.getInput("github-token");

const octokit = new Octokit({
    auth: githubToken,
});

export async function createPullRequest(
    owner: string,
    repo: string,
    head: string,
    base: string
) {
    await octokit.pulls.create({
        owner,
        repo,
        head,
        base,
        title: "docs: update README",
        body: `
## AI README Maintainer

This PR updates the README automatically based on the latest code changes.

Please review the generated documentation before merging.
`,
    });
}