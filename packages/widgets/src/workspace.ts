export type WidgetSettings = Record<string, unknown>;

/** One placed widget. Several instances can share the same `type`. */
export interface WidgetInstance {
    id: string;
    type: string;
    x: number;
    y: number;
    cols: number;
    rows: number;
    settings: WidgetSettings;
}

export interface WidgetPage {
    id: string;
    title: string;
    icon?: string;
    /** Locked pages cannot be renamed nor removed by the owner. */
    locked?: boolean;
    widgets: WidgetInstance[];
}

export interface WidgetWorkspace {
    version: number;
    pages: WidgetPage[];
}

export const WIDGET_WORKSPACE_VERSION = 2;

export function createId(prefix: string): string {
    const random =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID().slice(0, 8)
            : Math.random().toString(36).slice(2, 10);
    return `${prefix}-${random}`;
}

export function cloneWorkspace(workspace: WidgetWorkspace): WidgetWorkspace {
    return {
        version: workspace.version,
        pages: workspace.pages.map(clonePage),
    };
}

export function clonePage(page: WidgetPage): WidgetPage {
    return { ...page, widgets: page.widgets.map((widget) => ({ ...widget, settings: { ...widget.settings } })) };
}

export function findPage(workspace: WidgetWorkspace, pageId: string): WidgetPage | undefined {
    return workspace.pages.find((page) => page.id === pageId);
}

/** Keeps widgets inside the grid after bad drags, hand-edited payloads or a column count change. */
export function normalizeWorkspace(workspace: WidgetWorkspace, columns: number): WidgetWorkspace {
    const maxCols = Math.max(1, columns);
    const seen = new Set<string>();

    return {
        version: WIDGET_WORKSPACE_VERSION,
        pages: workspace.pages.map((page) => ({
            ...page,
            widgets: page.widgets.map((widget) => {
                const cols = Math.min(Math.max(1, Math.round(widget.cols)), maxCols);
                const id = seen.has(widget.id) ? createId('w') : widget.id;
                seen.add(id);

                return {
                    ...widget,
                    id,
                    x: Math.min(Math.max(0, Math.round(widget.x)), maxCols - cols),
                    y: Math.max(0, Math.round(widget.y)),
                    cols,
                    rows: Math.max(1, Math.round(widget.rows)),
                    settings: widget.settings ?? {},
                };
            }),
        })),
    };
}

export function serializeWorkspace(workspace: WidgetWorkspace): string {
    return JSON.stringify(workspace);
}

/**
 * Rebuilds a workspace from its persisted form, falling back to the default one
 * whenever the payload is missing, malformed or empty. Widget types the running
 * build no longer offers are dropped so a removed widget cannot break a page.
 */
export function parseWorkspace(
    raw: string | null | undefined,
    fallback: WidgetWorkspace,
    columns = 12,
    knownTypes?: Iterable<string>,
): WidgetWorkspace {
    const types = knownTypes ? new Set(knownTypes) : null;

    if (!raw) {
        return normalizeWorkspace(cloneWorkspace(fallback), columns);
    }

    try {
        const parsed: unknown = JSON.parse(raw);
        const pages = Array.isArray(parsed) ? migrateFlatLayout(parsed, fallback) : readPages(parsed);
        const kept = pages
            .map((page) => ({
                ...page,
                widgets: types ? page.widgets.filter((widget) => types.has(widget.type)) : page.widgets,
            }))
            .filter((page) => page.title.length > 0);

        if (kept.length === 0) {
            return normalizeWorkspace(cloneWorkspace(fallback), columns);
        }

        return normalizeWorkspace({ version: WIDGET_WORKSPACE_VERSION, pages: kept }, columns);
    } catch {
        return normalizeWorkspace(cloneWorkspace(fallback), columns);
    }
}

export function addPage(workspace: WidgetWorkspace, title: string): WidgetWorkspace {
    const page: WidgetPage = { id: createId('page'), title, widgets: [] };
    return { ...workspace, pages: [...workspace.pages, page] };
}

export function renamePage(workspace: WidgetWorkspace, pageId: string, title: string): WidgetWorkspace {
    return mapPages(workspace, (page) => (page.id === pageId && !page.locked ? { ...page, title } : page));
}

export function removePage(workspace: WidgetWorkspace, pageId: string): WidgetWorkspace {
    const target = findPage(workspace, pageId);
    if (!target || target.locked || workspace.pages.length <= 1) {
        return workspace;
    }

    return { ...workspace, pages: workspace.pages.filter((page) => page.id !== pageId) };
}

