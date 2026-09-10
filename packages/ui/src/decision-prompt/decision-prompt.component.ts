import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';

/**
 * Modal offering a choice between a primary commitment and carrying on without it,
 * with an optional opt-out the host application is responsible for persisting.
 */
@Component({
    selector: 'gc-decision-prompt',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ModalComponent],
    templateUrl: './decision-prompt.component.html',
    styleUrl: './decision-prompt.component.scss',
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
