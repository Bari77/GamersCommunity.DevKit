import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { ModalComponent } from './modal.component';

/**
 * Modal offering a choice between a primary commitment and carrying on without it,
 * with an optional opt-out the host application is responsible for persisting.
 */
@Component({
    selector: 'gc-decision-prompt',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ModalComponent],
    template: `
        <gc-modal [open]="open()" [ariaLabel]="heading()" [dismissible]="!busy()" (dismissed)="secondary.emit()">
            <h2 class="gc-decision-prompt__heading">{{ heading() }}</h2>

            @if (message()) {
                <p class="gc-decision-prompt__message">{{ message() }}</p>
            }

            <ng-content />

            @if (optOutLabel()) {
                <label class="gc-decision-prompt__opt-out">
                    <input
                        type="checkbox"
                        [checked]="optOut()"
                        [disabled]="busy()"
                        (change)="onOptOutToggle($event)"
                    />
                    <span>{{ optOutLabel() }}</span>
                </label>
            }

            <div class="gc-decision-prompt__actions">
                <button
                    type="button"
                    class="gc-decision-prompt__button gc-decision-prompt__button--secondary"
                    [disabled]="busy()"
                    (click)="secondary.emit()"
                >
                    {{ secondaryLabel() }}
                </button>
                <button
                    type="button"
                    class="gc-decision-prompt__button gc-decision-prompt__button--primary"
                    [disabled]="busy()"
                    [attr.aria-busy]="busy() ? 'true' : null"
                    (click)="primary.emit()"
                >
                    {{ primaryButtonLabel() }}
                </button>
            </div>
        </gc-modal>
    `,
    styles: [
        `
            .gc-decision-prompt__heading {
                margin: 0 0 0.75rem;
                font-size: 1.25rem;
                font-weight: 600;
            }

            .gc-decision-prompt__message {
                margin: 0 0 1.25rem;
                color: var(--text-hint-color, #8f9bb3);
                line-height: 1.5;
            }

            .gc-decision-prompt__opt-out {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin: 1.25rem 0 0;
                color: var(--text-hint-color, #8f9bb3);
                font-size: 0.85rem;
                cursor: pointer;
            }

            .gc-decision-prompt__opt-out input:disabled {
                cursor: default;
            }

            .gc-decision-prompt__actions {
                display: flex;
                flex-wrap: wrap;
                justify-content: flex-end;
                gap: 0.75rem;
                margin-top: 1.5rem;
            }

            .gc-decision-prompt__button {
                padding: 0.6rem 1.1rem;
                border: 1px solid transparent;
                border-radius: 0.35rem;
                font: inherit;
                font-weight: 600;
                cursor: pointer;
                transition: filter 0.15s ease-out;
            }

            .gc-decision-prompt__button:disabled {
                opacity: 0.6;
                cursor: default;
            }

            .gc-decision-prompt__button:not(:disabled):hover {
                filter: brightness(1.15);
            }

            .gc-decision-prompt__button--primary {
                background: var(--gc-decision-prompt-primary-background, var(--color-primary-500, #3366ff));
                color: var(--gc-decision-prompt-primary-color, #ffffff);
            }

            .gc-decision-prompt__button--secondary {
                border-color: var(--border-basic-color-4, #454d75);
                background: transparent;
                color: var(--text-basic-color, #ffffff);
            }
        `,
    ],
})
export class DecisionPromptComponent {
    public readonly open = input(false);

    public readonly heading = input('');

    public readonly message = input('');

    public readonly primaryLabel = input('');

    public readonly secondaryLabel = input('');

    /** Label of the opt-out checkbox. Leave empty to hide it. */
    public readonly optOutLabel = input('');

    /** Label replacing the primary one while the primary action is running. */
    public readonly busyLabel = input('');

    public readonly busy = input(false);

    public readonly optOut = model(false);

    public readonly primary = output<void>();

    public readonly secondary = output<void>();

    protected readonly primaryButtonLabel = computed(() =>
        this.busy() && this.busyLabel() ? this.busyLabel() : this.primaryLabel(),
    );

    protected onOptOutToggle(event: Event): void {
        this.optOut.set((event.target as HTMLInputElement).checked);
    }
}
