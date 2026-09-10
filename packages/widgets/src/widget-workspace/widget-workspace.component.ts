import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, contentChildren, effect, input, model, output, signal, TemplateRef, untracked } from '@angular/core';
import { findCatalogEntry, WidgetCatalog, WidgetCatalogEntry } from '../catalog';
import { WidgetDefDirective, WidgetTemplateContext } from '../widget-def.directive';
import { WidgetEditBarComponent } from '../widget-edit-bar/widget-edit-bar.component';
import { WidgetGridComponent, WidgetPosition } from '../widget-grid/widget-grid.component';
import { WidgetNavComponent, WidgetPageMove, WidgetPageRename } from '../widget-nav/widget-nav.component';
import { WidgetPickerComponent } from '../widget-picker/widget-picker.component';
import { WidgetSettingsDefDirective } from '../widget-settings-def.directive';
import { WidgetSettingsComponent } from '../widget-settings/widget-settings.component';
import {
    addPage,
    addWidget,
    applyPositions,
    cloneWorkspace,
    findPage,
    movePage,
    normalizeWorkspace,
    removePage,
    removeWidget,
    renamePage,
    serializeWorkspace,
    updateWidgetSettings,
    WidgetInstance,
    WidgetPage,
    WidgetSettings,
    WidgetWorkspace,
} from '../workspace';

/**
 * Whole customisable profile: page rail, widget grid, catalog picker and settings.
 * Edits stay in a local draft until `save` is emitted, so a failed persist keeps
 * the owner in edit mode with their changes intact.
 */
@Component({
    selector: 'gc-widget-workspace',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgTemplateOutlet,
        WidgetEditBarComponent,
        WidgetGridComponent,
        WidgetNavComponent,
        WidgetPickerComponent,
        WidgetSettingsComponent,
    ],
    templateUrl: './widget-workspace.component.html',
    styleUrl: './widget-workspace.component.scss',
})
export class WidgetWorkspaceComponent {
    /** Committed workspace. Never bind the value emitted by `save` back before it persists. */
    public readonly workspace = input.required<WidgetWorkspace>();

    public readonly catalog = input.required<WidgetCatalog>();

    public readonly canEdit = input(false);

    public readonly saving = input(false);

    public readonly columns = input(12);

    public readonly rowHeight = input(90);

    public readonly gap = input(12);

    public readonly navLabel = input('Profile pages');

    public readonly addPageLabel = input('New page');

    public readonly removePageLabel = input('Delete page');

    public readonly moveUpLabel = input('Move up');

    public readonly moveDownLabel = input('Move down');

    public readonly addWidgetLabel = input('Add a widget');

    public readonly editLabel = input('Edit');

    public readonly cancelLabel = input('Cancel');

    public readonly saveLabel = input('Save');

    public readonly emptyPageLabel = input('This page has no widget yet.');

    public readonly hintLabel = input('Drag a widget by its header to move it, or its bottom-right corner to resize it.');

    public readonly newPageTitle = input('New page');

    public readonly settingsLabel = input('Widget settings');

    public readonly removeWidgetLabel = input('Remove widget');

    public readonly widgetTitleLabel = input('Widget title');

    public readonly widgetTitleHint = input('Leave empty to drop the header.');

    public readonly doneLabel = input('Done');

    public readonly editing = model(false);

    public readonly save = output<WidgetWorkspace>();

    protected readonly pickerOpen = signal(false);
    protected readonly configuringId = signal<string | null>(null);
    protected readonly activePageId = signal<string | null>(null);
    protected readonly defs = contentChildren(WidgetDefDirective, { descendants: true });
    protected readonly settingsDefs = contentChildren(WidgetSettingsDefDirective, { descendants: true });

    private readonly draft = signal<WidgetWorkspace | null>(null);

    private previousEditing = false;
    private previousCommitted: WidgetWorkspace | null = null;

    protected readonly view = computed(() => this.draft() ?? this.workspace());

    /** Undefined only while a workspace holds no page at all. */
    protected readonly activePage = computed<WidgetPage | undefined>(() => {
        const pages = this.view().pages;
        const id = this.activePageId();
        return pages.find((page) => page.id === id) ?? pages[0];
    });

    protected readonly usedTypes = computed(() =>
        this.view().pages.flatMap((page) => page.widgets.map((widget) => widget.type)),
    );

    protected readonly configuring = computed<{ widget: WidgetInstance; entry: WidgetCatalogEntry } | null>(() => {
        const id = this.configuringId();
        const widget = this.activePage()?.widgets.find((item) => item.id === id);
        const entry = widget ? findCatalogEntry(this.catalog(), widget.type) : undefined;
        return widget && entry ? { widget, entry } : null;
    });

