import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const gameRoot = env.GC_GAME_ROOT ?? process.env.GC_GAME_ROOT ?? '';
    const registryPath = env.GC_REGISTRY ?? process.env.GC_REGISTRY ?? '';
    const apiUrl = env.GC_API_URL ?? process.env.GC_API_URL ?? 'http://127.0.0.1:4311';

    if (!gameRoot || !registryPath) {
        throw new Error('GC_GAME_ROOT and GC_REGISTRY must be set by the gc-workspace edit command.');
    }

    const gameAliases = readGameAliases(gameRoot);
    const gameNodeModules = resolve(gameRoot, 'node_modules');

    return {
        root: resolve(__dirname),
        publicDir: false,
        plugins: [
            angular({ tsconfig: resolve(__dirname, 'tsconfig.app.json') }),
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
                allow: [resolve(__dirname, '..'), gameRoot],
            },
            proxy: {
                '/api': apiUrl,
            },
        },
        resolve: {
            alias: {
                ...gameAliases,
                '@bari77/gc-widgets': resolve(gameNodeModules, '@bari77/gc-widgets/src/index.ts'),
                '@bari77/gc-theme': resolve(gameNodeModules, '@bari77/gc-theme/src/global.scss'),
            },
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
        },
    };
});
