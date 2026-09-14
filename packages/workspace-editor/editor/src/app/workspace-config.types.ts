import type { WidgetCatalog, WidgetWorkspace } from '@bari77/gc-widgets';

export type WorkspaceConfigResponse = {
    layout: WidgetWorkspace;
    catalog: WidgetCatalog;
    columns: number;
    rowHeight: number;
    layoutPath: string;
    target: string;
};

/** One layout JSON the CLI found under `config/`. */
export type WorkspaceLayoutEntry = {
    id: string;
    target: string;
    layout: string;
    label: string;
    file: string;
    isDefault: boolean;
};

export type WorkspaceLayoutsResponse = {
    entries: WorkspaceLayoutEntry[];
};
