import { RepositoryContext } from "./types.js";
import { getGitInfo } from "./git.js";
import { loadReadme } from "./readme.js";

export function buildContext(readmeFilePath?: string, compareRef?: string): RepositoryContext {
    const gitInfo = getGitInfo(compareRef);
    const readme = loadReadme(readmeFilePath);

    return {
        readme,
        changedFiles: gitInfo.changedFiles,
        summary: gitInfo.summary,
    };
}