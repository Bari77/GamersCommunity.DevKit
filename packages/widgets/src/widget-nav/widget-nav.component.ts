import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { WidgetPage } from '../workspace';

export interface WidgetPageRename {
    id: string;
    title: string;
}

export interface WidgetPageMove {
    id: string;
    offset: number;
}

/** One audience the host lets the owner pick from. The first option is the open one. */
export interface WidgetPageVisibilityOption {
    value: string;
    label: string;
}

export interface WidgetPageVisibilityChange {
    id: string;
    visibility: string;
}

/** Left rail listing the workspace pages, editable in place by the owner. */
@Component({
    selector: 'gc-widget-nav',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './widget-nav.component.html',
    styleUrl: './widget-nav.component.scss',
})
export class WidgetNavComponent {
    public readonly pages = input.required<WidgetPage[]>();

    public readonly activeId = input<string | null>(null);

    public readonly editing = input(false);

    public readonly ariaLabel = input('Profile pages');

    public readonly addLabel = input('New page');

    public readonly removeLabel = input('Delete page');

    public readonly moveUpLabel = input('Move up');

    public readonly moveDownLabel = input('Move down');

    /** Left empty to drop the audience picker entirely. */
    public readonly visibilityOptions = input<WidgetPageVisibilityOption[]>([]);

    public readonly visibilityLabel = input('Who can see this page');

    public readonly select = output<string>();

    public readonly add = output<void>();

    public readonly remove = output<string>();

    public readonly rename = output<WidgetPageRename>();

    public readonly move = output<WidgetPageMove>();

    public readonly visibility = output<WidgetPageVisibilityChange>();

    protected onRename(id: string, event: Event): void {
        const title = (event.target as HTMLInputElement).value.trim();
        if (title) {
            this.rename.emit({ id, title });
        }
    }

    protected onVisibility(id: string, event: Event): void {
        this.visibility.emit({ id, visibility: (event.target as HTMLSelectElement).value });
    }

    protected currentVisibility(page: WidgetPage): string {
        return page.visibility ?? this.visibilityOptions()[0]?.value ?? '';
    }

    /** Read mode only flags the pages that are not open to everyone. */
    protected restrictedLabel(page: WidgetPage): string | null {
        const options = this.visibilityOptions();
        if (!page.visibility || page.visibility === options[0]?.value) {
            return null;
        }

        return options.find((option) => option.value === page.visibility)?.label ?? null;
    }
}
