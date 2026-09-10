import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Grey shimmering placeholder standing in for a piece of content still being loaded. */
@Component({
    selector: 'gc-skeleton',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './skeleton.component.html',
    styleUrl: './skeleton.component.scss',
    host: {
        '[class.gc-skeleton--circle]': 'shape() === "circle"',
        '[style.width]': 'width()',
        '[style.height]': 'height()',
        '[style.border-radius]': 'shape() === "circle" ? "50%" : radius()',
        '[attr.aria-hidden]': 'true',
    },
})
export class SkeletonComponent {
    public readonly width = input('100%');

    public readonly height = input('1rem');

    public readonly radius = input('0.25rem');

    public readonly shape = input<'rect' | 'circle'>('rect');
}
