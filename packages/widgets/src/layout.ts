export interface WidgetLayoutItem {
    id: string;
    x: number;
    y: number;
    cols: number;
    rows: number;
}

export type WidgetLayout = WidgetLayoutItem[];

export function cloneLayout(layout: WidgetLayout): WidgetLayout {
    return layout.map((item) => ({ ...item }));
}

export function layoutsEqual(left: WidgetLayout, right: WidgetLayout): boolean {
    if (left.length !== right.length) {
        return false;
    }

    const byId = new Map(right.map((item) => [item.id, item]));
    return left.every((item) => {
        const other = byId.get(item.id);
        return (
            other !== undefined &&
            other.x === item.x &&
            other.y === item.y &&
            other.cols === item.cols &&
            other.rows === item.rows
        );
    });
}

/**
 * Reconciles a persisted layout with the widgets the running build actually offers:
 * widgets dropped since the layout was saved disappear, widgets added since are
 * appended below so a release never hides a new widget from existing players.
 */
export function mergeLayout(saved: WidgetLayout, available: WidgetLayout): WidgetLayout {
    const offered = new Set(available.map((item) => item.id));
    const kept = saved.filter((item) => offered.has(item.id)).map((item) => ({ ...item }));
    const known = new Set(kept.map((item) => item.id));

    let nextRow = kept.reduce((bottom, item) => Math.max(bottom, item.y + item.rows), 0);
    for (const item of available) {
        if (known.has(item.id)) {
            continue;
        }
        kept.push({ ...item, x: 0, y: nextRow });
        nextRow += item.rows;
    }

    return kept;
}

export function serializeLayout(layout: WidgetLayout): string {
    return JSON.stringify(layout);
}

export function parseLayout(raw: string | null | undefined, fallback: WidgetLayout): WidgetLayout {
    if (!raw) {
        return cloneLayout(fallback);
    }

    try {
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return cloneLayout(fallback);
        }

        const items = parsed.filter(isLayoutItem).map((item) => ({ ...item }));
        return items.length > 0 ? mergeLayout(items, fallback) : cloneLayout(fallback);
    } catch {
        return cloneLayout(fallback);
    }
}

function isLayoutItem(value: unknown): value is WidgetLayoutItem {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const candidate = value as Partial<WidgetLayoutItem>;
    return (
        typeof candidate.id === 'string' &&
        Number.isFinite(candidate.x) &&
        Number.isFinite(candidate.y) &&
        Number.isFinite(candidate.cols) &&
        Number.isFinite(candidate.rows)
    );
}
