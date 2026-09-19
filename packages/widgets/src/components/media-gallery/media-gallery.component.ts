import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    ElementRef,
    inject,
    input,
    output,
    signal,
    untracked,
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

    /** In-place editor: draft the list, then save or cancel. */
    public readonly editing = input(false);

    public readonly addLabel = input('Add');

    public readonly saveLabel = input('Save');

    public readonly cancelLabel = input('Cancel');

    public readonly removeLabel = input('Remove');

    public readonly moveUpLabel = input('Move up');

    public readonly moveDownLabel = input('Move down');

    public readonly titlePlaceholder = input('Caption');

    public readonly urlPlaceholder = input('https://…');

    public readonly itemsChange = output<GcGalleryItem[]>();

    public readonly cancel = output<void>();

    protected readonly zoomed = signal<GcGalleryItem | null>(null);
    protected readonly draft = signal<GcGalleryItem[]>([]);
    protected readonly draftTitle = signal('');
    protected readonly draftUrl = signal('');

    protected readonly canAdd = computed(() => this.draftUrl().trim().length > 0);

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

        effect(() => {
            const editing = this.editing();
            untracked(() => {
                if (editing) {
                    this.draft.set(this.items().map((item) => ({ ...item })));
                    this.draftTitle.set('');
                    this.draftUrl.set('');
                    this.zoomed.set(null);
                }
            });
        });
    }

    protected inputValue(event: Event): string {
        return (event.target as HTMLInputElement).value;
    }

    protected add(event: Event): void {
        event.preventDefault();
        const url = this.draftUrl().trim();
        if (!url) {
            return;
        }

        const title = this.draftTitle().trim();
        this.draft.update((rows) => [...rows, { url, title: title || null }]);
        this.draftTitle.set('');
        this.draftUrl.set('');
    }

    protected editRow(index: number, key: 'title' | 'url', event: Event): void {
        const value = (event.target as HTMLInputElement).value.trim();
        this.draft.update((rows) =>
            rows.map((row, position) => (position === index ? { ...row, [key]: value } : row)),
        );
    }

    protected moveRow(index: number, offset: number): void {
        const target = index + offset;
        this.draft.update((rows) => {
            if (target < 0 || target >= rows.length) {
                return rows;
            }

            const next = [...rows];
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });
    }

    protected removeRow(index: number): void {
        this.draft.update((rows) => rows.filter((_, position) => position !== index));
    }

    protected commit(): void {
        this.itemsChange.emit(this.draft().filter((row) => row.url.trim().length > 0));
    }

    protected open(item: GcGalleryItem): void {
        this.zoomed.set(item);
    }

    protected close(): void {
        this.zoomed.set(null);
    }
}
