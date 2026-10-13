import { WidgetListField } from "./widget-list-field";
import { WidgetCatalogEntry } from "./widget-catalog-entry";

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

export function isListField(field: WidgetSettingsField): field is WidgetListField {
    return field.type === "list";
}
