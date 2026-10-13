import { WidgetInstance } from "./widget-instance.js";

export interface WidgetPage {
    id: string;
    title: string;
    icon?: string;
    locked?: boolean;
    visibility?: string;
    widgets: WidgetInstance[];
}
