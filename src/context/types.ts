export interface ChangedFile {
    path: string;
    extension: string;
    diff: string;
    additions: number;
    deletions: number;
    changeType: "added" | "modified" | "deleted";
}

export interface RepositoryContext {
    readme: string;
    changedFiles: ChangedFile[];
    summary: {
        totalFiles: number;
        totalAdditions: number;
        totalDeletions: number;
        filesByType: Record<string, number>;
    };
}