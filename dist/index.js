"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/index.ts
var import_node_fs4 = require("fs");

// src/analyzer/analyzer.ts
var import_genai2 = require("@google/genai");
var import_node_fs = require("fs");

// src/analyzer/schema.ts
var import_genai = require("@google/genai");
var analysisSchema = {
  type: import_genai.Type.OBJECT,
  properties: {
    needsUpdate: {
      type: import_genai.Type.BOOLEAN
    },
    reason: {
      type: import_genai.Type.STRING
    },
    updatePrompt: {
      type: import_genai.Type.STRING
    }
  },
  required: ["needsUpdate", "reason", "updatePrompt"]
};

// src/analyzer/analyzer.ts
var core = __toESM(require("@actions/core"));
var geminiApiKey = core.getInput("gemini-api-key");
var ai = new import_genai2.GoogleGenAI({
  apiKey: geminiApiKey
});
async function analyze(context) {
  let prompt = (0, import_node_fs.readFileSync)("src/prompts/analyze.md", "utf-8");
  prompt = prompt.replace("{{README}}", context.readme).replace("{{CHANGED_FILES}}", context.changedFiles.join("\n")).replace("{{GIT_DIFF}}", context.gitDiff);
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: analysisSchema
    }
  });
  const text = response.text?.trim();
  console.log(text);
  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }
  return JSON.parse(text);
}

// src/context/builder.ts
var import_node_child_process = require("child_process");
var import_node_fs2 = require("fs");
function buildContext() {
  const changedFiles = (0, import_node_child_process.execSync)(
    "git diff --name-only HEAD~1 HEAD",
    { encoding: "utf-8" }
  ).trim().split("\n").filter(Boolean);
  const gitDiff = (0, import_node_child_process.execSync)(
    "git diff HEAD~1 HEAD",
    { encoding: "utf-8" }
  );
  let readme = "";
  if ((0, import_node_fs2.existsSync)("README.md")) {
    readme = (0, import_node_fs2.readFileSync)("README.md", "utf-8");
  }
  return {
    changedFiles,
    gitDiff,
    readme
  };
}

// src/updater/updater.ts
var import_genai3 = require("@google/genai");
var import_node_fs3 = require("fs");
var core2 = __toESM(require("@actions/core"));
var geminiApiKey2 = core2.getInput("gemini-api-key");
var ai2 = new import_genai3.GoogleGenAI({
  apiKey: geminiApiKey2
});
async function updateReadme(readme, updatePrompt) {
  let prompt = (0, import_node_fs3.readFileSync)("src/prompts/update.md", "utf-8");
  prompt = prompt.replace("{{UPDATE_PROMPT}}", updatePrompt).replace("{{README}}", readme);
  const response = await ai2.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt
  });
  const updatedReadme = response.text?.trim();
  if (!updatedReadme) {
    throw new Error("Gemini returned an empty README.");
  }
  return updatedReadme;
}

// src/git/git.ts
var import_node_child_process2 = require("child_process");
function createBranch(name) {
  (0, import_node_child_process2.execSync)(`git checkout -b ${name}`, { stdio: "inherit" });
}
function commit(message) {
  (0, import_node_child_process2.execSync)("git add README.md", { stdio: "inherit" });
  (0, import_node_child_process2.execSync)(`git commit -m "${message}"`, { stdio: "inherit" });
}
function push(branch) {
  (0, import_node_child_process2.execSync)(`git push -u origin ${branch}`, { stdio: "inherit" });
}

// src/git/pullRequest.ts
var import_rest = require("@octokit/rest");
var core3 = __toESM(require("@actions/core"));
var githubToken = core3.getInput("github-token");
var octokit = new import_rest.Octokit({
  auth: githubToken
});
async function createPullRequest(owner, repo, head, base) {
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
`
  });
}

// src/index.ts
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
  (0, import_node_fs4.writeFileSync)("README.md", updatedReadme);
  if (updatedReadme === context.readme) {
    console.log("README is already up to date.");
    return;
  }
  commit("docs: update README");
  push(branch);
  console.log("Changes pushed successfully.");
  const repository = process.env.GITHUB_REPOSITORY;
  const [owner, repo] = repository.split("/");
  await createPullRequest(
    owner,
    repo,
    branch,
    process.env.GITHUB_REF_NAME ?? "main"
  );
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
