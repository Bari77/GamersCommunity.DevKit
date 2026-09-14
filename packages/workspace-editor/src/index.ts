export {
    discoverWorkspaceTargets,
    listTargetLayouts,
    listWorkspaceLayouts,
    listWorkspaceTargets,
    loadGcWorkspaceConfig,
    loadGcWorkspacePackageConfig,
    resolveRegistryPath,
    resolveTargetConfig,
    UnknownWorkspaceError,
} from './config.js';
export { loadGameRegistry, loadLayoutJson, loadWorkspaceContext, validateGameWorkspace } from './load-registry.js';
export type {
    GameWorkspaceRegistry,
    GcWorkspaceConfig,
    GcWorkspacePackageConfig,
    GcWorkspaceTargetConfig,
    LoadedWorkspaceContext,
    ValidationIssue,
    ValidationSeverity,
    WorkspaceLayoutEntry,
} from './types.js';
export { formatIssues, hasErrors, validateWorkspaceLayout } from './validate.js';
