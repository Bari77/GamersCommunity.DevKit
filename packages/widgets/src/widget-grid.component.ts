import { NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChildren,
    effect,
    input,
    output,
    signal,
    untracked,
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
import { WidgetLayout } from './layout';
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

    protected readonly options = computed<GridsterConfig>(() => {
        const editing = this.editing();
        return {
            gridType: GridType.VerticalFixed,
            compactType: CompactType.CompactUp,
            displayGrid: editing ? DisplayGrid.Always : DisplayGrid.None,
            setGridSize: true,
            fixedRowHeight: this.rowHeight(),
            margin: this.gap(),
            outerMargin: false,
            minCols: this.columns(),
            maxCols: this.columns(),
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
            itemChangeCallback: () => this.emitDraft(),
            itemResizeCallback: () => this.emitDraft(),
        };
    });

    private readonly defs = contentChildren(WidgetDefDirective, { descendants: true });

    public constructor() {
        // While editing, gridster owns the item objects and mutates them in place.
        // Re-syncing only outside edit mode is what makes Cancel restore the committed
        // layout and Save keep the persisted one, without any extra bookkeeping.
        effect(() => {
            const layout = this.layout();
            if (this.editing()) {
                return;
            }
            untracked(() => this.items.set(layout.map((item) => ({ ...item }))));
        });
    }

    protected labelFor(id: string): string {
        return this.defs().find((def) => def.id() === id)?.label() ?? '';
    }

    protected templateFor(id: string) {
        return this.defs().find((def) => def.id() === id)?.template ?? null;
    }

    private emitDraft(): void {
        this.layoutChange.emit(
            this.items().map((item) => ({
                id: item.id,
                x: item.x,
                y: item.y,
                cols: item.cols,
                rows: item.rows,
            })),
        );
    }
}
