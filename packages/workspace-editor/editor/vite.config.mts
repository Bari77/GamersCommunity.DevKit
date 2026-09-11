import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';
import angular from '@analogjs/vite-plugin-angular';
import { defineConfig, loadEnv, type Plugin } from 'vite';

function readGamePaths(gameRoot: string): { baseUrl: string; aliases: Record<string, string> } {
    const raw = JSON.parse(readFileSync(resolve(gameRoot, 'tsconfig.json'), 'utf8')) as {
        compilerOptions?: { baseUrl?: string; paths?: Record<string, string[]> };
    };
    const baseUrl = resolve(gameRoot, raw.compilerOptions?.baseUrl ?? 'src');
    const aliases: Record<string, string> = {};

    for (const [key, targets] of Object.entries(raw.compilerOptions?.paths ?? {})) {
        const target = targets[0];
        if (!target) {
            continue;
        }
        aliases[key.replace(/\/\*$/, '')] = resolve(baseUrl, target.replace(/\/\*$/, ''));
    }

    return { baseUrl, aliases };
}

/** The editor must render with the same global stylesheets as the game front itself. */
function readGameStyles(gameRoot: string): string[] {
    type Target = { options?: { styles?: (string | { input: string })[] } };
    const raw = JSON.parse(readFileSync(resolve(gameRoot, 'angular.json'), 'utf8')) as {
        projects?: Record<string, { architect?: Record<string, Target> }>;
    };
    const project = Object.values(raw.projects ?? {})[0];
    const target = Object.values(project?.architect ?? {}).find((it) => Array.isArray(it.options?.styles));

    return (target?.options?.styles ?? []).map((entry) =>
        resolve(gameRoot, typeof entry === 'string' ? entry : entry.input),
    );
}

/** Game sources rely on tsconfig `baseUrl`, so a bare specifier can point at the game's own files. */
function baseUrlResolver(baseUrl: string): Plugin {
    const suffixes = ['.ts', '.js', '.json', '/index.ts'];

    return {
        name: 'gc-game-base-url',
        enforce: 'pre',
        resolveId(id) {
            if (id.startsWith('.') || id.startsWith('\0') || isAbsolute(id)) {
                return;
            }

            return suffixes.map((suffix) => resolve(baseUrl, `${id}${suffix}`)).find((path) => existsSync(path));
        },
    };
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

    const { baseUrl: gameBaseUrl, aliases: gameAliases } = readGamePaths(gameRoot);
    const gameNodeModules = resolve(gameRoot, 'node_modules');
    const widgetsRoot = resolve(vendorRoot, 'gc-widgets');

    const virtualModules: Record<string, string> = {
        'virtual:game-editor-registry': `export { gameWorkspaceEditorRegistry as gameWorkspaceRegistry } from ${JSON.stringify(registryPath)};`,
        'virtual:game-global-styles': readGameStyles(gameRoot)
            .map((path) => `import ${JSON.stringify(path)};`)
            .join('\n'),
    };

    return {
        root: editorRoot,
        cacheDir: resolve(editorRoot, '..', '.vite'),
        publicDir: false,
        plugins: [
            baseUrlResolver(gameBaseUrl),
            angular({
                tsconfig: resolve(editorRoot, 'tsconfig.app.json'),
                workspaceRoot: gameRoot,
                include: [workspaceGlob(gameRoot, widgetsRoot, '/src/**/*.ts'), '/src/**/*.ts'],
            }),
            {
                name: 'gc-game-sources',
                resolveId(id) {
                    return id in virtualModules ? id : undefined;
                },
                load(id) {
                    return virtualModules[id];
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
