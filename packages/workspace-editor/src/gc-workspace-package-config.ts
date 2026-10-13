import { GcWorkspaceTargetConfig } from "./types.js";

/** Raw `gcWorkspace` block from package.json (supports legacy flat fields). */
export interface GcWorkspacePackageConfig {
    defaultTarget?: string;
    targets?: Record<string, GcWorkspaceTargetConfig>;
    catalog?: string;
    registry?: string;
    defaultLayout?: string;
}
