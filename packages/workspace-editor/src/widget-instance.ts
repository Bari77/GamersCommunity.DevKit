export interface WidgetInstance {
    id: string;
    type: string;
    x: number;
    y: number;
    cols: number;
    rows: number;
    settings: Record<string, unknown>;
}
