import { WidgetCatalog, WidgetWorkspace } from "@bari77/gc-widgets";

export interface WorkspaceConfigResponse {
    layout: WidgetWorkspace;
    catalog: WidgetCatalog;
    columns: number;
    rowHeight: number;
    layoutPath: string;
    target: string;
}
