import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DocsPageData } from '../app.routes';
import { CodeBlockComponent } from './code-block.component';

/**
 * Common page frame. The eyebrow, title and documented selector come from the route so they stay in
 * step with the sidebar and the breadcrumb; only the prose belongs to the page itself.
 */
@Component({
    selector: 'gcd-page',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CodeBlockComponent],
    templateUrl: './page.component.html',
    styleUrl: './page.component.scss',
})
export class PageComponent {
    public readonly lead = input('');

    protected readonly head: DocsPageData = inject(ActivatedRoute).snapshot.data['docs'];
}
