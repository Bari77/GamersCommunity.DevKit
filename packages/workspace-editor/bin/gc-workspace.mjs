#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { mkdirSync, writeFileSync, existsSync, rmSync, cpSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    formatIssues,
    hasErrors,
    listWorkspaceLayouts,
    loadGcWorkspaceConfig,
    resolveRegistryPath,
    UnknownWorkspaceError,
    validateGameWorkspace,
    validateWorkspaceLayout,
} from '../dist/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, '..');

/**
 * The Angular Vite plugin skips every path containing `node_modules`, so the editor app and the
 * DevKit packages shipped as raw TypeScript must be staged outside of it before being compiled.
 */
function stageSources(source, target) {
    if (existsSync(target)) {
        rmSync(target, { recursive: true, force: true });
    }

    mkdirSync(dirname(target), { recursive: true });
    cpSync(source, target, {
        recursive: true,
        filter: (from) => !relative(source, from).split(sep).includes('node_modules'),
    });
}

function usage() {
    console.error(`Usage: gc-workspace <validate|edit> [options]

Commands:
  validate   Check the layout JSONs found under config/ against the widget registries
  edit       Validate, then open the standalone layout editor (local SPA + save API)

Options:
  --root     Game front directory (default: current working directory)
  --target   Workspace target id (player, guild, team, … — default: gcWorkspace.defaultTarget)
  --layout   Layout JSON to open, relative to the game root (default: the target's default)
  --port     Editor port (default: 4310); the save API takes the next one
  --all      Validate every layout of every target
`);
    process.exit(1);
}

function parseArgs(argv) {
    const positional = argv.filter((arg) => !arg.startsWith('--'));
    const command = positional[0];
    let root = process.cwd();
    let target;
    let layout;
    let port = 4310;
    let all = false;

    const rootFlag = argv.indexOf('--root');
    if (rootFlag >= 0 && argv[rootFlag + 1]) {
        root = resolve(argv[rootFlag + 1]);
    }

    const targetFlag = argv.indexOf('--target');
    if (targetFlag >= 0 && argv[targetFlag + 1]) {
        target = argv[targetFlag + 1];
    }

    const layoutFlag = argv.indexOf('--layout');
    if (layoutFlag >= 0 && argv[layoutFlag + 1]) {
        layout = argv[layoutFlag + 1];
    }

    const portFlag = argv.indexOf('--port');
    if (portFlag >= 0 && argv[portFlag + 1]) {
        port = Number(argv[portFlag + 1]);

        if (!Number.isInteger(port) || port < 1 || port > 65534) {
            throw new Error(`Invalid --port "${argv[portFlag + 1]}".`);
        }
    }

    if (argv.includes('--all')) {
        all = true;
    }

    if (all && (target || layout)) {
        throw new Error('Use either --target/--layout or --all, not both.');
    }

    return { command, root, target, layout, port, all };
}

async function runValidateLayout(root, target, layout) {
    const { context, issues } = await validateGameWorkspace(root, target, layout);
    console.log(`Target: ${context.config.target}`);
    console.log(`Layout: ${context.config.defaultLayout}`);
    console.log(`Catalog: ${context.config.catalog}`);
    console.log(formatIssues(issues));
    return hasErrors(issues) ? 1 : 0;
}

async function runValidate(root, target, layout, all) {
    try {
        if (all) {
            const entries = listWorkspaceLayouts(root);

            if (entries.length === 0) {
                console.error('No layout JSON found under config/.');
                return 1;
            }

            let exitCode = 0;

            for (const entry of entries) {
                if (entries.length > 1) {
                    console.log(`\n=== ${entry.target} - ${entry.file} ===`);
                }
                const code = await runValidateLayout(root, entry.target, entry.layout);
                if (code !== 0) {
                    exitCode = code;
                }
            }

            return exitCode;
        }

        return await runValidateLayout(root, target, layout);
    } catch (error) {
        console.error(error instanceof Error ? error.message : error);
        return 1;
    }
}

function sendJson(res, status, body) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
}

function sendError(res, error) {
    const status = error instanceof UnknownWorkspaceError ? 400 : 500;
    sendJson(res, status, { error: error instanceof Error ? error.message : String(error) });
}

function readBody(req) {
    return new Promise((resolvePromise, reject) => {
        const chunks = [];
        req.on('data', (chunk) => chunks.push(chunk));
        req.on('error', reject);
        req.on('end', () => resolvePromise(Buffer.concat(chunks).toString('utf8')));
    });
}

/**
 * Serves the layouts found on disk and writes the one the editor picked. Both the target and
 * the file come from the browser, so every request goes back through the scan before touching
 * the filesystem.
 */
