import { DOCS_VERSION, docsSection, PACKAGES } from '../docs.config';

/** Snippets that would otherwise restate a package name, a version or a path in several pages. */

const THEME_SRC = `node_modules/${PACKAGES.theme}/src`;

export const documentedPackages = [PACKAGES.ui, PACKAGES.theme, PACKAGES.widgets];

export function installSnippet(): string {
    return `npm install ${documentedPackages.join(' ')}`;
}

/** Dependency block a consumer copies, with the three packages pinned to the same version. */
export function lockstepSnippet(): string {
    const entries = [...documentedPackages]
        .sort()
        .map((name) => `    "${name}": "${DOCS_VERSION}"`)
        .join(',\n');

    return `{\n  "dependencies": {\n${entries}\n  }\n}`;
}

/** The `styles` array of `angular.json`, optionally preceded by the host application's own sheets. */
export function themeStylesSnippet(before: string[] = []): string {
    const entries = [...before, `${THEME_SRC}/global.scss`, 'src/styles.scss']
        .map((path) => `  "${path}"`)
        .join(',\n');

    return `"styles": [\n${entries}\n]`;
}

/** Targeted `@use` of individual theme partials, resolved from a SCSS file two levels deep. */
export function themePartialsSnippet(parts: string[]): string {
    return parts.map((part) => `@use "../../${THEME_SRC}/${part}";`).join('\n');
}

/** Import statement shown on a page, expanded over several lines once it pulls more than one symbol. */
export function importSnippet(pkg: string, symbols: string[], typeSymbols: string[] = []): string {
    const blocks: string[] = [];

    if (symbols.length === 1) {
        blocks.push(`import { ${symbols[0]} } from '${pkg}';`);
    } else if (symbols.length > 1) {
        blocks.push(`import {\n${symbols.map((symbol) => `    ${symbol},`).join('\n')}\n} from '${pkg}';`);
    }

    if (typeSymbols.length > 0) {
        blocks.push(`import type { ${typeSymbols.join(', ')} } from '${pkg}';`);
    }

    return blocks.join('\n\n');
}

/** Everything the pages of a section import, for the overview page of that package. */
export function sectionImportSnippet(sectionPath: string): string {
    const section = docsSection(sectionPath);
    const collect = (pick: (page: (typeof section.pages)[number]) => string[] | undefined): string[] =>
        [...new Set(section.pages.flatMap((page) => pick(page) ?? []))].sort();

    return importSnippet(
        section.package ?? '',
        collect((page) => page.symbols),
        collect((page) => page.typeSymbols),
    );
}
