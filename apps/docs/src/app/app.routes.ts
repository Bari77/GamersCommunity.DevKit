import { Route, Routes } from '@angular/router';
import { DocsPage, DocsSection, docsSections, sectionHeading } from './docs.config';
import { importSnippet } from './shared/snippets';

/** Header metadata carried by every page route and read back by `gcd-page`. */
export interface DocsPageData {
    eyebrow: string;
    heading: string;
    selector: string;
    importSnippet: string;
}

function pageRoute(section: DocsSection, page: DocsPage): Route {
    const docs: DocsPageData = {
        eyebrow: page.eyebrow ?? sectionHeading(section),
        heading: page.heading ?? page.label,
        selector: page.selector ?? '',
        importSnippet: page.symbols
            ? importSnippet(section.package ?? '', page.symbols, page.typeSymbols)
            : '',
    };

    return {
        path: page.path,
        // A landing page takes its breadcrumb step from the section route above it.
        data: page.path ? { breadcrumb: page.label, docs } : { docs },
        loadComponent: page.load,
    };
}

function sectionRoutes(section: DocsSection): Routes {
    if (!section.path) {
        return section.pages.map((page) => ({
            ...pageRoute(section, page),
            ...(page.path ? {} : { pathMatch: 'full' as const }),
        }));
    }

    return [
        {
            path: section.path,
            data: { breadcrumb: section.breadcrumb ?? section.label },
            children: section.pages.map((page) => pageRoute(section, page)),
        },
    ];
}

export const docsRoutes: Routes = [
    ...docsSections.flatMap(sectionRoutes),
    { path: '**', redirectTo: '' },
];
