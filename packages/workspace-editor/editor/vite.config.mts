import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';
import angular from '@analogjs/vite-plugin-angular';
import { defineConfig, loadEnv, type Plugin } from 'vite';

type GamePaths = { baseUrl: string; paths: Record<string, string[]>; aliases: Record<string, string> };

function readGamePaths(gameRoot: string): GamePaths {
    const raw = JSON.parse(readFileSync(resolve(gameRoot, 'tsconfig.json'), 'utf8')) as {
        compilerOptions?: { baseUrl?: string; paths?: Record<string, string[]> };
    };
    const baseUrl = resolve(gameRoot, raw.compilerOptions?.baseUrl ?? 'src');
    const paths = raw.compilerOptions?.paths ?? {};
    const aliases: Record<string, string> = {};

    for (const [key, targets] of Object.entries(paths)) {
        const target = targets[0];
        if (!target) {
            continue;
        }
        aliases[key.replace(/\/\*$/, '')] = resolve(baseUrl, target.replace(/\/\*$/, ''));
    }

    return { baseUrl, paths, aliases };
}

function posix(path: string): string {
    return path.replace(/\\/g, '/');
}

/** The staged copies of the `@bari77` packages the game front depends on, by package name. */
function vendorPackages(vendorRoot: string): Record<string, string> {
    const entries = readdirSync(vendorRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && existsSync(resolve(vendorRoot, entry.name, 'src/index.ts')))
        .map((entry) => [`@bari77/${entry.name}`, posix(resolve(vendorRoot, entry.name, 'src'))] as const);

    return Object.fromEntries(entries);
}

/**
 * The Angular compiler resolves specifiers through the tsconfig, not through the Vite aliases, so
 * it needs the very same mappings: an unresolved widget import makes it drop the component from
 * the compilation without a word, and the browser then falls back to the absent JIT compiler.
 */
function writeEditorTsConfig(
    editorRoot: string,
    gameRoot: string,
    vendor: Record<string, string>,
    game: GamePaths,
): string {
    const tsconfigPath = resolve(editorRoot, 'tsconfig.app.json');
    const vendorPaths = Object.entries(vendor).flatMap(([name, src]) => [
        [name, [`${src}/index.ts`]] as const,
        [`${name}/*`, [`${src}/*`]] as const,
    ]);

    writeFileSync(
        tsconfigPath,
        `${JSON.stringify(
            {
                extends: './tsconfig.json',
                compilerOptions: {
                    baseUrl: posix(game.baseUrl),
                    paths: {
                        ...game.paths,
                        ...Object.fromEntries(vendorPaths),
                    },
                    outDir: './dist/out-tsc',
                },
                angularCompilerOptions: {
                    enableI18nLegacyMessageIdFormat: false,
                    strictInjectionParameters: true,
                    strictInputAccessModifiers: true,
                    strictTemplates: true,
                },
                include: [
                    `${posix(resolve(editorRoot, 'src'))}/**/*.ts`,
                    `${posix(gameRoot)}/src/**/*.ts`,
                    ...Object.values(vendor).map((src) => `${src}/**/*.ts`),
                ],
            },
            null,
            4,
        )}\n`,
        'utf8',
    );

    return tsconfigPath;
}

/**
 * Last line of defence against the silent skip described above: a component served with its
 * decorator untouched would only fail once Angular bootstraps it in the browser.
 */
function aotGuard(): Plugin {
    return {
        name: 'gc-aot-guard',
        enforce: 'post',
        transform(code, id) {
            if (!id.endsWith('.ts') || /ɵcmp|ɵdir|ɵpipe/.test(code)) {
                return;
            }
            if (/__decorate\(\[\s*(Component|Directive|Pipe)\(/.test(code)) {
                this.error(
                    `${id} was not compiled ahead of time. Check that every specifier it imports resolves through the tsconfig paths of the game front.`,
                );
            }
        },
    };
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
    const registriesJson = env.GC_REGISTRIES ?? process.env.GC_REGISTRIES ?? '';
    const editorRoot = upperCaseDrive(env.GC_EDITOR_ROOT ?? process.env.GC_EDITOR_ROOT ?? '');
    const vendorRoot = upperCaseDrive(env.GC_VENDOR_ROOT ?? process.env.GC_VENDOR_ROOT ?? '');
    const apiUrl = env.GC_API_URL ?? process.env.GC_API_URL ?? 'http://127.0.0.1:4311';
    const startTarget = env.GC_START_TARGET ?? process.env.GC_START_TARGET ?? '';
    const startLayout = env.GC_START_LAYOUT ?? process.env.GC_START_LAYOUT ?? '';

    if (!gameRoot || !registriesJson || !editorRoot || !vendorRoot) {
        throw new Error(
            'GC_GAME_ROOT, GC_REGISTRIES, GC_EDITOR_ROOT and GC_VENDOR_ROOT must be set by the gc-workspace edit command.',
        );
    }

    const registries = Object.entries(JSON.parse(registriesJson) as Record<string, string>).map(
        ([target, path]) => [target, upperCaseDrive(path)] as const,
    );

    const game = readGamePaths(gameRoot);
    const gameNodeModules = resolve(gameRoot, 'node_modules');
    const vendor = vendorPackages(vendorRoot);
    const tsconfig = writeEditorTsConfig(editorRoot, gameRoot, vendor, game);

    // One entry per target, imported on demand so switching layouts never reloads the page.
    const registryLoaders = registries
        .map(
            ([target, path]) =>
                `    ${JSON.stringify(target)}: () => import(${JSON.stringify(path)}).then((m) => m.gameWorkspaceEditorRegistry),`,
        )
        .join('\n');

    const virtualModules: Record<string, string> = {
        'virtual:game-editor-registry': `export const gameWorkspaceRegistries = {\n${registryLoaders}\n};\n`,
        'virtual:game-global-styles': readGameStyles(gameRoot)
            .map((path) => `import ${JSON.stringify(path)};`)
            .join('\n'),
    };

    return {
        root: editorRoot,
        cacheDir: resolve(editorRoot, '..', '.vite'),
        publicDir: false,
        plugins: [
            baseUrlResolver(game.baseUrl),
            angular({
                tsconfig,
                workspaceRoot: gameRoot,
                include: [
                    ...Object.values(vendor).map((src) => workspaceGlob(gameRoot, src, '/**/*.ts')),
                    '/src/**/*.ts',
                ],
            }),
            aotGuard(),
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
            'import.meta.env.GC_START_TARGET': JSON.stringify(startTarget),
            'import.meta.env.GC_START_LAYOUT': JSON.stringify(startLayout),
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
                ...Object.entries(game.aliases).map(([find, replacement]) => ({ find, replacement })),
                ...Object.entries(vendor).flatMap(([name, src]) => [
                    { find: new RegExp(`^${name}$`), replacement: `${src}/index.ts` },
                    { find: new RegExp(`^${name}/(.*)$`), replacement: `${src}/$1` },
                ]),
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
            exclude: Object.keys(vendor),
        },
    };
});
