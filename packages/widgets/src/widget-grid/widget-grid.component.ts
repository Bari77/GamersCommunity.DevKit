import { NgTemplateOutlet } from '@angular/common';
import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChildren,
    DestroyRef,
    effect,
    ElementRef,
    inject,
    input,
    output,
    signal,
    TemplateRef,
    untracked,
    viewChild,
} from '@angular/core';
import {
    CompactType,
    DisplayGrid,
    Gridster,
    GridsterConfig,
    GridsterItem,
    GridsterItemConfig,
    GridType,
} from 'angular-gridster2';
import { findCatalogEntry, WidgetCatalog } from '../catalog';
import { GcLink, LinkListComponent } from '../components/link-list/link-list.component';
import { TwitchEmbedComponent } from '../components/twitch-embed/twitch-embed.component';
import { WidgetDefDirective } from '../widget-def.directive';
import { WidgetTemplateContext, WidgetTemplateDef } from '../widget-template';
import { WidgetInstance, WidgetSettings } from '../workspace';

export const WIDGET_DRAG_HANDLE_CLASS = 'gc-widget__handle';

/** Widget types the package renders on its own, with no host template. */
export const GC_TWITCH_WIDGET = 'gc-twitch';
export const GC_LINKS_WIDGET = 'gc-links';

type GridWidget = GridsterItemConfig & {
    id: string;
    type: string;
    /** What the owner typed, empty when they left it blank. */
    title: string;
    /** Catalog name, shown only in edit mode to tell an untitled widget apart. */
    label: string;
    settings: WidgetSettings;
    context: WidgetTemplateContext;
};

export type WidgetPosition = Pick<WidgetInstance, 'id' | 'x' | 'y' | 'cols' | 'rows'>;

@Component({
    selector: 'gc-widget-grid',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [Gridster, GridsterItem, LinkListComponent, NgTemplateOutlet, TwitchEmbedComponent],
    templateUrl: './widget-grid.component.html',
    styleUrl: './widget-grid.component.scss',
})
export class WidgetGridComponent {
    public readonly widgets = input.required<WidgetInstance[]>();

    public readonly catalog = input<WidgetCatalog>([]);

    /** Set by `gc-widget-workspace`, which owns the `gcWidget` templates of the host. */
    public readonly defs = input<readonly WidgetTemplateDef[] | null>(null);

    public readonly editing = input(false);

    /** Shows the gear outside edit mode, so the owner tweaks a widget without moving anything. */
    public readonly canConfigure = input(false);

    public readonly columns = input(12);

    public readonly rowHeight = input(90);

    public readonly gap = input(12);

    public readonly emptyLabel = input('This page has no widget yet.');

    public readonly removeLabel = input('Remove widget');

    public readonly settingsLabel = input('Widget settings');

    public readonly unknownLabel = input('This widget is not available.');

    /** Emitted on every move or resize; positions only, never settings. */
    public readonly positionsChange = output<WidgetPosition[]>();

    public readonly remove = output<string>();

    public readonly configure = output<string>();

    protected readonly twitchType = GC_TWITCH_WIDGET;
    protected readonly linksType = GC_LINKS_WIDGET;
    protected readonly items = signal<GridWidget[]>([]);

    private readonly host = inject(ElementRef<HTMLElement>);
    private readonly destroyRef = inject(DestroyRef);
    private readonly gridsterRef = viewChild(Gridster);
    private readonly ownDefs = contentChildren(WidgetDefDirective, { descendants: true });
    private lastEmitted = '';