export function movePage(workspace: WidgetWorkspace, pageId: string, offset: number): WidgetWorkspace {
    const from = workspace.pages.findIndex((page) => page.id === pageId);
    const to = from + offset;
    if (from < 0 || to < 0 || to >= workspace.pages.length) {
        return workspace;
    }

    const pages = [...workspace.pages];
    const [moved] = pages.splice(from, 1);
    pages.splice(to, 0, moved);
    return { ...workspace, pages };
}

export function addWidget(
    workspace: WidgetWorkspace,
    pageId: string,
    widget: Omit<WidgetInstance, 'id' | 'x' | 'y'>,
): WidgetWorkspace {
    return mapPages(workspace, (page) => {
        if (page.id !== pageId) {
            return page;
        }

        const bottom = page.widgets.reduce((row, item) => Math.max(row, item.y + item.rows), 0);
        return {
            ...page,
            widgets: [...page.widgets, { ...widget, id: createId('w'), x: 0, y: bottom }],
        };
    });
}

export function removeWidget(workspace: WidgetWorkspace, pageId: string, widgetId: string): WidgetWorkspace {
    return mapPages(workspace, (page) =>
        page.id === pageId ? { ...page, widgets: page.widgets.filter((item) => item.id !== widgetId) } : page,
    );
}

export function updateWidgetSettings(
    workspace: WidgetWorkspace,
    pageId: string,
    widgetId: string,
    settings: WidgetSettings,
): WidgetWorkspace {
    return mapPages(workspace, (page) =>
        page.id === pageId
            ? {
                  ...page,
                  widgets: page.widgets.map((item) => (item.id === widgetId ? { ...item, settings } : item)),
              }
            : page,
    );
}

/** Applies the positions gridster reports without touching type or settings. */
export function applyPositions(
    workspace: WidgetWorkspace,
    pageId: string,
    positions: Pick<WidgetInstance, 'id' | 'x' | 'y' | 'cols' | 'rows'>[],
): WidgetWorkspace {
    const byId = new Map(positions.map((item) => [item.id, item]));

    return mapPages(workspace, (page) =>
        page.id === pageId
            ? {
                  ...page,
                  widgets: page.widgets.map((item) => {
                      const next = byId.get(item.id);
                      return next ? { ...item, x: next.x, y: next.y, cols: next.cols, rows: next.rows } : item;
                  }),
              }
            : page,
    );
}

export function countWidgetsOfType(workspace: WidgetWorkspace, type: string): number {
    return workspace.pages.reduce(
        (total, page) => total + page.widgets.filter((widget) => widget.type === type).length,
        0,
    );
}

function mapPages(workspace: WidgetWorkspace, project: (page: WidgetPage) => WidgetPage): WidgetWorkspace {
    return { ...workspace, pages: workspace.pages.map(project) };
}

function readPages(parsed: unknown): WidgetPage[] {
    if (typeof parsed !== 'object' || parsed === null) {
        return [];
    }

    const pages = (parsed as { pages?: unknown }).pages;
    if (!Array.isArray(pages)) {
        return [];
    }

    return pages.filter(isRecord).map((page) => ({
        id: typeof page['id'] === 'string' ? page['id'] : createId('page'),
        title: typeof page['title'] === 'string' ? page['title'] : '',
        icon: typeof page['icon'] === 'string' ? page['icon'] : undefined,
        locked: page['locked'] === true,
        widgets: Array.isArray(page['widgets']) ? page['widgets'].filter(isRecord).map(readWidget) : [],
    }));
}

/** Version 1 stored a single flat array whose `id` was the widget type. */
function migrateFlatLayout(parsed: unknown[], fallback: WidgetWorkspace): WidgetPage[] {
    const widgets = parsed.filter(isRecord).map((item) => ({
        ...readWidget(item),
        type: typeof item['id'] === 'string' ? item['id'] : '',
        id: createId('w'),
    }));

    const [first, ...rest] = fallback.pages;
    if (!first) {
        return [{ id: createId('page'), title: 'Home', widgets }];
    }

    return [{ ...clonePage(first), widgets }, ...rest.map(clonePage)];
}

function readWidget(item: Record<string, unknown>): WidgetInstance {
    return {
        id: typeof item['id'] === 'string' ? item['id'] : createId('w'),
        type: typeof item['type'] === 'string' ? item['type'] : '',
        x: toNumber(item['x'], 0),
        y: toNumber(item['y'], 0),
        cols: toNumber(item['cols'], 4),
        rows: toNumber(item['rows'], 3),
        settings: isRecord(item['settings']) ? { ...item['settings'] } : {},
    };
}

function toNumber(value: unknown, fallback: number): number {
    return Number.isFinite(value) ? (value as number) : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
