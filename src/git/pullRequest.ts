import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
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