    public constructor() {
        effect(() => {
            const editing = this.editing();
            const committed = this.workspace();

            untracked(() => {
                const enteringEdit = editing && !this.previousEditing;
                const rebased = committed !== this.previousCommitted;
                this.previousEditing = editing;
                this.previousCommitted = committed;

                this.pickerOpen.set(false);
                this.configuringId.set(null);

                // Switching to edit mode adopts what the gear already changed. Branching from
                // the committed workspace here is what used to drop those changes silently.
                if (enteringEdit && !rebased) {
                    this.draft.set(this.draft() ?? cloneWorkspace(committed));
                    return;
                }

                this.draft.set(editing ? cloneWorkspace(committed) : null);
            });
        });

        effect(() => {
            const pages = this.view().pages;
            untracked(() => {
                if (!pages.some((page) => page.id === this.activePageId())) {
                    this.activePageId.set(pages[0]?.id ?? null);
                }
            });
        });
    }

    protected onPositions(positions: WidgetPosition[]): void {
        // Dragging is disabled outside edit mode, so anything reported there is gridster
        // reflowing on its own and must not end up in a quick-config draft.
        if (this.editing()) {
            this.mutate((current, pageId) => applyPositions(current, pageId, positions));
        }
    }

    protected onSelectPage(id: string): void {
        // Leaving the page hides the settings panel, so commit before it disappears.
        this.onCloseSettings();
        this.activePageId.set(id);
    }

    protected onAddPage(): void {
        const current = this.draft();
        if (!current) {
            return;
        }

        const next = addPage(current, this.newPageTitle());
        this.draft.set(next);
        this.activePageId.set(next.pages[next.pages.length - 1].id);
    }

    protected onRenamePage(event: WidgetPageRename): void {
        this.mutate((current) => renamePage(current, event.id, event.title));
    }

    protected onRemovePage(id: string): void {
        this.mutate((current) => removePage(current, id));
    }

    protected onMovePage(event: WidgetPageMove): void {
        this.mutate((current) => movePage(current, event.id, event.offset));
    }

    protected onPickWidget(type: string): void {
        const entry = findCatalogEntry(this.catalog(), type);
        if (!entry) {
            return;
        }

        this.mutate((current, pageId) =>
            addWidget(current, pageId, {
                type,
                cols: entry.cols,
                rows: entry.rows,
                settings: { ...entry.defaultSettings },
            }),
        );
        this.pickerOpen.set(false);
    }

    protected onRemoveWidget(widgetId: string): void {
        if (this.configuringId() === widgetId) {
            this.configuringId.set(null);
        }
        this.mutate((current, pageId) => removeWidget(current, pageId, widgetId));
    }

    protected settingsTemplateFor(type: string): TemplateRef<WidgetTemplateContext> | null {
        return this.settingsDefs().find((def) => def.type() === type)?.template ?? null;
    }

    /** Outside edit mode the gear works on its own draft, committed when the panel closes. */
    protected onConfigure(widgetId: string): void {
        if (!this.draft()) {
            this.draft.set(cloneWorkspace(this.workspace()));
        }
        this.configuringId.set(widgetId);
    }

    /**
     * Persists what the gear changed outside edit mode. Whether there is something to save is
     * read off the draft itself: a flag raised on edit would not survive the committed
     * workspace being recreated, which silently dropped the changes.
     */
    protected onCloseSettings(): void {
        this.configuringId.set(null);
        const current = this.draft();
        if (this.editing() || !current) {
            return;
        }

        const next = normalizeWorkspace(current, this.columns());
        if (serializeWorkspace(next) === serializeWorkspace(this.workspace())) {
            this.draft.set(null);
            return;
        }

        this.save.emit(next);
    }

    protected onSettingsChange(settings: WidgetSettings): void {
        const widgetId = this.configuringId();
        if (!widgetId) {
            return;
        }

        this.mutate((current, pageId) => updateWidgetSettings(current, pageId, widgetId, settings));
    }

    protected onCancel(): void {
        this.draft.set(null);
    }

    protected onSave(): void {
        const current = this.draft();
        if (current) {
            this.save.emit(normalizeWorkspace(current, this.columns()));
        }
    }

    private mutate(project: (current: WidgetWorkspace, pageId: string) => WidgetWorkspace): void {
        const current = this.draft();
        const pageId = this.activePage()?.id;
        if (!current || !pageId || !findPage(current, pageId)) {
            return;
        }

        this.draft.set(project(current, pageId));
    }
}
