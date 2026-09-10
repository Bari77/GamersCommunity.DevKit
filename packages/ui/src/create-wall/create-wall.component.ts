import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Placeholder standing in for an interaction the visitor cannot reach yet,
 * inviting them to take the step that unlocks it.
 */
@Component({
    selector: 'gc-create-wall',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './create-wall.component.html',
    styleUrl: './create-wall.component.scss',
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
