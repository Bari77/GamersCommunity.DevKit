import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Placeholder standing in for an interaction the visitor cannot reach yet,
 * inviting them to take the step that unlocks it.
 */
@Component({
    selector: 'gc-create-wall',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="gc-create-wall__text">
            @if (heading()) {
                <p class="gc-create-wall__heading">{{ heading() }}</p>
            }
            @if (message()) {
                <p class="gc-create-wall__message">{{ message() }}</p>
            }
            <ng-content />
        </div>

        @if (actionLabel()) {
            <button
                type="button"
                class="gc-create-wall__action"
                [disabled]="busy()"
                [attr.aria-busy]="busy() ? 'true' : null"
                (click)="action.emit()"
            >
                {{ actionLabel() }}
            </button>
        }
    `,
    styles: [
        `
            :host {
                display: flex;
                gap: 1rem;
                padding: var(--gc-create-wall-padding, 1.25rem);
                border: 1px dashed var(--gc-create-wall-border-color, var(--border-basic-color-4, #454d75));
                border-radius: var(--gc-create-wall-radius, 0.6rem);
                background: var(--gc-create-wall-background, color-mix(in srgb, var(--background-basic-color-2, #222b45) 65%, transparent));
            }

            :host(.gc-create-wall--block) {
                flex-direction: column;
                align-items: center;
                text-align: center;
            }

            :host(.gc-create-wall--inline) {
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                flex-wrap: wrap;
            }

            .gc-create-wall__text {
                display: flex;
                flex-direction: column;
                gap: 0.35rem;
            }

            .gc-create-wall__heading {
                margin: 0;
                font-weight: 600;
                color: var(--text-basic-color, #ffffff);
            }

            .gc-create-wall__message {
                margin: 0;
                color: var(--text-hint-color, #8f9bb3);
                font-size: 0.875rem;
                line-height: 1.45;
            }

            .gc-create-wall__action {
                flex-shrink: 0;
                padding: 0.55rem 1.05rem;
                border: none;
                border-radius: 0.35rem;
                background: var(--gc-create-wall-action-background, var(--color-primary-500, #3366ff));
                color: var(--gc-create-wall-action-color, #ffffff);
                font: inherit;
                font-weight: 600;
                cursor: pointer;
                transition: filter 0.15s ease-out;
            }

            .gc-create-wall__action:disabled {
                opacity: 0.6;
                cursor: default;
            }

            .gc-create-wall__action:not(:disabled):hover {
                filter: brightness(1.15);
            }
        `,
    ],
    host: {
        '[class.gc-create-wall--block]': 'variant() === "block"',
        '[class.gc-create-wall--inline]': 'variant() === "inline"',
    },
})
export class CreateWallComponent {
    public readonly heading = input('');

    public readonly message = input('');

    /** Label of the unlocking action. Leave empty to show the invitation without a button. */
    public readonly actionLabel = input('');

    public readonly busy = input(false);

    public readonly variant = input<'block' | 'inline'>('block');

    public readonly action = output<void>();
}
