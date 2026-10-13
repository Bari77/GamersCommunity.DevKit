/** One layout JSON found on disk, paired with the target whose catalog describes it. */
export interface WorkspaceLayoutEntry {
    /** `${target}:${layout}`, stable enough to drive the editor picker. */
    id: string;
    target: string;
    /** Repo-relative POSIX path, e.g. `config/player/workspace.default.json`. */
    layout: string;
    label: string;
    file: string;
    isDefault: boolean;
}
