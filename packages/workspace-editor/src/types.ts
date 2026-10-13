import { WidgetCatalog } from "./widget-contract.js";
import { WidgetWorkspace } from "./widget-workspace.js";
import { WidgetPageVisibilityOption } from "./widget-page-visibility-option.js";

/** Per-target overrides in the game front `package.json` under `gcWorkspace.targets`. */
export interface GcWorkspaceTargetConfig {
    /** Feature folder under `src/app/features/` (default: player→players, guild→guilds, team→teams). */
    feature?: string;
    catalog?: string;
    registry?: string;
    defaultLayout?: string;
}

export type { WidgetCatalog, WidgetPageVisibilityOption, WidgetWorkspace };

export type ValidationSeverity = "error" | "warning";
