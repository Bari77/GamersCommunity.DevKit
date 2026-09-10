import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SkeletonComponent } from '../skeleton/skeleton.component';

/** Stack of skeleton lines standing in for a paragraph or a block of labels. */
@Component({
    selector: 'gc-skeleton-text',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [SkeletonComponent],
    templateUrl: './skeleton-text.component.html',
    styleUrl: './skeleton-text.component.scss',
    host: {
        '[style.--gc-skeleton-text-gap]': 'gap()',
        '[attr.aria-hidden]': 'true',
    },
})
export class SkeletonTextComponent {
    public readonly lines = input(3);

    public readonly lineHeight = input('0.9rem');

    public readonly gap = input('0.5rem');

    public readonly radius = input('0.25rem');

    /** Width of the last line, shorter by default so the block reads like real text. */
    public readonly lastLineWidth = input('60%');

    protected readonly lineIndexes = computed(() =>
        Array.from({ length: Math.max(1, this.lines()) }, (_unused, index) => index),
    );

    protected widthOf(index: number): string {
        return index === this.lineIndexes().length - 1 ? this.lastLineWidth() : '100%';
    }
}
