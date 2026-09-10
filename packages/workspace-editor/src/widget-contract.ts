/** Local copy of the gc-widgets catalog contract — kept in sync manually with packages/widgets/src/catalog.ts */

export type WidgetFieldType = 'text' | 'url' | 'textarea' | 'number';

export interface WidgetTextField {
    key: string;
    label: string;
    type: WidgetFieldType;
    placeholder?: string;
    hint?: string;
}

export interface WidgetListField {
    key: string;
    label: string;
    type: 'list';
    addLabel?: string;
    itemFields: WidgetTextField[];
}

export type WidgetSettingsField = WidgetTextField | WidgetListField;

export interface WidgetCatalogEntry {
    type: string;
    label: string;
    description?: string;
    icon?: string;
    cols: number;
    rows: number;
    unique?: boolean;
    fields?: WidgetSettingsField[];
}

export type WidgetCatalog = WidgetCatalogEntry[];

export interface WidgetInstance {
    id: string;
    type: string;
    x: number;
    y: number;
    cols: number;
    rows: number;
    settings: Record<string, unknown>;
}

export interface WidgetPage {
    id: string;
    title: string;
    icon?: string;
    locked?: boolean;
    widgets: WidgetInstance[];
}

export interface WidgetWorkspace {
    version: number;
    pages: WidgetPage[];
}

export function findCatalogEntry(catalog: WidgetCatalog, type: string): WidgetCatalogEntry | undefined {
    return catalog.find((entry) => entry.type === type);
}
