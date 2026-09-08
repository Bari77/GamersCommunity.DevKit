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
    template: `
        @if (editing()) {
            <button type="button" class="gc-widget-bar__button" [disabled]="saving()" (click)="onCancel()">
                {{ cancelLabel() }}
            </button>
            <button
                type="button"
                class="gc-widget-bar__button gc-widget-bar__button--primary"
                [disabled]="saving()"
                (click)="save.emit()"
            >
                {{ saveLabel() }}
            </button>
        } @else {
            <button type="button" class="gc-widget-bar__button" (click)="editing.set(true)">
                {{ editLabel() }}
            </button>
        }
    `,
    styles: [
        `
            :host {
                display: inline-flex;
                gap: 0.5rem;
            }

            .gc-widget-bar__button {
                padding: 0.4rem 0.9rem;
                border: 1px solid var(--gc-widget-border, rgba(255, 255, 255, 0.18));
                border-radius: var(--gc-widget-radius, 0.5rem);
                background: transparent;
                color: inherit;
                font: inherit;
                cursor: pointer;
            }

            .gc-widget-bar__button:disabled {
                cursor: default;
                opacity: 0.5;
            }

            .gc-widget-bar__button--primary {
                border-color: transparent;
                background: var(--gc-widget-accent, #3366ff);
                color: var(--gc-widget-accent-contrast, #fff);
            }
        `,
    ],
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
