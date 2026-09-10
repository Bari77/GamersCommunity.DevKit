import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    ElementRef,
    inject,
    input,
    signal,
    viewChild,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { GcGalleryItem, videoEmbedUrl } from '../../media';

@Component({
    selector: 'gc-media-gallery',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './media-gallery.component.html',
    styleUrl: './media-gallery.component.scss',
})
export class MediaGalleryComponent {
    public readonly items = input<GcGalleryItem[]>([]);

    public readonly kind = input<'photo' | 'video'>('photo');

    public readonly emptyLabel = input('Nothing here yet.');

    protected readonly zoomed = signal<GcGalleryItem | null>(null);

    private readonly lightbox = viewChild<ElementRef<HTMLElement>>('lightbox');
    private readonly sanitizer = inject(DomSanitizer);

    protected readonly videos = computed(() =>
        this.items().map((item) => {
            const embed = videoEmbedUrl(item.url);
            return {
                url: item.url,
                title: item.title ?? '',
                embed: embed ? (this.sanitizer.bypassSecurityTrustResourceUrl(embed) as SafeResourceUrl) : null,
            };
        }),
    );

    public constructor() {
        // A gridster item is `transform`ed, which would anchor a fixed-position
        // overlay to the widget instead of the viewport.
        effect(() => {
            const element = this.lightbox()?.nativeElement;
            if (element && element.parentElement !== document.body) {
                document.body.appendChild(element);
            }
        });
    }

    protected open(item: GcGalleryItem): void {
        this.zoomed.set(item);
    }

    protected close(): void {
        this.zoomed.set(null);
    }
}
