import { buildSync } from 'esbuild';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadGcWorkspaceConfig } from './config.js';
import type { GameWorkspaceRegistry } from './types.js';

const LOCALIZE_SHIM = `
globalThis.$localize = (strings, ...values) => {
  if (typeof strings === 'string') {
    return strings;
  }
  return String.raw({ raw: strings }, ...values);
};
`;

function readTsconfigPaths(gameRoot: string): Record<string, string> {
    const tsconfigPath = resolve(gameRoot, 'tsconfig.json');
    const raw = JSON.parse(readFileSync(tsconfigPath, 'utf8')) as {
        compilerOptions?: { paths?: Record<string, string[]>; baseUrl?: string };
    };
    const baseUrl = resolve(gameRoot, raw.compilerOptions?.baseUrl ?? 'src');
    const paths = raw.compilerOptions?.paths ?? {};
    const alias: Record<string, string> = {};

    for (const [key, targets] of Object.entries(paths)) {
        const target = targets[0];
        if (!target) {
            continue;
        }
        alias[key.replace(/\/\*$/, '')] = resolve(baseUrl, target.replace(/\/\*$/, ''));
    }

    return alias;
}

function readBundledRegistry(outfile: string): Promise<GameWorkspaceRegistry> {
    return import(pathToFileURL(outfile).href).then((mod: Record<string, unknown>) => {
        const registry = (mod['gameWorkspaceRegistry'] ?? mod['default']) as GameWorkspaceRegistry | undefined;

        if (!registry?.catalog || !registry.columns) {
            throw new Error('Catalog module must export gameWorkspaceRegistry { catalog, columns, rowHeight? }.');
        }

        return registry;
    });
}

function bundleCatalogModule(gameRoot: string, moduleRel: string): Promise<GameWorkspaceRegistry> {
    const modulePath = resolve(gameRoot, moduleRel);
    const tempDir = mkdtempSync(join(tmpdir(), 'gc-workspace-'));
    const outfile = join(tempDir, 'catalog.mjs');

    try {
        buildSync({
            absWorkingDir: gameRoot,
            entryPoints: [modulePath],
            bundle: true,
            platform: 'node',
            format: 'esm',
            outfile,
            logLevel: 'silent',
            packages: 'external',
            alias: readTsconfigPaths(gameRoot),
            banner: { js: LOCALIZE_SHIM },
            external: ['@angular/*', '@nebular/*', '@bari77/*', 'rxjs', 'rxjs/*', 'zone.js'],
        });

        return readBundledRegistry(outfile);
    } finally {
        rmSync(tempDir, { recursive: true, force: true });
    }
}

/** Bundles and evaluates the game's widget catalog module in Node. */
export async function loadGameRegistry(gameRoot: string, catalogRel: string): Promise<GameWorkspaceRegistry> {
    return bundleCatalogModule(gameRoot, catalogRel);
}

export function loadLayoutJson(gameRoot: string, layoutRel: string): unknown {
    const layoutPath = resolve(gameRoot, layoutRel);
    return JSON.parse(readFileSync(layoutPath, 'utf8')) as unknown;
}

export async function loadWorkspaceContext(gameRoot: string, target?: string) {
    const config = loadGcWorkspaceConfig(gameRoot, target);
    const registry = await loadGameRegistry(gameRoot, config.catalog);
    const layoutPath = resolve(gameRoot, config.defaultLayout);
    const layout = loadLayoutJson(gameRoot, config.defaultLayout);

    return {
        gameRoot,
        config,
        registry,
        layout,
        layoutPath,
    };
}

export async function validateGameWorkspace(gameRoot: string, target?: string) {
    const context = await loadWorkspaceContext(gameRoot, target);
    const { validateWorkspaceLayout } = await import('./validate.js');
    const issues = validateWorkspaceLayout(context.layout, context.registry.catalog, context.registry.columns);
    return { context, issues };
}
