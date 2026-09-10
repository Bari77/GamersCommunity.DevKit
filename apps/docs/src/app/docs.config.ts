import { Type } from '@angular/core';
import themePkg from '../../../../packages/theme/package.json';
import uiPkg from '../../../../packages/ui/package.json';
import widgetsPkg from '../../../../packages/widgets/package.json';

/**
 * Single source of truth for the site. Everything else — routes, sidebar, breadcrumb labels, page
 * headers and landing-page cards — is derived from the tree below, so a new page means one entry
 * here plus the component that holds its prose.
 */

/** The documented packages advance in lockstep, so any of them carries the version of the set. */
export const DOCS_VERSION = uiPkg.version;

export const REPOSITORY_URL = uiPkg.repository.url.replace(/\.git$/, '');

export const SITE_NAME = 'DevKit';

export const PACKAGES = {
    ui: uiPkg.name,
    theme: themePkg.name,
    widgets: widgetsPkg.name,
} as const;

/** Range the consuming application has to satisfy, straight from the published peer dependencies. */
export const ANGULAR_RANGE = uiPkg.peerDependencies['@angular/core'];

export const GRIDSTER_RANGE = widgetsPkg.peerDependencies['angular-gridster2'];

export interface DocsPage {
    /** Route segment, relative to the section. Empty for the section landing page. */
    path: string;

    /** Sidebar entry, and breadcrumb step for every page but a landing one. */
    label: string;

    /** Page title, when it should read differently from the sidebar entry. */
    heading?: string;

    /** Overrides the section name printed above the title. */
    eyebrow?: string;

    /** Element name of the documented component, shown next to the title and used as card title. */
    selector?: string;

    /** One-liner on the card that leads to this page. A page without one gets no card. */
    summary?: string;

    /** Symbols the page documents, used to build the import statement shown under its title. */
    symbols?: string[];

    /** Type-only symbols, appended to that import statement on their own line. */
    typeSymbols?: string[];

    load: () => Promise<Type<unknown>>;
}

export interface DocsSection {
    /** Route segment shared by the pages below. Empty for the top-level pages. */
    path: string;

    /** Package documented here. Doubles as sidebar heading, page eyebrow and import target. */
    package?: string;

    /** Sidebar heading, for a section that documents no single package. */
    label?: string;

    /** Breadcrumb step for the section segment itself. */
    breadcrumb?: string;

    /** One-liner on the home page card that leads into this section. */
    summary?: string;

    pages: DocsPage[];
}

/** Sidebar heading of a section, and the default eyebrow of its pages. */
export function sectionHeading(section: DocsSection): string {
    return section.package ?? section.label ?? '';
}

