import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import DOMPurify from 'dompurify';
import { RICH_HTML_PURIFY_CONFIG } from './rich-html.utils';

/** Renders server-sanitized HTML with a client-side DOMPurify pass. */
@Component({
    selector: 'gc-rich-content',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<div class="gc-rich-content" [innerHTML]="safeHtml()"></div>`,
    styleUrl: './rich-content.component.scss',
    /* innerHTML children are inserted outside Angular, so an emulated scope would never reach them. */
    encapsulation: ViewEncapsulation.None,
})
export class RichContentComponent {
    public readonly html = input<string | null>(null);

    private readonly domSanitizer = inject(DomSanitizer);

    protected readonly safeHtml = computed((): SafeHtml => {
        const raw = this.html() ?? '';
        const clean = DOMPurify.sanitize(raw, RICH_HTML_PURIFY_CONFIG);
        return this.domSanitizer.bypassSecurityTrustHtml(clean);
    });
}
