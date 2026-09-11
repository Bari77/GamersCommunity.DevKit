import { readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import angular from '@analogjs/vite-plugin-angular';
import { defineConfig, loadEnv } from 'vite';

function readGameAliases(gameRoot: string): Record<string, string> {
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

/** Analog include globs are appended to workspaceRoot, so they must be root-relative and POSIX. */
function workspaceGlob(workspaceRoot: string, absolutePath: string, suffix: string): string {
    return `/${relative(workspaceRoot, absolutePath).replace(/\\/g, '/')}${suffix}`;
}

/**
 * Vite upper-cases Windows drive letters in module ids. The Angular plugin keys its emit
 * cache on the paths it was configured with, so a lower-cased drive silently makes every
 * file look absent from the TypeScript program.
 */
function upperCaseDrive(path: string): string {
    return path.replace(/^([a-z]):/, (_match, drive: string) => `${drive.toUpperCase()}:`);
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const gameRoot = upperCaseDrive(env.GC_GAME_ROOT ?? process.env.GC_GAME_ROOT ?? '');
    const registryPath = upperCaseDrive(env.GC_REGISTRY ?? process.env.GC_REGISTRY ?? '');
    const editorRoot = upperCaseDrive(env.GC_EDITOR_ROOT ?? process.env.GC_EDITOR_ROOT ?? '');
    const vendorRoot = upperCaseDrive(env.GC_VENDOR_ROOT ?? process.env.GC_VENDOR_ROOT ?? '');
    const apiUrl = env.GC_API_URL ?? process.env.GC_API_URL ?? 'http://127.0.0.1:4311';

    if (!gameRoot || !registryPath || !editorRoot || !vendorRoot) {
        throw new Error(
            'GC_GAME_ROOT, GC_REGISTRY, GC_EDITOR_ROOT and GC_VENDOR_ROOT must be set by the gc-workspace edit command.',
        );
    }

    const gameAliases = readGameAliases(gameRoot);
    const gameNodeModules = resolve(gameRoot, 'node_modules');
    const widgetsRoot = resolve(vendorRoot, 'gc-widgets');

    return {
        root: editorRoot,
        cacheDir: resolve(editorRoot, '..', '.vite'),
        publicDir: false,
        plugins: [
            angular({
                tsconfig: resolve(editorRoot, 'tsconfig.app.json'),
                workspaceRoot: gameRoot,
                include: [
                    workspaceGlob(gameRoot, widgetsRoot, '/src/**/*.ts'),
                    '/src/app/features/**/workspace/**/*.ts',
                ],
            }),
            {
                name: 'gc-game-registry',
                resolveId(id) {
                    if (id === 'virtual:game-editor-registry') {
                        return id;
                    }
                },
                load(id) {
                    if (id === 'virtual:game-editor-registry') {
                        return `export { gameWorkspaceEditorRegistry as gameWorkspaceRegistry } from ${JSON.stringify(registryPath)};`;
                    }
                },
            },
        ],
        define: {
            'import.meta.env.GC_API_URL': JSON.stringify(apiUrl),
        },
        server: {
            port: 4310,
            fs: {
                allow: [gameRoot],
            },
            proxy: {
                '/api': apiUrl,
            },
        },
        resolve: {
            alias: [
                ...Object.entries(gameAliases).map(([find, replacement]) => ({ find, replacement })),
                { find: /^@bari77\/gc-widgets$/, replacement: resolve(widgetsRoot, 'src/index.ts') },
                { find: /^@bari77\/gc-widgets\/(.*)$/, replacement: `${resolve(widgetsRoot, 'src')}/$1` },
                { find: '@bari77/gc-theme', replacement: resolve(gameNodeModules, '@bari77/gc-theme/src/global.scss') },
            ],
        },
        css: {
            preprocessorOptions: {
                scss: {
                    loadPaths: [gameNodeModules],
                },
            },
        },
        optimizeDeps: {
            include: ['@angular/core', '@angular/common', '@angular/localize/init', 'rxjs', 'zone.js'],
            exclude: ['@bari77/gc-widgets'],
        },
    };
});
