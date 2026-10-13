import { WidgetSettingsField } from "./catalog";
import { WidgetSettings } from "./workspace";

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
