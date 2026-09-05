import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const TEMPLATE_REPO = "https://github.com/Bari77/GamersCommunity.Games.Template.git";
const TEMPLATE_REF = "main";

const SRC = {
  pascal: "Template",
  lower: "template",
  queue: "template_queue",
  compose: "gc-template-dev",
  css: "tpl",
  frontPort: "4202",
  gatewayPort: "8082",
};

/**
 * @param {string} raw
 */
export function deriveNames(raw) {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error("Game name is required.");

  const pascal = trimmed
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[\s_\-./]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");

  if (!/^[A-Z][A-Za-z0-9]*$/.test(pascal)) {
    throw new Error(`Invalid game name "${raw}". Use letters/digits (e.g. StarCraft).`);
  }

  const parts = pascal.replace(/([a-z0-9])([A-Z])/g, "$1-$2").split("-");
  const kebab = parts.map((p) => p.toLowerCase()).join("-");
  const camel = pascal.charAt(0).toLowerCase() + pascal.slice(1);
  const microserviceId = pascal.toLowerCase();
  const cssPrefix = parts.map((p) => p.charAt(0).toLowerCase()).join("") || "gc";

  return {
    GamePascal: pascal,
    GameKebab: kebab,
    GameCamel: camel,
    MicroserviceId: microserviceId,
    QueueName: `${microserviceId}_queue`,
    ComposeName: `gc-${microserviceId}-dev`,
    NetworkName: microserviceId,
    CssPrefix: cssPrefix.slice(0, 8),
  };
}

/**
 * @param {string} content
 * @param {{ GamePascal: string, GameKebab: string, GameCamel: string, MicroserviceId: string, QueueName: string, ComposeName: string, NetworkName: string, CssPrefix: string, FrontPort: string, GatewayPort: string }} map
 */
export function rewriteTemplateContent(content, map) {
  let out = content;
  out = out.split(SRC.queue).join(map.QueueName);
  out = out.split(SRC.compose).join(map.ComposeName);
  out = out.split(SRC.gatewayPort).join(map.GatewayPort);
  out = out.split(SRC.frontPort).join(map.FrontPort);
  out = out.split(SRC.pascal).join(map.GamePascal);
  out = out.split(SRC.css).join(map.CssPrefix);

  const { GameKebab: kebab, GameCamel: camel, MicroserviceId: id, NetworkName: network } = map;
  const collapsed = kebab === camel && camel === id;

  if (collapsed) {
    return out.split(SRC.lower).join(id);
  }

  const MK_ROUTES = "\0GC_KEBAB_ROUTES\0";
  const MK_PREFIX = "\0GC_KEBAB_PREFIX\0";
  const MK_QID = "\0GC_QUOTED_ID\0";
  const MK_QID_S = "\0GC_QUOTED_ID_S\0";
  const MK_NET = "\0GC_NETWORK\0";
  const MK_ID = "\0GC_ID\0";

  out = out.split(`${SRC.lower}.routes`).join(`${MK_ROUTES}.routes`);
  out = out.split(`/${SRC.lower}`).join(`/${MK_PREFIX}`);
  out = out.split(`"${SRC.lower}"`).join(MK_QID);
  out = out.split(`'${SRC.lower}'`).join(MK_QID_S);
  out = out.split(`- ${SRC.lower}`).join(`- ${MK_NET}`);
  out = out.split(`  ${SRC.lower}:`).join(`  ${MK_NET}:`);
  out = out.split(SRC.lower).join(MK_ID);

  out = out.split(MK_ROUTES).join(kebab);
  out = out.split(MK_PREFIX).join(kebab);
  out = out.split(MK_QID).join(`"${id}"`);
  out = out.split(MK_QID_S).join(`'${id}'`);
  out = out.split(MK_NET).join(network);
  out = out.split(MK_ID).join(id);
  return out;
}

/**
 * @param {string} name
 * @param {{ GamePascal: string, GameKebab: string, GameCamel: string, MicroserviceId: string, CssPrefix: string }} map
 */
export function rewriteTemplatePath(name, map) {
  let out = name;
  out = out.split(SRC.pascal).join(map.GamePascal);
  out = out.split(SRC.css).join(map.CssPrefix);
  if (out.includes(`${SRC.lower}.routes`)) {
    out = out.split(`${SRC.lower}.routes`).join(`${map.GameKebab}.routes`);
  }
  const collapsed =
    map.GameKebab === map.GameCamel && map.GameCamel === map.MicroserviceId;
  if (collapsed) {
    out = out.split(SRC.lower).join(map.MicroserviceId);
  } else if (out.includes(SRC.lower)) {
    out = out.split(SRC.lower).join(map.GameKebab);
  }
  return out;
}

