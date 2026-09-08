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
    template: `
        <gridster [options]="options()">
            @for (item of items(); track item.id) {
                <gridster-item [item]="item">
                    <section class="gc-widget" [class.gc-widget--editing]="editing()">
                        @if (editing() || labelFor(item.id)) {
                            <header class="gc-widget__handle">
                                <span class="gc-widget__title">{{ labelFor(item.id) }}</span>
                                @if (editing()) {
                                    <span class="gc-widget__grip" aria-hidden="true"></span>
                                }
                            </header>
                        }
                        <div class="gc-widget__body">
                            <ng-container [ngTemplateOutlet]="templateFor(item.id)" />
                        </div>
                    </section>
                </gridster-item>
            }
        </gridster>
    `,
    styles: [
        `
            :host {
                display: block;
            }

            gridster {
                background: transparent;
            }

            .gc-widget {
                display: flex;
                flex-direction: column;
                height: 100%;
                overflow: hidden;
                border: 1px solid var(--gc-widget-border, rgba(255, 255, 255, 0.08));
                border-radius: var(--gc-widget-radius, 0.75rem);
                background: var(--gc-widget-background, rgba(255, 255, 255, 0.03));
            }

            .gc-widget__handle {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 0.5rem;
                padding: 0.6rem 0.85rem;
                border-bottom: 1px solid var(--gc-widget-border, rgba(255, 255, 255, 0.08));
            }

            .gc-widget__title {
                font-size: 0.75rem;
                font-weight: 600;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                opacity: 0.7;
            }

            .gc-widget__grip {
                width: 1.25rem;
                height: 0.5rem;
                background-image: radial-gradient(currentColor 1px, transparent 1px);
                background-size: 4px 4px;
                opacity: 0.5;
            }

            .gc-widget__body {
                flex: 1;
                min-height: 0;
                overflow: auto;
                padding: 0.85rem;
            }

            .gc-widget--editing {
                border-style: dashed;
                border-color: var(--gc-widget-editing-border, rgba(120, 170, 255, 0.55));
            }

            .gc-widget--editing .gc-widget__handle {
                cursor: move;
            }

            .gc-widget--editing .gc-widget__body {
                pointer-events: none;
                user-select: none;
                opacity: 0.75;
            }
        `,
    ],
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