    protected readonly options = computed<GridsterConfig>(() => {
        const editing = this.editing();
        const columns = this.columns();
        return {
            gridType: GridType.VerticalFixed,
            compactType: CompactType.CompactUp,
            displayGrid: editing ? DisplayGrid.Always : DisplayGrid.None,
            // Gridster computes its own height from rows; width is clamped to the viewport below.
            setGridSize: true,
            disableScrollHorizontal: true,
            fixedRowHeight: this.rowHeight(),
            margin: this.gap(),
            outerMargin: false,
            minCols: columns,
            maxCols: columns,
            maxItemCols: columns,
            minRows: 1,
            pushItems: true,
            swap: false,
            draggable: {
                enabled: editing,
                ignoreContent: true,
                dragHandleClass: WIDGET_DRAG_HANDLE_CLASS,
            },
            resizable: {
                enabled: editing,
                handles: { s: true, e: true, se: true, n: false, w: false, ne: false, sw: false, nw: false },
            },
            initCallback: () => this.syncGridDimensions(),
            gridSizeChangedCallback: () => this.syncGridDimensions(),
            itemValidateCallback: (item) => this.validateItem(item),
            itemChangeCallback: () => {
                this.syncGridDimensions();
                this.emitPositions();
            },
            itemResizeCallback: () => {
                this.syncGridDimensions();
                this.emitPositions();
            },
        };
    });

    public constructor() {
        afterNextRender(() => {
            const observer = new ResizeObserver(() => this.syncGridDimensions());
            observer.observe(this.host.nativeElement);
            this.destroyRef.onDestroy(() => observer.disconnect());
            this.syncGridDimensions();
        });

        effect(() => {
            const widgets = this.widgets();
            const catalog = this.catalog();
            const columns = this.columns();
            const key = JSON.stringify(widgets);

            untracked(() => {
                // Positions we just reported come back through the input; rebuilding on
                // them would reset gridster mid-drag.
                if (key === this.lastEmitted) {
                    return;
                }

                this.lastEmitted = key;
                this.items.set(widgets.map((widget) => this.toGridWidget(widget, catalog, columns)));
                this.syncGridDimensions();
            });
        });
    }

    protected templateFor(type: string): TemplateRef<WidgetTemplateContext> | null {
        const defs: readonly WidgetTemplateDef[] = this.defs() ?? this.ownDefs();
        return defs.find((def) => def.type() === type)?.template ?? null;
    }

    protected asText(value: unknown): string {
        return typeof value === 'string' ? value : '';
    }

    protected asLinks(value: unknown): GcLink[] {
        return Array.isArray(value) ? (value as GcLink[]) : [];
    }

    private toGridWidget(widget: WidgetInstance, catalog: WidgetCatalog, columns: number): GridWidget {
        const entry = findCatalogEntry(catalog, widget.type);
        const custom = widget.settings['title'];
        const cols = Math.min(Math.max(1, widget.cols), columns);

        return {
            id: widget.id,
            type: widget.type,
            title: typeof custom === 'string' ? custom.trim() : '',
            label: entry?.label ?? widget.type,
            settings: widget.settings,
            context: { $implicit: widget.settings, instance: widget },
            x: Math.min(Math.max(0, widget.x), columns - cols),
            y: Math.max(0, widget.y),
            cols,
            rows: Math.max(1, widget.rows),
        };
    }

    private validateItem(item: GridsterItemConfig): boolean {
        const columns = this.columns();
        const cols = item.cols ?? 1;
        const x = item.x ?? 0;
        return x >= 0 && cols >= 1 && cols <= columns && x + cols <= columns;
    }

    /** Keeps gridster visible (setGridSize) while preventing runaway inline width. */
    private syncGridDimensions(): void {
        queueMicrotask(() => {
            const viewport = this.host.nativeElement.querySelector('.gc-widget-grid__viewport');
            const gridsterEl = this.host.nativeElement.querySelector('gridster');
            const width = viewport instanceof HTMLElement ? viewport.clientWidth : this.host.nativeElement.clientWidth;

            if (gridsterEl instanceof HTMLElement && width > 0) {
                gridsterEl.style.width = `${width}px`;
                gridsterEl.style.maxWidth = '100%';
            }

            this.gridsterRef()?.api?.resize?.();
        });
    }

    private emitPositions(): void {
        const positions = this.items().map((item) => ({
            id: item.id,
            x: item.x ?? 0,
            y: item.y ?? 0,
            cols: item.cols ?? 1,
            rows: item.rows ?? 1,
        }));

        this.lastEmitted = JSON.stringify(
            this.widgets().map((widget) => {
                const next = positions.find((position) => position.id === widget.id);
                return next ? { ...widget, ...next } : widget;
            }),
        );
        this.positionsChange.emit(positions);
    }
}
