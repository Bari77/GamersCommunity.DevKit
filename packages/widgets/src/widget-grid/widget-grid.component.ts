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
import { MediaGalleryComponent } from '../components/media-gallery/media-gallery.component';
import { TwitchEmbedComponent } from '../components/twitch-embed/twitch-embed.component';
import { GcTooltipDirective } from '../tooltip/gc-tooltip.directive';
import { WidgetDefDirective } from '../widget-def.directive';
import { WidgetTemplateContext, WidgetTemplateDef } from '../widget-template';
import { GcGalleryItem } from '../media';
import { WidgetInstance, WidgetSettings } from '../workspace';

export const WIDGET_DRAG_HANDLE_CLASS = 'gc-widget__handle';

/** Widget types the package renders on its own, with no host template. */
export const GC_TWITCH_WIDGET = 'gc-twitch';
export const GC_LINKS_WIDGET = 'gc-links';
export const GC_PHOTOS_WIDGET = 'gc-photos';
export const GC_VIDEOS_WIDGET = 'gc-videos';

const BUILTIN_DATA_EDITABLE = new Set([GC_LINKS_WIDGET, GC_TWITCH_WIDGET, GC_PHOTOS_WIDGET, GC_VIDEOS_WIDGET]);

type GridWidget = GridsterItemConfig & {
    id: string;
    type: string;
    /** What the owner typed, empty when they left it blank. */
    title: string;
    /** Catalog name, shown only in edit mode to tell an untitled widget apart. */
    label: string;
    settings: WidgetSettings;
    instance: WidgetInstance;
};

export type WidgetPosition = Pick<WidgetInstance, 'id' | 'x' | 'y' | 'cols' | 'rows'>;

@Component({
    selector: 'gc-widget-grid',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        Gridster,
        GridsterItem,
        GcTooltipDirective,
        LinkListComponent,
        MediaGalleryComponent,
        NgTemplateOutlet,
        TwitchEmbedComponent,
    ],
    templateUrl: './widget-grid.component.html',
    styleUrl: './widget-grid.component.scss',
})
export class WidgetGridComponent {
    public readonly widgets = input.required<WidgetInstance[]>();

    public readonly catalog = input<WidgetCatalog>([]);

    /** Set by `gc-widget-workspace`, which owns the `gcWidget` templates of the host. */
    public readonly defs = input<readonly WidgetTemplateDef[] | null>(null);

    public readonly editing = input(false);

    /** Sample-data mode for the standalone layout editor. */
    public readonly preview = input(false);

    /** Shows the gear outside layout edit. The pencil is separate: only gcWidgetEditable widgets get it. */
    public readonly canConfigure = input(false);

    public readonly columns = input(12);

    public readonly rowHeight = input(90);

    public readonly gap = input(12);

    public readonly emptyLabel = input('This page has no widget yet.');

    public readonly removeLabel = input('Remove widget');

    public readonly settingsLabel = input('Widget settings');

    public readonly editDataLabel = input('Edit data');

    public readonly unknownLabel = input('This widget is not available.');

    /** Emitted on every move or resize; positions only, never settings. */
    public readonly positionsChange = output<WidgetPosition[]>();

    public readonly remove = output<string>();

    public readonly configure = output<string>();

    /** Emitted when an in-place editor writes widget-carried settings (built-in links, host templates). */
    public readonly settingsChange = output<{ id: string; settings: WidgetSettings }>();

    /** Emitted when the pencil starts in-place editing, so the workspace can close settings. */
    public readonly dataEdit = output<string>();

    protected readonly twitchType = GC_TWITCH_WIDGET;
    protected readonly linksType = GC_LINKS_WIDGET;
    protected readonly photosType = GC_PHOTOS_WIDGET;
    protected readonly videosType = GC_VIDEOS_WIDGET;
    protected readonly items = signal<GridWidget[]>([]);
    private readonly editingDataId = signal<string | null>(null);
    protected readonly twitchDraft = signal('');

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

