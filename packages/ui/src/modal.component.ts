import { ChangeDetectionStrategy, Component, ElementRef, effect, input, output, viewChild } from '@angular/core';

/** Centred overlay panel hosting arbitrary projected content. */
@Component({
    selector: 'gc-modal',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        @if (open()) {
            <div class="gc-modal__backdrop" (click)="requestClose('backdrop')"></div>
            <div
                #panel
                class="gc-modal__panel"
                role="dialog"
                aria-modal="true"
                tabindex="-1"
                [attr.aria-label]="ariaLabel() || null"
            >
                <ng-content />
            </div>
        }
    `,
    styles: [
        `
            :host {
                display: none;
            }

            :host(.gc-modal--open) {
                display: block;
                position: fixed;
                inset: 0;
                z-index: var(--gc-modal-z-index, 1040);
            }

            .gc-modal__backdrop {
                position: absolute;
                inset: 0;
                background: var(--gc-modal-backdrop, rgb(0 0 0 / 55%));
                backdrop-filter: blur(2px);
            }

            .gc-modal__panel {
                position: relative;
                display: flex;
                flex-direction: column;
                margin: auto;
                top: 50%;
                transform: translateY(-50%);
                width: min(var(--gc-modal-width, 30rem), calc(100vw - 2rem));
                max-height: calc(100vh - 2rem);
                overflow-y: auto;
                padding: var(--gc-modal-padding, 1.75rem);
                border: 1px solid var(--gc-modal-border-color, var(--border-basic-color-3, #323852));
                border-radius: var(--gc-modal-radius, 0.75rem);
                background: var(--gc-modal-background, var(--background-basic-color-1, #1b1b38));
                color: var(--gc-modal-color, var(--text-basic-color, #ffffff));
                box-shadow: var(--gc-modal-shadow, 0 1.5rem 3rem rgb(0 0 0 / 45%));
                animation: gc-modal-appear 0.18s ease-out;
            }

            .gc-modal__panel:focus {
                outline: none;
            }

            @keyframes gc-modal-appear {
                from {
                    opacity: 0;
                    transform: translateY(calc(-50% + 0.75rem));
                }
            }

            @media (prefers-reduced-motion: reduce) {
                .gc-modal__panel {
                    animation: none;
                }
            }
        `,
    ],
    host: {
        '[class.gc-modal--open]': 'open()',
        '(document:keydown.escape)': 'requestClose("escape")',
    },
})
export class ModalComponent {
    public readonly open = input(false);

    public readonly ariaLabel = input('');

    /** Set to false for a blocking modal that only its own actions can close. */
    public readonly dismissible = input(true);

    public readonly dismissed = output<'backdrop' | 'escape'>();

    private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

    public constructor() {
        effect(() => this.panel()?.nativeElement.focus());
    }

    protected requestClose(origin: 'backdrop' | 'escape'): void {
        if (this.open() && this.dismissible()) {
            this.dismissed.emit(origin);
        }
    }
}
