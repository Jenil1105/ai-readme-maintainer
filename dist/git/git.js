"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBranch = createBranch;
exports.commit = commit;
exports.push = push;
const node_child_process_1 = require("node:child_process");
function createBranch(name) {
    (0, node_child_process_1.execSync)(`git checkout -b ${name}`, { stdio: "inherit" });
}
function commit(message) {
    (0, node_child_process_1.execSync)("git add README.md", { stdio: "inherit" });
    (0, node_child_process_1.execSync)(`git commit -m "${message}"`, { stdio: "inherit" });
}
function push(branch) {
    (0, node_child_process_1.execSync)(`git push -u origin ${branch}`, { stdio: "inherit" });
}
