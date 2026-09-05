import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TOKENS = [
  "__GamePascal__",
  "__GameKebab__",
  "__GameCamel__",
  "__MicroserviceId__",
  "__QueueName__",
  "__ComposeName__",
  "__NetworkName__",
  "__FrontPort__",
  "__GatewayPort__",
  "__CssPrefix__",
];

/**
 * @param {string} raw
 */
export function deriveNames(raw) {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error("Game name is required.");

  // Accept "StarCraft", "star-craft", "star craft"
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

export function resolveTemplateDir() {
  const candidates = [
    path.join(__dirname, "..", "template"),
    path.join(__dirname, "..", "..", "..", "templates", "game"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(path.join(c, "compose.yml"))) return c;
  }
  throw new Error("Game template not found. Reinstall @bari77/gc-create-game or run from DevKit checkout.");
}

/**
 * @param {string} content
 * @param {Record<string, string>} map
 */
export function applyTokens(content, map) {
  let out = content;
  for (const [key, value] of Object.entries(map)) {
    out = out.split(`__${key}__`).join(value);
  }
  return out;
}

/**
 * @param {string} name
 * @param {Record<string, string>} map
 */
export function applyTokensToPath(name, map) {
  return applyTokens(name, map);
}

/**
 * @param {string} srcDir
 * @param {string} destDir
 * @param {Record<string, string>} map
 */
export function copyTemplate(srcDir, destDir, map) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const from = path.join(srcDir, entry.name);
    const toName = applyTokensToPath(entry.name, map);
    const to = path.join(destDir, toName);
    if (entry.isDirectory()) {
      copyTemplate(from, to, map);
      continue;
    }
    if (entry.name === ".gitkeep") {
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.writeFileSync(to, "");
      continue;
    }
    const raw = fs.readFileSync(from);
    const isBinary = /\.(png|jpg|jpeg|gif|webp|ico|woff2?|dll|exe)$/i.test(entry.name);
    if (isBinary) {
      fs.writeFileSync(to, raw);
    } else {
      fs.writeFileSync(to, applyTokens(raw.toString("utf8"), map), "utf8");
    }
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

Scaffold GamersCommunity.Games.<GameName> (Front + Consumer + Database + compose).

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

  const template = resolveTemplateDir();
  console.log(`Scaffolding ${names.GamePascal} from ${template}`);
  copyTemplate(template, dest, map);

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

// silence unused TOKENS in typecheck-less world
void TOKENS;
