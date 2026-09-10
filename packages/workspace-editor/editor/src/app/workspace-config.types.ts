import type { WidgetCatalog, WidgetWorkspace } from '@bari77/gc-widgets';

export type WorkspaceConfigResponse = {
    layout: WidgetWorkspace;
    catalog: WidgetCatalog;
    columns: number;
    rowHeight: number;
    layoutPath: string;
};
