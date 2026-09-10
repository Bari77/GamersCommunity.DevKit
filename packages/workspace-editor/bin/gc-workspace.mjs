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
    listWorkspaceTargets,
    loadGcWorkspaceConfig,
    loadGcWorkspacePackageConfig,
    resolveRegistryPath,
    validateGameWorkspace,
    validateWorkspaceLayout,
} from '../dist/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, '..');

/**
 * The Angular Vite plugin skips every path containing `node_modules`, so DevKit packages
 * shipped as raw TypeScript must be staged outside of it before the editor can compile them.
 */
function stageGameVendorPackage(vendorRoot, gameRoot, packageFolder) {
    const target = resolve(vendorRoot, packageFolder);
    const source = resolve(gameRoot, 'node_modules', '@bari77', packageFolder);

    if (existsSync(target)) {
        rmSync(target, { recursive: true, force: true });
    }

    mkdirSync(vendorRoot, { recursive: true });
    cpSync(source, target, {
        recursive: true,
        filter: (from) => !relative(source, from).split(sep).includes('node_modules'),
    });
}

function usage() {
    console.error(`Usage: gc-workspace <validate|edit> [options]

Commands:
  validate   Check config/{target}/workspace.default.json against the widget registry
  edit       Validate, then open the standalone layout editor (local SPA + save API)

Options:
  --root     Game front directory (default: current working directory)
  --target   Workspace target id (player, guild, team, … — default: gcWorkspace.defaultTarget)
  --all      Validate every target declared in gcWorkspace.targets
`);
    process.exit(1);
}

function parseArgs(argv) {
    const positional = argv.filter((arg) => !arg.startsWith('--'));
    const command = positional[0];
    let root = process.cwd();
    let target;
    let all = false;

    const rootFlag = argv.indexOf('--root');
    if (rootFlag >= 0 && argv[rootFlag + 1]) {
        root = resolve(argv[rootFlag + 1]);
    }

    const targetFlag = argv.indexOf('--target');
    if (targetFlag >= 0 && argv[targetFlag + 1]) {
        target = argv[targetFlag + 1];
    }

    if (argv.includes('--all')) {
        all = true;
    }

    if (all && target) {
        throw new Error('Use either --target or --all, not both.');
    }

    return { command, root, target, all };
}

async function runValidateTarget(root, target) {
    const { context, issues } = await validateGameWorkspace(root, target);
    console.log(`Target: ${context.config.target}`);
    console.log(`Layout: ${context.config.defaultLayout}`);
    console.log(`Catalog: ${context.config.catalog}`);
    console.log(formatIssues(issues));
    return hasErrors(issues) ? 1 : 0;
}

async function runValidate(root, target, all) {
    try {
        if (all) {
            const packageConfig = loadGcWorkspacePackageConfig(root);
            const targets = listWorkspaceTargets(packageConfig);
            let exitCode = 0;

            for (const targetId of targets) {
                if (targets.length > 1) {
                    console.log(`\n=== ${targetId} ===`);
                }
                const code = await runValidateTarget(root, targetId);
                if (code !== 0) {
                    exitCode = code;
                }
            }

            return exitCode;
        }

        return await runValidateTarget(root, target);
    } catch (error) {
        console.error(error instanceof Error ? error.message : error);
        return 1;
    }
}

function startSaveApi(root, layoutRel, port, target) {
    const layoutPath = resolve(root, layoutRel);

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

            if (req.method === 'GET' && req.url === '/api/config') {
                try {
                    const { context } = await validateGameWorkspace(root, target);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(
                        JSON.stringify({
                            layout: context.layout,
                            catalog: context.registry.catalog,
                            columns: context.registry.columns,
                            rowHeight: context.registry.rowHeight ?? 90,
                            layoutPath: context.config.defaultLayout,
                            target: context.config.target,
                        }),
                    );
                } catch (error) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }));
                }
                return;
            }

            if (req.method === 'PUT' && req.url === '/api/layout') {
                const chunks = [];
                req.on('data', (chunk) => chunks.push(chunk));
                req.on('end', async () => {
                    try {
                        const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
                        const { context } = await validateGameWorkspace(root, target);
                        const layoutIssues = validateWorkspaceLayout(
                            body,
                            context.registry.catalog,
                            context.registry.columns,
                        );
                        if (hasErrors(layoutIssues)) {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ issues: layoutIssues }));
                            return;
                        }

                        mkdirSync(dirname(layoutPath), { recursive: true });
                        writeFileSync(layoutPath, `${JSON.stringify(body, null, 2)}\n`, 'utf8');
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ ok: true, path: layoutRel, target: context.config.target }));
                    } catch (error) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }));
                    }
                });
                return;
            }

            res.writeHead(404);
            res.end();
        });

        server.on('error', reject);
        server.listen(port, () => resolvePromise(server));
    });
}

async function runEdit(root, target) {
    const code = await runValidate(root, target, false);
    if (code !== 0) {
        console.error('Fix validation errors before opening the editor.');
        return code;
    }

    const config = loadGcWorkspaceConfig(root, target);
    const registryPath = resolve(root, resolveRegistryPath(config));
    const layoutRel = config.defaultLayout;
    const apiPort = 4311;
    const editorPort = 4310;

    const api = await startSaveApi(root, layoutRel, apiPort, config.target);

    const editorDir = resolve(packageRoot, 'editor');
    const vendorRoot = resolve(root, '.gc-workspace', 'vendor');
    stageGameVendorPackage(vendorRoot, root, 'gc-widgets');

    const requireFromPkg = createRequire(resolve(packageRoot, 'package.json'));
    const vitePkgDir = dirname(requireFromPkg.resolve('vite/package.json'));
    const viteBin = resolve(vitePkgDir, 'bin', 'vite.js');
    const viteConfig = resolve(packageRoot, 'editor', 'vite.config.mts');

    const child = spawn(process.execPath, [viteBin, 'dev', '--config', viteConfig, '--port', String(editorPort)], {
        cwd: editorDir,
        env: {
            ...process.env,
            GC_GAME_ROOT: root,
            GC_REGISTRY: registryPath,
            GC_VENDOR_ROOT: vendorRoot,
            GC_API_URL: `http://127.0.0.1:${apiPort}`,
        },
        stdio: 'inherit',
    });

    console.log(`\nTarget: ${config.target}`);
    console.log(`Editor: http://127.0.0.1:${editorPort}`);
    console.log(`Saving to: ${layoutRel}`);
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

const { command, root, target, all } = parsed;

if (command === 'validate') {
    process.exit(await runValidate(root, target, all));
}

if (command === 'edit') {
    if (all) {
        console.error('The edit command requires a single target. Use --target or rely on defaultTarget.');
        process.exit(1);
    }
    process.exit(await runEdit(root, target));
}

usage();
