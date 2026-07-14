# User Guide

This guide is for repository owners and maintainers who want to use AI README Maintainer in a simple and safe way.

## What this action does

This GitHub Action helps keep your README up to date by:

- analyzing repository changes,
- deciding whether the README should be updated,
- creating a new branch with the updated README, and
- opening a pull request for review.

## Things to keep in mind

Please read the following before using this action:

- This action is mainly tested for single-threaded repositories and straightforward branch workflows.
- If your repository uses complex feature-branch merges or unusual branching patterns, the behavior may not be as expected.
- The action will create a new branch and open a pull request. It does not merge automatically.
- After the pull request is created, you can review the changes, make further edits on that branch, and merge it when you are ready.
- You remain in full control of the final review and merge decision.

## Recommended workflow

1. Add the action to your GitHub workflow.
2. Make sure the workflow has permission to create branches and pull requests.
3. Push changes to the branch you want to analyze.
4. Review the generated pull request.
5. If needed, make additional edits on the generated branch.
6. Merge the pull request when you are satisfied with the result.

## Best practices

- Start with the default settings and test the behavior on a small change first.
- Use dry-run mode when you want to preview the result without creating a branch or pull request.
- Review the generated README content carefully before merging.
- Keep your repository workflow simple so the action can work more reliably.

## Limitations

This action may not work perfectly in every repository setup. In particular:

- complex multi-branch merge flows,
- repositories with very unusual documentation patterns, or
- highly customized release processes.

In those cases, you may need to review the generated branch manually and adjust the final README yourself.

## Example workflow

```yaml
name: Update README

on:
  push:
    branches:
      - main

jobs:
  update-readme:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Update README with AI
        uses: Jenil1105/ai-readme-maintainer@v1
        with:
          gemini-api-key: ${{ secrets.GEMINI_API_KEY }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

## Summary

This action is best used as a documentation helper that prepares README updates and creates a reviewable pull request. It is not a fully automatic merge tool, and human review is still important.
