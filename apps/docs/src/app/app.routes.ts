import { Routes } from '@angular/router';

export const docsRoutes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./pages/overview/overview.component').then((m) => m.OverviewComponent),
    },
    {
        path: 'installation',
        data: { breadcrumb: 'Installation' },
        loadComponent: () => import('./pages/installation/installation.component').then((m) => m.InstallationComponent),
    },
    {
        path: 'ui',
        data: { breadcrumb: 'Composants UI' },
        children: [
            {
                path: '',
                loadComponent: () => import('./pages/ui/ui-index.component').then((m) => m.UiIndexComponent),
            },
            {
                path: 'breadcrumb',
                data: { breadcrumb: 'Breadcrumb' },
                loadComponent: () =>
                    import('./pages/ui/breadcrumb-page.component').then((m) => m.BreadcrumbPageComponent),
            },
            {
                path: 'skeleton',
                data: { breadcrumb: 'Skeleton' },
                loadComponent: () => import('./pages/ui/skeleton-page.component').then((m) => m.SkeletonPageComponent),
            },
            {
                path: 'skeleton-text',
                data: { breadcrumb: 'Skeleton text' },
                loadComponent: () =>
                    import('./pages/ui/skeleton-text-page.component').then((m) => m.SkeletonTextPageComponent),
            },
            {
                path: 'modal',
                data: { breadcrumb: 'Modal' },
                loadComponent: () => import('./pages/ui/modal-page.component').then((m) => m.ModalPageComponent),
            },
            {
                path: 'decision-prompt',
                data: { breadcrumb: 'Decision prompt' },
                loadComponent: () =>
                    import('./pages/ui/decision-prompt-page.component').then((m) => m.DecisionPromptPageComponent),
            },
            {
                path: 'create-wall',
                data: { breadcrumb: 'Create wall' },
                loadComponent: () =>
                    import('./pages/ui/create-wall-page.component').then((m) => m.CreateWallPageComponent),
            },
        ],
    },
    {
        path: 'theme',
        data: { breadcrumb: 'Thème' },
        children: [
            {
                path: '',
                loadComponent: () => import('./pages/theme/theme-index.component').then((m) => m.ThemeIndexComponent),
            },
            {
                path: 'tokens',
                data: { breadcrumb: 'Tokens' },
                loadComponent: () => import('./pages/theme/tokens-page.component').then((m) => m.TokensPageComponent),
            },
            {
                path: 'typography',
                data: { breadcrumb: 'Typographie' },
                loadComponent: () =>
                    import('./pages/theme/typography-page.component').then((m) => m.TypographyPageComponent),
            },
            {
                path: 'motion',
                data: { breadcrumb: 'Animations' },
                loadComponent: () => import('./pages/theme/motion-page.component').then((m) => m.MotionPageComponent),
            },
            {
                path: 'utilities',
                data: { breadcrumb: 'Utilitaires' },
                loadComponent: () =>
                    import('./pages/theme/utilities-page.component').then((m) => m.UtilitiesPageComponent),
            },
        ],
    },
    {
        path: 'widgets',
        data: { breadcrumb: 'Widgets' },
        children: [
            {
                path: '',
                loadComponent: () =>
                    import('./pages/widgets/concepts-page.component').then((m) => m.ConceptsPageComponent),
            },
            {
                path: 'workspace',
                data: { breadcrumb: 'Workspace' },
                loadComponent: () =>
                    import('./pages/widgets/workspace-page.component').then((m) => m.WorkspacePageComponent),
            },
            {
                path: 'catalog',
                data: { breadcrumb: 'Catalogue' },
                loadComponent: () =>
                    import('./pages/widgets/catalog-page.component').then((m) => m.CatalogPageComponent),
            },
            {
                path: 'built-in',
                data: { breadcrumb: 'Widgets fournis' },
                loadComponent: () =>
                    import('./pages/widgets/built-in-page.component').then((m) => m.BuiltInPageComponent),
            },
            {
                path: 'persistence',
                data: { breadcrumb: 'Persistance' },
                loadComponent: () =>
                    import('./pages/widgets/persistence-page.component').then((m) => m.PersistencePageComponent),
            },
        ],
    },
    { path: '**', redirectTo: '' },
];