/**
 * @param {string} srcDir
 * @param {string} destDir
 * @param {Record<string, string>} map
 */
export function copyRewrittenTree(srcDir, destDir, map) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (entry.name === ".git") continue;
    const from = path.join(srcDir, entry.name);
    const toName = rewriteTemplatePath(entry.name, map);
    const to = path.join(destDir, toName);
    if (entry.isDirectory()) {
      copyRewrittenTree(from, to, map);
      continue;
    }
    const raw = fs.readFileSync(from);
    const isBinary = /\.(png|jpg|jpeg|gif|webp|ico|woff2?|dll|exe)$/i.test(entry.name);
    if (isBinary) {
      fs.writeFileSync(to, raw);
    } else {
      fs.writeFileSync(to, rewriteTemplateContent(raw.toString("utf8"), map), "utf8");
    }
  }
}

/**
 * @param {string} dest
 * @param {Record<string, string>} map
 */
function scaffoldFromClone(dest, map) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "gc-create-game-"));
  const cloneDir = path.join(tmp, "template");
  try {
    const result = spawnSync(
      "git",
      ["clone", "--depth", "1", "--branch", TEMPLATE_REF, TEMPLATE_REPO, cloneDir],
      { encoding: "utf8" },
    );
    if (result.status !== 0) {
      const detail = (result.stderr || result.stdout || "").trim();
      throw new Error(
        `Failed to clone game template (${TEMPLATE_REPO}). Is git installed and the repo reachable?\n${detail}`,
      );
    }
    fs.rmSync(path.join(cloneDir, ".git"), { recursive: true, force: true });
    copyRewrittenTree(cloneDir, dest, map);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

function parseArgs(argv) {
  /** @type {{ name?: string, out?: string, frontPort: number, gatewayPort: number, help: boolean }} */
  const opts = { frontPort: 4202, gatewayPort: 8082, help: false };
  const positionals = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-h" || a === "--help") opts.help = true;
    else if (a === "--out") opts.out = argv[++i];
    else if (a === "--front-port") opts.frontPort = Number(argv[++i]);
    else if (a === "--gateway-port") opts.gatewayPort = Number(argv[++i]);
    else if (a.startsWith("-")) throw new Error(`Unknown flag: ${a}`);
    else positionals.push(a);
  }
  opts.name = positionals[0];
  return opts;
}

function printHelp() {
  console.log(`Usage: gc-create-game <GameName> [options]

Scaffold GamersCommunity.Games.<GameName> by cloning
${TEMPLATE_REPO} (${TEMPLATE_REF}) and renaming Template → your game.

Options:
  --out <dir>             Output parent directory (default: cwd)
  --front-port <n>        Angular port (default: 4202)
  --gateway-port <n>      DevGateway host port (default: 8082)
  -h, --help              Show help

Example:
  npx @bari77/gc-create-game StarCraft
`);
}

/**
 * @param {string[]} argv
 */
export async function main(argv) {
  const opts = parseArgs(argv);
  if (opts.help || !opts.name) {
    printHelp();
    if (!opts.name && !opts.help) process.exitCode = 1;
    return;
  }
  if (!Number.isFinite(opts.frontPort) || !Number.isFinite(opts.gatewayPort)) {
    throw new Error("Ports must be numbers.");
  }

  const names = deriveNames(opts.name);
  const map = {
    ...names,
    FrontPort: String(opts.frontPort),
    GatewayPort: String(opts.gatewayPort),
  };

  const parent = path.resolve(opts.out ?? process.cwd());
  const dest = path.join(parent, `GamersCommunity.Games.${names.GamePascal}`);
  if (fs.existsSync(dest)) {
    throw new Error(`Target already exists: ${dest}`);
  }

  console.log(`Scaffolding ${names.GamePascal} from ${TEMPLATE_REPO} (${TEMPLATE_REF})`);
  scaffoldFromClone(dest, map);

  console.log(`
Created: ${dest}

Next steps:
  1. Auth GitHub Packages (once):
       $env:NODE_AUTH_TOKEN = "ghp_xxx"   # read:packages
       $env:GITHUB_TOKEN = $env:NODE_AUTH_TOKEN
       dotnet nuget update source github -u YOUR_USER -p ghp_xxx --store-password-in-clear-text
       echo $env:GITHUB_TOKEN | docker login ghcr.io -u YOUR_USER --password-stdin

  2. UI-only:
       cd ${path.join(dest, names.GamePascal + ".Front")}
       npm install
       npm start
       → http://localhost:${opts.frontPort}

  3. Game-full:
       cd ${dest}
       .\\scripts\\up.ps1
       cd ${names.GamePascal}.Front
       npm run start:api
       → API http://localhost:${opts.gatewayPort}
`);
}