function startSaveApi(root, port, editableTargets) {
    return new Promise((resolvePromise, reject) => {
        const server = createServer(async (req, res) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

            if (req.method === 'OPTIONS') {
                res.writeHead(204);
                res.end();
                return;
            }

            const url = new URL(req.url, 'http://127.0.0.1');
            const target = url.searchParams.get('target') ?? undefined;
            const layout = url.searchParams.get('layout') ?? undefined;

            if (req.method === 'GET' && url.pathname === '/api/layouts') {
                try {
                    const entries = listWorkspaceLayouts(root).filter((entry) =>
                        editableTargets.includes(entry.target),
                    );
                    sendJson(res, 200, { entries });
                } catch (error) {
                    sendError(res, error);
                }
                return;
            }

            if (req.method === 'GET' && url.pathname === '/api/config') {
                try {
                    const { context } = await validateGameWorkspace(root, target, layout);
                    sendJson(res, 200, {
                        layout: context.layout,
                        catalog: context.registry.catalog,
                        columns: context.registry.columns,
                        rowHeight: context.registry.rowHeight ?? 90,
                        layoutPath: context.config.defaultLayout,
                        target: context.config.target,
                    });
                } catch (error) {
                    sendError(res, error);
                }
                return;
            }

            if (req.method === 'PUT' && url.pathname === '/api/layout') {
                try {
                    const body = JSON.parse(await readBody(req));
                    const { context } = await validateGameWorkspace(root, target, layout);
                    const layoutIssues = validateWorkspaceLayout(
                        body,
                        context.registry.catalog,
                        context.registry.columns,
                        context.registry.pageVisibilityOptions ?? [],
                    );

                    if (hasErrors(layoutIssues)) {
                        sendJson(res, 400, { issues: layoutIssues });
                        return;
                    }

                    const layoutPath = resolve(root, context.config.defaultLayout);
                    mkdirSync(dirname(layoutPath), { recursive: true });
                    writeFileSync(layoutPath, `${JSON.stringify(body, null, 2)}\n`, 'utf8');
                    sendJson(res, 200, {
                        ok: true,
                        path: context.config.defaultLayout,
                        target: context.config.target,
                    });
                } catch (error) {
                    sendError(res, error);
                }
                return;
            }

            res.writeHead(404);
            res.end();
        });

        server.on('error', reject);
        server.listen(port, () => resolvePromise(server));
    });
}

/** Every target the editor may switch to needs its registry compiled into the SPA. */
function registryPaths(root) {
    const entries = {};

    for (const entry of listWorkspaceLayouts(root)) {
        if (entries[entry.target]) {
            continue;
        }

        const config = loadGcWorkspaceConfig(root, entry.target);
        const registry = resolve(root, resolveRegistryPath(config));

        if (existsSync(registry)) {
            entries[entry.target] = registry;
        } else {
            console.warn(`No editor registry for target "${entry.target}" (${registry}), skipping it.`);
        }
    }

    return entries;
}

async function runEdit(root, target, layout, editorPort) {
    const code = await runValidate(root, target, layout, false);
    if (code !== 0) {
        console.error('Fix validation errors before opening the editor.');
        return code;
    }

    const config = loadGcWorkspaceConfig(root, target, layout);
    const registries = registryPaths(root);
    const layouts = listWorkspaceLayouts(root).filter((entry) => entry.target in registries);
    const apiPort = editorPort + 1;

    const api = await startSaveApi(root, apiPort, Object.keys(registries));

    // Staged per port so a second instance never pulls the rug from under the first one.
    const stageRoot = resolve(root, '.gc-workspace', String(editorPort));
    const editorRoot = resolve(stageRoot, 'editor');
    const vendorRoot = resolve(stageRoot, 'vendor');

    stageSources(resolve(packageRoot, 'editor'), editorRoot);
    stageSources(resolve(root, 'node_modules', '@bari77', 'gc-widgets'), resolve(vendorRoot, 'gc-widgets'));

    const requireFromPkg = createRequire(resolve(packageRoot, 'package.json'));
    const vitePkgDir = dirname(requireFromPkg.resolve('vite/package.json'));
    const viteBin = resolve(vitePkgDir, 'bin', 'vite.js');
    const viteConfig = resolve(packageRoot, 'editor', 'vite.config.mts');

    const child = spawn(process.execPath, [viteBin, 'dev', '--config', viteConfig, '--port', String(editorPort)], {
        cwd: editorRoot,
        env: {
            ...process.env,
            GC_GAME_ROOT: root,
            GC_REGISTRIES: JSON.stringify(registries),
            GC_START_TARGET: config.target,
            GC_START_LAYOUT: config.defaultLayout,
            GC_EDITOR_ROOT: editorRoot,
            GC_VENDOR_ROOT: vendorRoot,
            GC_API_URL: `http://127.0.0.1:${apiPort}`,
        },
        stdio: 'inherit',
    });

    console.log(`\nEditor: http://127.0.0.1:${editorPort}`);
    console.log(`Opening: ${config.target} - ${config.defaultLayout}`);
    console.log(`Layouts found: ${layouts.map((entry) => entry.layout).join(', ')}`);
    console.log('Press Ctrl+C to stop.\n');

    const shutdown = () => {
        api.close();
        child.kill('SIGINT');
        process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    return await new Promise((resolvePromise) => {
        child.on('exit', (status) => {
            api.close();
            resolvePromise(status ?? 0);
        });
    });
}

let parsed;
try {
    parsed = parseArgs(process.argv.slice(2));
} catch (error) {
    console.error(error instanceof Error ? error.message : error);
    usage();
}

const { command, root, target, layout, port, all } = parsed;

if (command === 'validate') {
    process.exit(await runValidate(root, target, layout, all));
}

if (command === 'edit') {
    if (all) {
        console.error('The edit command opens one layout at a time; switch targets from the editor itself.');
        process.exit(1);
    }
    process.exit(await runEdit(root, target, layout, port));
}

usage();
