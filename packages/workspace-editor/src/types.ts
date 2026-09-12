import type { WidgetCatalog, WidgetPageVisibilityOption, WidgetWorkspace } from './widget-contract.js';

/** Per-target overrides in the game front `package.json` under `gcWorkspace.targets`. */
export interface GcWorkspaceTargetConfig {
    /** Feature folder under `src/app/features/` (default: player→players, guild→guilds, team→teams). */
    feature?: string;
    catalog?: string;
    registry?: string;
    defaultLayout?: string;
}

/** Raw `gcWorkspace` block from package.json (supports legacy flat fields). */
export interface GcWorkspacePackageConfig {
    defaultTarget?: string;
    targets?: Record<string, GcWorkspaceTargetConfig>;
    catalog?: string;
    registry?: string;
    defaultLayout?: string;
}

/** Resolved paths for one workspace target. */
export interface GcWorkspaceConfig {
    target: string;
    catalog: string;
    registry?: string;
    defaultLayout: string;
}

export interface GameWorkspaceRegistry {
    catalog: WidgetCatalog;
    columns: number;
    rowHeight?: number;
    /** Audiences a page may be restricted to. Omitted leaves every page open to everyone. */
    pageVisibilityOptions?: WidgetPageVisibilityOption[];
    loadTemplateHost?: () => Promise<new (...args: unknown[]) => unknown>;
}

export type { WidgetCatalog, WidgetPageVisibilityOption, WidgetWorkspace };

export type ValidationSeverity = 'error' | 'warning';

export interface ValidationIssue {
    path: string;
    message: string;
    severity: ValidationSeverity;
}

export interface LoadedWorkspaceContext {
    gameRoot: string;
    config: GcWorkspaceConfig;
    registry: GameWorkspaceRegistry;
    layout: WidgetWorkspace;
    layoutPath: string;
}
