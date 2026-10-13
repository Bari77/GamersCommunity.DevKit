import { WidgetSettingsField } from "./widget-contract.js";
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
