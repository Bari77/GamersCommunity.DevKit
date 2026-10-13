/** Resolved paths for one workspace target. */
export interface GcWorkspaceConfig {
    target: string;
    catalog: string;
    registry?: string;
    defaultLayout: string;
}
