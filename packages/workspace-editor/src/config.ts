import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { posix, resolve } from 'node:path';
import type {
    GcWorkspaceConfig,
    GcWorkspacePackageConfig,
    GcWorkspaceTargetConfig,
    WorkspaceLayoutEntry,
} from './types.js';

const DEFAULT_TARGET = 'player';

/** Where a game keeps its layout JSONs, one folder per target. */
const LAYOUT_ROOT = 'config';

const DEFAULT_FEATURE_FOLDER: Record<string, string> = {
    player: 'players',
    guild: 'guilds',
    team: 'teams',
};

function toPosix(path: string): string {
    return path.replace(/\\/g, '/');
}

/** Raised when the caller names a target or a layout the scan did not find. */
export class UnknownWorkspaceError extends Error {}

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

function jsonFilesIn(directory: string): string[] {
    if (!existsSync(directory)) {
        return [];
    }

    return readdirSync(directory, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
        .map((entry) => entry.name)
        .sort();
}

/**
 * A folder under `config/` only counts as a target when the matching catalog exists: a game
 * keeps plenty of unrelated JSON there, and validating it against someone else's widgets
 * would just spit out noise.
 */
export function discoverWorkspaceTargets(gameRoot: string, packageConfig: GcWorkspacePackageConfig): string[] {
    const declared = listWorkspaceTargets(packageConfig);
    const layoutRoot = resolve(gameRoot, LAYOUT_ROOT);

    if (!existsSync(layoutRoot)) {
        return declared;
    }

    const discovered = readdirSync(layoutRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .filter((name) => !declared.includes(name))
        .filter((name) => jsonFilesIn(resolve(layoutRoot, name)).length > 0)
        .filter((name) => existsSync(resolve(gameRoot, resolveTargetConfig(packageConfig, name).catalog)))
        .sort();

    return [...declared, ...discovered];
}

/** Every `*.json` sitting next to a target's default layout, that one first. */
export function listTargetLayouts(gameRoot: string, config: GcWorkspaceConfig): string[] {
    const defaultLayout = toPosix(config.defaultLayout);
    const directory = posix.dirname(defaultLayout);
    const files = jsonFilesIn(resolve(gameRoot, directory)).map((name) => posix.join(directory, name));

    if (files.length === 0) {
        return existsSync(resolve(gameRoot, defaultLayout)) ? [defaultLayout] : [];
    }

    return [...files.filter((file) => file === defaultLayout), ...files.filter((file) => file !== defaultLayout)];
}

function titleCase(target: string): string {
    return target.charAt(0).toUpperCase() + target.slice(1);
}

/** Every layout the editor may open, scanned from disk rather than declared one by one. */
export function listWorkspaceLayouts(gameRoot: string): WorkspaceLayoutEntry[] {
    const packageConfig = loadGcWorkspacePackageConfig(gameRoot);

    return discoverWorkspaceTargets(gameRoot, packageConfig).flatMap((target) => {
        const config = resolveTargetConfig(packageConfig, target);

        return listTargetLayouts(gameRoot, config).map((layout) => ({
            id: `${target}:${layout}`,
            target,
            layout,
            label: titleCase(target),
            file: posix.basename(layout),
            isDefault: layout === toPosix(config.defaultLayout),
        }));
    });
}

/**
 * Reads `gcWorkspace` for one target (defaults to `defaultTarget` or `player`). A layout may
 * be picked among the ones found on disk, which is also what keeps the save API from writing
 * to any path the browser asks for.
 */
export function loadGcWorkspaceConfig(gameRoot: string, target?: string, layout?: string): GcWorkspaceConfig {
    const packageConfig = loadGcWorkspacePackageConfig(gameRoot);
    const targets = discoverWorkspaceTargets(gameRoot, packageConfig);
    const targetId = target ?? packageConfig.defaultTarget ?? targets[0] ?? DEFAULT_TARGET;

    if (!targets.includes(targetId)) {
        throw new UnknownWorkspaceError(
            `Unknown workspace target "${targetId}". Available targets: ${targets.join(', ')}.`,
        );
    }

    const config = resolveTargetConfig(packageConfig, targetId);

    if (!layout) {
        return config;
    }

    const available = listTargetLayouts(gameRoot, config);
    const requested = toPosix(layout);

    if (!available.includes(requested)) {
        throw new UnknownWorkspaceError(
            `Unknown layout "${layout}" for target "${targetId}". Available: ${available.join(', ')}.`,
        );
    }

    return { ...config, defaultLayout: requested };
}

export function resolveRegistryPath(config: GcWorkspaceConfig): string {
    return config.registry ?? config.catalog.replace(/widget-catalog\.ts$/, 'widget-registry.editor.ts');
}
