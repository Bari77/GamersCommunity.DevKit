#!/usr/bin/env node
/**
 * Body of a GitHub Release, built from the CHANGELOG.json the documentation site also renders, so a
 * version cannot describe itself one way in the release and another way in the docs.
 *
 * Usage: node .github/scripts/release-notes.mjs 0.8.28
 */
import { readFileSync } from 'node:fs';

const PACKAGES = [
    'gc-sdk',
    'gc-msw',
    'gc-playground',
    'gc-ui',
    'gc-widgets',
    'gc-theme',
    'gc-workspace-editor',
    'gc-create-game',
];

const version = process.argv[2];

if (!version) {
    console.error('usage: release-notes.mjs <version>');
    process.exit(1);
}

const changelog = JSON.parse(readFileSync(new URL('../../CHANGELOG.json', import.meta.url), 'utf8'));
const release = changelog.find((entry) => entry.version === version);

const lines = release
    ? [release.summary, '', ...release.changes.map((c) => `- **${c.package}** · ${c.kind} — ${c.text}`)]
    : [`> No CHANGELOG.json entry for ${version}.`];

lines.push(
    '',
    '## Packages npm (GitHub Packages)',
    ...PACKAGES.map((name) => `- \`@bari77/${name}@${version}\``),
    '',
    '## Image',
    `- \`ghcr.io/bari77/gc-devgateway:${version}\``,
    '',
    '## Scaffold a game',
    '```bash',
    'npx @bari77/gc-create-game YourGame',
    '```',
);

console.log(lines.join('\n'));
