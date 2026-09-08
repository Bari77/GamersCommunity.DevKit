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
import { normalizeLayout, WidgetLayout } from './layout';
import { WidgetDefDirective } from './widget-def.directive';

type GridWidgetItem = GridsterItemConfig & { id: string };

export const WIDGET_DRAG_HANDLE_CLASS = 'gc-widget__handle';

@Component({
    selector: 'gc-widget-grid',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [Gridster, GridsterItem, NgTemplateOutlet],
    templateUrl: './widget-grid.component.html',
    styleUrl: './widget-grid.component.scss',
})
export class WidgetGridComponent {
    /** Committed layout. Never bind the value emitted by `layoutChange` back to it. */
    public readonly layout = input.required<WidgetLayout>();

    public readonly editing = input(false);

    public readonly columns = input(12);

    public readonly rowHeight = input(90);

    public readonly gap = input(12);

    /** Draft layout, emitted on every move or resize. Persist it on save. */
    public readonly layoutChange = output<WidgetLayout>();

    protected readonly items = signal<GridWidgetItem[]>([]);

    private readonly host = inject(ElementRef<HTMLElement>);
    private readonly destroyRef = inject(DestroyRef);
    private readonly gridsterRef = viewChild(Gridster);

    protected readonly options = computed<GridsterConfig>(() => {
        const editing = this.editing();
        const columns = this.columns();
        return {
            gridType: GridType.Fit,
            compactType: CompactType.CompactUp,
            displayGrid: editing ? DisplayGrid.Always : DisplayGrid.None,
            // Parent-driven width: avoids gridster growing its inline width while dragging.
            setGridSize: false,
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
            initCallback: () => this.scheduleResize(),
            itemValidateCallback: (item) => this.validateItem(item),
            itemChangeCallback: () => this.emitDraft(),
            itemResizeCallback: () => this.emitDraft(),
        };
    });

    private readonly defs = contentChildren(WidgetDefDirective, { descendants: true });

    public constructor() {
        afterNextRender(() => {
            const observer = new ResizeObserver(() => this.scheduleResize());
            observer.observe(this.host.nativeElement);
            this.destroyRef.onDestroy(() => observer.disconnect());
            this.scheduleResize();
        });

        effect(() => {
            const layout = this.layout();
            const columns = this.columns();
            if (this.editing()) {
                return;
            }

            untracked(() => {
                this.items.set(normalizeLayout(layout, columns).map((item) => ({ ...item })));
                this.scheduleResize();
            });
        });

        effect(() => {
            if (!this.editing()) {
                return;
            }

            untracked(() => {
                const layout = this.layout();
                const columns = this.columns();
                this.items.set(normalizeLayout(layout, columns).map((item) => ({ ...item })));
                this.scheduleResize();
            });
        });
    }

    protected labelFor(id: string): string {
        return this.defs().find((def) => def.id() === id)?.label() ?? '';
    }

    protected templateFor(id: string) {
        return this.defs().find((def) => def.id() === id)?.template ?? null;
    }

    private validateItem(item: GridsterItemConfig): boolean {
        const columns = this.columns();
        const cols = item.cols ?? 1;
        const x = item.x ?? 0;
        return x >= 0 && cols >= 1 && cols <= columns && x + cols <= columns;
    }

    private scheduleResize(): void {
        queueMicrotask(() => this.gridsterRef()?.api?.resize?.());
    }

    private emitDraft(): void {
        this.layoutChange.emit(
            normalizeLayout(
                this.items().map((item) => ({
                    id: item.id,
                    x: item.x,
                    y: item.y,
                    cols: item.cols,
                    rows: item.rows,
                })),
                this.columns(),
            ),
        );
    }
}
