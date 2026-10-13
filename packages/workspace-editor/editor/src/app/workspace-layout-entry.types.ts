/** One layout JSON the CLI found under `config/`. */
export interface WorkspaceLayoutEntry {
    id: string;
    target: string;
    layout: string;
    label: string;
    file: string;
    isDefault: boolean;
}
