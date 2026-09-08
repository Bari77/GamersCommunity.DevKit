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
import { GcGalleryItem, videoEmbedUrl } from '../media';

@Component({
    selector: 'gc-media-gallery',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        @if (items().length === 0) {
            <p class="gc-gallery__empty">{{ emptyLabel() }}</p>
        } @else if (kind() === 'video') {
            <div class="gc-gallery gc-gallery--video">
                @for (video of videos(); track video.url) {
                    <figure class="gc-gallery__cell">
                        @if (video.embed; as embed) {
                            <iframe
                                class="gc-gallery__frame"
                                [src]="embed"
                                [title]="video.title"
                                allowfullscreen
                                referrerpolicy="strict-origin"
                            ></iframe>
                        } @else {
                            <video class="gc-gallery__frame" [src]="video.url" controls preload="metadata"></video>
                        }
                        @if (video.title) {
                            <figcaption>{{ video.title }}</figcaption>
                        }
                    </figure>
                }
            </div>
        } @else {
            <div class="gc-gallery gc-gallery--photo">
                @for (photo of items(); track photo.url) {
                    <button type="button" class="gc-gallery__thumb" (click)="open(photo)">
                        <img [src]="photo.thumbnailUrl || photo.url" [alt]="photo.title || ''" loading="lazy" />
                    </button>
                }
            </div>

            @if (zoomed(); as photo) {
                <div #lightbox class="gc-gallery__lightbox" role="dialog" (click)="close()">
                    <img [src]="photo.url" [alt]="photo.title || ''" />
                    @if (photo.title) {
                        <p>{{ photo.title }}</p>
                    }
                </div>
            }
        }
    `,
    styles: [
        `
            :host {
                display: block;
            }
            .gc-gallery {
                display: grid;
                gap: 0.6rem;
                margin: 0;
            }
            .gc-gallery--photo {
                grid-template-columns: repeat(auto-fill, minmax(7rem, 1fr));
            }
            .gc-gallery--video {
                grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
            }
            .gc-gallery__thumb {
                padding: 0;
                border: 0;
                border-radius: 0.5rem;
                overflow: hidden;
                cursor: zoom-in;
                background: none;
                aspect-ratio: 1;
            }
            .gc-gallery__thumb img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
            }
            .gc-gallery__cell {
                margin: 0;
            }
            .gc-gallery__frame {
                width: 100%;
                aspect-ratio: 16 / 9;
                border: 0;
                border-radius: 0.5rem;
                background: #000;
            }
            .gc-gallery__cell figcaption {
                margin-top: 0.35rem;
                font-size: 0.8rem;
                opacity: 0.7;
            }
            .gc-gallery__empty {
                margin: 0;
                font-size: 0.9rem;
                opacity: 0.6;
            }
            .gc-gallery__lightbox {
                position: fixed;
                inset: 0;
                z-index: 1050;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 0.75rem;
                padding: 2rem;
                background: rgba(0, 0, 0, 0.85);
                cursor: zoom-out;
            }
            .gc-gallery__lightbox img {
                max-width: 100%;
                max-height: 85%;
                object-fit: contain;
            }
        `,
    ],
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
