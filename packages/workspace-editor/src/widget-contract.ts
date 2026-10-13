import { WidgetListField } from "./widget-list-field.js";
import { WidgetCatalogEntry } from "./widget-catalog-entry.js";

/** Local copy of the gc-widgets catalog contract — kept in sync manually with packages/widgets/src/catalog.ts */

export type WidgetFieldType = "text" | "url" | "textarea" | "number";

export interface WidgetTextField {
    key: string;
    label: string;
    type: WidgetFieldType;
    placeholder?: string;
    hint?: string;
}

export type WidgetSettingsField = WidgetTextField | WidgetListField;
export type WidgetCatalog = WidgetCatalogEntry[];

export function findCatalogEntry(catalog: WidgetCatalog, type: string): WidgetCatalogEntry | undefined {
    return catalog.find((entry) => entry.type === type);
}