export const docsSections: DocsSection[] = [
    {
        path: '',
        label: 'Démarrer',
        pages: [
            {
                path: '',
                label: 'Présentation',
                heading: SITE_NAME,
                eyebrow: 'GamersCommunity',
                load: () => import('./pages/overview/overview.component').then((m) => m.OverviewComponent),
            },
            {
                path: 'installation',
                label: 'Installation',
                load: () =>
                    import('./pages/installation/installation.component').then((m) => m.InstallationComponent),
            },
        ],
    },
    {
        path: 'ui',
        package: PACKAGES.ui,
        breadcrumb: 'Composants UI',
        summary:
            "Six primitives sans logique métier : fil d'Ariane, squelettes de chargement, modale, invite de décision et mur d'incitation.",
        pages: [
            {
                path: '',
                label: "Vue d'ensemble",
                heading: 'Composants UI',
                load: () => import('./pages/ui/ui-index.component').then((m) => m.UiIndexComponent),
            },
            {
                path: 'breadcrumb',
                label: 'Breadcrumb',
                selector: 'gc-breadcrumb',
                summary: "Fil d'Ariane construit à partir de l'arbre de routes actif.",
                symbols: ['BreadcrumbComponent'],
                typeSymbols: ['Breadcrumb'],
                load: () =>
                    import('./pages/ui/breadcrumb-page.component').then((m) => m.BreadcrumbPageComponent),
            },
            {
                path: 'skeleton',
                label: 'Skeleton',
                selector: 'gc-skeleton',
                summary: "Bloc gris scintillant tenant la place d'un contenu en cours de chargement.",
                symbols: ['SkeletonComponent'],
                load: () => import('./pages/ui/skeleton-page.component').then((m) => m.SkeletonPageComponent),
            },
            {
                path: 'skeleton-text',
                label: 'Skeleton text',
                selector: 'gc-skeleton-text',
                summary: 'Empilement de lignes de squelette imitant un paragraphe.',
                symbols: ['SkeletonTextComponent'],
                load: () =>
                    import('./pages/ui/skeleton-text-page.component').then((m) => m.SkeletonTextPageComponent),
            },
            {
                path: 'modal',
                label: 'Modal',
                selector: 'gc-modal',
                summary: 'Panneau centré en surimpression accueillant un contenu projeté.',
                symbols: ['ModalComponent'],
                load: () => import('./pages/ui/modal-page.component').then((m) => m.ModalPageComponent),
            },
            {
                path: 'decision-prompt',
                label: 'Decision prompt',
                selector: 'gc-decision-prompt',
                summary: 'Modale de choix entre un engagement principal et la poursuite sans lui.',
                symbols: ['DecisionPromptComponent'],
                load: () =>
                    import('./pages/ui/decision-prompt-page.component').then((m) => m.DecisionPromptPageComponent),
            },
            {
                path: 'create-wall',
                label: 'Create wall',
                selector: 'gc-create-wall',
                summary: "Invitation à franchir l'étape qui débloque une interaction encore inaccessible.",
                symbols: ['CreateWallComponent'],
                load: () =>
                    import('./pages/ui/create-wall-page.component').then((m) => m.CreateWallPageComponent),
            },
        ],
    },
    {
        path: 'theme',
        package: PACKAGES.theme,
        breadcrumb: 'Thème',
        summary: 'Design tokens, typographie, animations et utilitaires en SCSS pur, sans aucune dépendance.',
        pages: [
            {
                path: '',
                label: "Vue d'ensemble",
                heading: 'Thème',
                load: () => import('./pages/theme/theme-index.component').then((m) => m.ThemeIndexComponent),
            },
            {
                path: 'tokens',
                label: 'Tokens',
                summary: "Les variables CSS de couleur, de police et d'espacement, redéfinissables par jeu.",
                load: () => import('./pages/theme/tokens-page.component').then((m) => m.TokensPageComponent),
            },
            {
                path: 'typography',
                label: 'Typographie',
                summary: 'La base html/body et le traitement des titres.',
                load: () =>
                    import('./pages/theme/typography-page.component').then((m) => m.TypographyPageComponent),
            },
            {
                path: 'motion',
                label: 'Animations',
                summary: "Les keyframes d'entrée et de pulsation, et les classes qui les appliquent.",
                load: () => import('./pages/theme/motion-page.component').then((m) => m.MotionPageComponent),
            },
            {
                path: 'utilities',
                label: 'Utilitaires',
                summary: "Le petit lot de classes d'espacement et d'alignement.",
                load: () =>
                    import('./pages/theme/utilities-page.component').then((m) => m.UtilitiesPageComponent),
            },
        ],
    },
    {
        path: 'widgets',
        package: PACKAGES.widgets,
        breadcrumb: 'Widgets',
        summary:
            'Le tableau de bord personnalisable : pages, grille redimensionnable, catalogue et panneau de réglages.',
        pages: [
            {
                path: '',
                label: 'Concepts',
                load: () => import('./pages/widgets/concepts-page.component').then((m) => m.ConceptsPageComponent),
            },
            {
                path: 'workspace',
                label: 'Workspace',
                selector: 'gc-widget-workspace',
                summary: 'Le composant assemblé, sa démonstration et ses entrées.',
                symbols: ['WidgetDefDirective', 'WidgetWorkspaceComponent'],
                typeSymbols: ['WidgetCatalog', 'WidgetWorkspace'],
                load: () =>
                    import('./pages/widgets/workspace-page.component').then((m) => m.WorkspacePageComponent),
            },
            {
                path: 'catalog',
                label: 'Catalogue',
                summary: 'Déclarer les types disponibles et leurs champs de réglage.',
                load: () => import('./pages/widgets/catalog-page.component').then((m) => m.CatalogPageComponent),
            },
            {
                path: 'built-in',
                label: 'Widgets fournis',
                summary: 'Liste de liens, galerie et lecteur Twitch prêts à brancher.',
                symbols: ['LinkListComponent', 'MediaGalleryComponent', 'TwitchEmbedComponent'],
                typeSymbols: ['GcGalleryItem', 'GcLink'],
                load: () => import('./pages/widgets/built-in-page.component').then((m) => m.BuiltInPageComponent),
            },
            {
                path: 'persistence',
                label: 'Persistance',
                summary: 'Lire, écrire et réparer un workspace stocké.',
                load: () =>
                    import('./pages/widgets/persistence-page.component').then((m) => m.PersistencePageComponent),
            },
        ],
    },
];

/** Absolute route of a page, so links never have to restate the section segment. */
export function docsPath(section: DocsSection, page: DocsPage): string {
    return `/${[section.path, page.path].filter(Boolean).join('/')}`;
}

export interface DocsCard {
    link: string;
    title: string;
    description: string;
}

export function docsSection(sectionPath: string): DocsSection {
    const section = docsSections.find((candidate) => candidate.path === sectionPath);

    if (!section) {
        throw new Error(`Unknown docs section: ${sectionPath}`);
    }

    return section;
}

/** Cards for the pages of a section, skipping its landing page and anything without a summary. */
export function pageCards(sectionPath: string): DocsCard[] {
    const section = docsSection(sectionPath);

    return section.pages.flatMap((page) =>
        page.path && page.summary
            ? [{ link: docsPath(section, page), title: page.selector ?? page.label, description: page.summary }]
            : [],
    );
}

/** Cards for the sections that document a package, used by the home page. */
export const packageCards: DocsCard[] = docsSections.flatMap((section) =>
    section.summary
        ? [{ link: `/${section.path}`, title: sectionHeading(section), description: section.summary }]
        : [],
);

export interface DocsNavGroup {
    label: string;
    links: { path: string; label: string }[];
}

export const docsNav: DocsNavGroup[] = docsSections.map((section) => ({
    label: sectionHeading(section),
    links: section.pages.map((page) => ({ path: docsPath(section, page), label: page.label })),
}));
