import { WidgetCatalog } from "./widget-contract.js";
import { WidgetPageVisibilityOption } from "./widget-page-visibility-option.js";

export interface GameWorkspaceRegistry {
    catalog: WidgetCatalog;
    columns: number;
    rowHeight?: number;
    /** Audiences a page may be restricted to. Omitted leaves every page open to everyone. */
    pageVisibilityOptions?: WidgetPageVisibilityOption[];
    loadTemplateHost?: () => Promise<new (...args: unknown[]) => unknown>;
}
