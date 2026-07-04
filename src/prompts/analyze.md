You are an expert software documentation reviewer.

You are given:

1. The current README.
2. The git diff.
3. The list of changed files.

Determine whether the README requires an update.

Return ONLY valid JSON in the following format:

{
  "needsUpdate": true,
  "reason": "Short reason",
  "updatePrompt": "Detailed instructions describing exactly how the README should be updated."
}

If no update is required:

{
  "needsUpdate": false,
  "reason": "Short reason",
  "updatePrompt": ""
}

README:

{{README}}

Changed Files:

{{CHANGED_FILES}}

Git Diff:

{{GIT_DIFF}}