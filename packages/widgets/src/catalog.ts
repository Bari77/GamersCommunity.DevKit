import { WidgetSettings } from './workspace';

export type WidgetFieldType = 'text' | 'url' | 'textarea' | 'number';

export interface WidgetTextField {
    key: string;
    label: string;
    type: WidgetFieldType;
    placeholder?: string;
    hint?: string;
}

/** Repeats `itemFields` so a widget can hold an arbitrary number of entries. */
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
    /** Refuses a second instance anywhere in the workspace. */
    unique?: boolean;
    fields?: WidgetSettingsField[];
    defaultSettings?: WidgetSettings;
}

export type WidgetCatalog = WidgetCatalogEntry[];

export function findCatalogEntry(catalog: WidgetCatalog, type: string): WidgetCatalogEntry | undefined {
    return catalog.find((entry) => entry.type === type);
}

export function isListField(field: WidgetSettingsField): field is WidgetListField {
    return field.type === 'list';
}
