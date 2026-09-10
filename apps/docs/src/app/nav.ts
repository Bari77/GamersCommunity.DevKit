export interface DocsLink {
    path: string;
    label: string;
}

export interface DocsGroup {
    label: string;
    links: DocsLink[];
}

export const DOCS_VERSION = '0.8.2';

export const REPOSITORY_URL = 'https://github.com/Bari77/GamersCommunity.DevKit';

export const docsNav: DocsGroup[] = [
    {
        label: 'Démarrer',
        links: [
            { path: '/', label: 'Présentation' },
            { path: '/installation', label: 'Installation' },
        ],
    },
    {
        label: '@bari77/gc-ui',
        links: [
            { path: '/ui', label: "Vue d'ensemble" },
            { path: '/ui/breadcrumb', label: 'Breadcrumb' },
            { path: '/ui/skeleton', label: 'Skeleton' },
            { path: '/ui/skeleton-text', label: 'Skeleton text' },
            { path: '/ui/modal', label: 'Modal' },
            { path: '/ui/decision-prompt', label: 'Decision prompt' },
            { path: '/ui/create-wall', label: 'Create wall' },
        ],
    },
    {
        label: '@bari77/gc-theme',
        links: [
            { path: '/theme', label: "Vue d'ensemble" },
            { path: '/theme/tokens', label: 'Tokens' },
            { path: '/theme/typography', label: 'Typographie' },
            { path: '/theme/motion', label: 'Animations' },
            { path: '/theme/utilities', label: 'Utilitaires' },
        ],
    },
    {
        label: '@bari77/gc-widgets',
        links: [
            { path: '/widgets', label: 'Concepts' },
            { path: '/widgets/workspace', label: 'Workspace' },
            { path: '/widgets/catalog', label: 'Catalogue' },
            { path: '/widgets/built-in', label: 'Widgets fournis' },
            { path: '/widgets/persistence', label: 'Persistance' },
        ],
    },
];
