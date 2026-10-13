import { WidgetWorkspace } from "./widget-workspace.js";
import { GcWorkspaceConfig } from "./gc-workspace-config.js";
import { GameWorkspaceRegistry } from "./game-workspace-registry.js";

export interface LoadedWorkspaceContext {
    gameRoot: string;
    config: GcWorkspaceConfig;
    registry: GameWorkspaceRegistry;
    layout: WidgetWorkspace;
    layoutPath: string;
}
