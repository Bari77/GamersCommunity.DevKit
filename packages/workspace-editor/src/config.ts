import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { GcWorkspaceConfig, GcWorkspacePackageConfig, GcWorkspaceTargetConfig } from './types.js';

const DEFAULT_TARGET = 'player';

const DEFAULT_FEATURE_FOLDER: Record<string, string> = {
    player: 'players',
    guild: 'guilds',
    team: 'teams',
};

export function readPackageJson(gameRoot: string): Record<string, unknown> {
    const raw = readFileSync(resolve(gameRoot, 'package.json'), 'utf8');
    return JSON.parse(raw) as Record<string, unknown>;
}

export function loadGcWorkspacePackageConfig(gameRoot: string): GcWorkspacePackageConfig {
    const pkg = readPackageJson(gameRoot);
    const custom = pkg['gcWorkspace'];

    if (!custom || typeof custom !== 'object') {
        return {
            defaultTarget: DEFAULT_TARGET,
            targets: { [DEFAULT_TARGET]: {} },
        };
    }

    return custom as GcWorkspacePackageConfig;
}

function featureFolderForTarget(target: string, override?: string): string {
    return override ?? DEFAULT_FEATURE_FOLDER[target] ?? target;
}

function workspaceDirForTarget(target: string, row: GcWorkspaceTargetConfig): string {
    const feature = featureFolderForTarget(target, row.feature);
    return `src/app/features/${feature}/workspace`;
}

/** Lists configured workspace targets (`player`, `guild`, `team`, …). */
export function listWorkspaceTargets(packageConfig: GcWorkspacePackageConfig): string[] {
    if (packageConfig.targets && Object.keys(packageConfig.targets).length > 0) {
        return Object.keys(packageConfig.targets);
    }

    return [DEFAULT_TARGET];
}

/** Resolves catalog/registry/layout paths for a workspace target. */
export function resolveTargetConfig(
    packageConfig: GcWorkspacePackageConfig,
    target: string,
): GcWorkspaceConfig {
    const row = packageConfig.targets?.[target] ?? {};
    const workspaceDir = workspaceDirForTarget(target, row);

    return {
        target,
        catalog: row.catalog ?? packageConfig.catalog ?? `${workspaceDir}/widget-catalog.ts`,
        registry: row.registry ?? packageConfig.registry,
        defaultLayout: row.defaultLayout ?? packageConfig.defaultLayout ?? `config/${target}/workspace.default.json`,
    };
}

/** Reads `gcWorkspace` for one target (defaults to `defaultTarget` or `player`). */
export function loadGcWorkspaceConfig(gameRoot: string, target?: string): GcWorkspaceConfig {
    const packageConfig = loadGcWorkspacePackageConfig(gameRoot);
    const targets = listWorkspaceTargets(packageConfig);
    const targetId = target ?? packageConfig.defaultTarget ?? targets[0] ?? DEFAULT_TARGET;

    if (!targets.includes(targetId)) {
        throw new Error(`Unknown workspace target "${targetId}". Configured targets: ${targets.join(', ')}.`);
    }

    return resolveTargetConfig(packageConfig, targetId);
}

export function resolveRegistryPath(config: GcWorkspaceConfig): string {
    return config.registry ?? config.catalog.replace(/widget-catalog\.ts$/, 'widget-registry.editor.ts');
}
