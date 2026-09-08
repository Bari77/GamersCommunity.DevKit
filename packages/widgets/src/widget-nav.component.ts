import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { WidgetPage } from './workspace';

export interface WidgetPageRename {
    id: string;
    title: string;
}

export interface WidgetPageMove {
    id: string;
    offset: number;
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

    public readonly select = output<string>();

    public readonly add = output<void>();

    public readonly remove = output<string>();

    public readonly rename = output<WidgetPageRename>();

    public readonly move = output<WidgetPageMove>();

    protected onRename(id: string, event: Event): void {
        const title = (event.target as HTMLInputElement).value.trim();
        if (title) {
            this.rename.emit({ id, title });
        }
    }
}
