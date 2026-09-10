import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';

/**
 * `Edit` on its own, swapped for `Cancel` + `Save` once editing starts.
 *
 * Cancel leaves edit mode immediately; Save only emits, so the host stays in edit
 * mode (with `saving` on) until persistence succeeds and it clears `editing`.
 */
@Component({
    selector: 'gc-widget-edit-bar',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './widget-edit-bar.component.html',
    styleUrl: './widget-edit-bar.component.scss',
})
export class WidgetEditBarComponent {
    public readonly editing = model(false);

    public readonly saving = input(false);

    public readonly editLabel = input('Edit');

    public readonly cancelLabel = input('Cancel');

    public readonly saveLabel = input('Save');

    public readonly save = output<void>();

    public readonly cancel = output<void>();

    protected onCancel(): void {
        this.editing.set(false);
        this.cancel.emit();
    }
}
