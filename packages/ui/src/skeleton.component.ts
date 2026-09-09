import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Grey shimmering placeholder standing in for a piece of content still being loaded. */
@Component({
    selector: 'gc-skeleton',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<span class="gc-skeleton__shimmer"></span>`,
    styles: [
        `
            :host {
                display: inline-block;
                position: relative;
                overflow: hidden;
                vertical-align: middle;
                flex-shrink: 0;
                background: var(
                    --gc-skeleton-background,
                    color-mix(in srgb, var(--background-basic-color-3, #262b3f) 80%, transparent)
                );
            }

            .gc-skeleton__shimmer {
                position: absolute;
                inset: 0;
                transform: translateX(-100%);
                background: linear-gradient(
                    90deg,
                    transparent 0%,
                    var(
                            --gc-skeleton-highlight,
                            color-mix(in srgb, var(--background-basic-color-4, #323852) 55%, transparent)
                        )
                        50%,
                    transparent 100%
                );
                animation: gc-skeleton-shimmer 1.4s ease-in-out infinite;
            }

            @keyframes gc-skeleton-shimmer {
                100% {
                    transform: translateX(100%);
                }
            }

            @media (prefers-reduced-motion: reduce) {
                .gc-skeleton__shimmer {
                    animation: none;
                }
            }
        `,
    ],
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
