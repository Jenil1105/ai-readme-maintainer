"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildContext = buildContext;
const node_child_process_1 = require("node:child_process");
const node_fs_1 = require("node:fs");
function buildContext() {
    const changedFiles = (0, node_child_process_1.execSync)("git diff --name-only HEAD~1 HEAD", { encoding: "utf-8" })
        .trim()
        .split("\n")
        .filter(Boolean);
    const gitDiff = (0, node_child_process_1.execSync)("git diff HEAD~1 HEAD", { encoding: "utf-8" });
    let readme = "";
    if ((0, node_fs_1.existsSync)("README.md")) {
        readme = (0, node_fs_1.readFileSync)("README.md", "utf-8");
    }
    return {
        changedFiles,
        gitDiff,
        readme,
    };
}
