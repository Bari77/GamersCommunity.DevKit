import { DocsPage } from "./docs.config";

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