        effect(() => {
            if (this.editing()) {
                untracked(() => this.editingDataId.set(null));
            }
        });
    }

    protected templateFor(type: string): TemplateRef<WidgetTemplateContext> | null {
        const defs: readonly WidgetTemplateDef[] = this.defs() ?? this.ownDefs();
        return defs.find((def) => def.type() === type)?.template ?? null;
    }

    protected templateContext(item: GridWidget): WidgetTemplateContext {
        return {
            $implicit: item.settings,
            instance: item.instance,
            editingData: this.isEditingData(item),
            stopDataEdit: () => this.stopDataEdit(item.id),
            updateSettings: (settings: WidgetSettings) => this.settingsChange.emit({ id: item.id, settings }),
        };
    }

    protected showsDataEdit(item: GridWidget): boolean {
        return this.canConfigure() && !this.editing() && !this.preview() && this.isInPlaceEditable(item.type);
    }

    protected isEditingData(item: GridWidget): boolean {
        return this.editingDataId() === item.id;
    }

    protected onEditData(item: GridWidget): void {
        if (!this.isInPlaceEditable(item.type)) {
            return;
        }

        if (this.isEditingData(item)) {
            this.editingDataId.set(null);
            return;
        }

        if (item.type === this.twitchType) {
            this.twitchDraft.set(this.asText(item.settings['channel']));
        }

        this.editingDataId.set(item.id);
        this.dataEdit.emit(item.id);
    }

    protected onConfigure(item: GridWidget): void {
        this.editingDataId.set(null);
        this.configure.emit(item.id);
    }

    protected asText(value: unknown): string {
        return typeof value === 'string' ? value : '';
    }

    protected inputValue(event: Event): string {
        return (event.target as HTMLInputElement).value;
    }

    protected asGallery(value: unknown): GcGalleryItem[] {
        return Array.isArray(value) ? (value as GcGalleryItem[]) : [];
    }

    protected asLinks(value: unknown): GcLink[] {
        return Array.isArray(value) ? (value as GcLink[]) : [];
    }

    protected twitchChannel(settings: WidgetSettings): string {
        const channel = this.asText(settings['channel']);
        if (channel) {
            return channel;
        }

        return this.preview() ? 'shroud' : '';
    }

    protected linkItems(settings: WidgetSettings): GcLink[] {
        const links = this.asLinks(settings['links']);
        if (links.length > 0) {
            return links;
        }

        if (!this.preview()) {
            return [];
        }

        return [
            { url: 'https://discord.gg/example', label: 'Discord' },
            { url: 'https://www.youtube.com/@gamerscommunity', label: 'YouTube' },
            { url: 'https://www.twitch.tv/shroud', label: 'Twitch' },
        ];
    }

    protected onBuiltInLinksChange(item: GridWidget, links: GcLink[]): void {
        this.settingsChange.emit({ id: item.id, settings: { ...item.settings, links } });
        this.stopDataEdit(item.id);
    }

    protected onBuiltInGalleryChange(item: GridWidget, items: GcGalleryItem[]): void {
        this.settingsChange.emit({ id: item.id, settings: { ...item.settings, items } });
        this.stopDataEdit(item.id);
    }

    protected onBuiltInTwitchSave(item: GridWidget): void {
        this.settingsChange.emit({
            id: item.id,
            settings: { ...item.settings, channel: this.twitchDraft().trim() },
        });
        this.stopDataEdit(item.id);
    }

    protected galleryItems(settings: WidgetSettings): GcGalleryItem[] {
        const items = this.asGallery(settings['items']);
        if (items.length > 0) {
            return items;
        }

        if (!this.preview()) {
            return [];
        }

        return [
            { url: 'https://picsum.photos/seed/gc-match/640/360', title: 'Match' },
            { url: 'https://picsum.photos/seed/gc-team/640/360', title: 'Team' },
        ];
    }

    protected showTwitchPreview(settings: WidgetSettings): boolean {
        return this.preview() && !this.asText(settings['channel']);
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
            instance: widget,
            x: Math.min(Math.max(0, widget.x), columns - cols),
            y: Math.max(0, widget.y),
            cols,
            rows: Math.max(1, widget.rows),
        };
    }

    private isInPlaceEditable(type: string): boolean {
        const defs: readonly WidgetTemplateDef[] = this.defs() ?? this.ownDefs();
        const def = defs.find((entry) => entry.type() === type);
        if (def) {
            return !!def.editable?.();
        }

        return BUILTIN_DATA_EDITABLE.has(type);
    }

    protected stopDataEdit(id: string): void {
        if (this.editingDataId() === id) {
            this.editingDataId.set(null);
        }
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
