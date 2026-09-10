import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CodeBlockComponent } from './code-block.component';

/** Common page frame: eyebrow, title, lead sentence and optional import snippet. */
@Component({
    selector: 'gcd-page',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CodeBlockComponent],
    templateUrl: './page.component.html',
    styleUrl: './page.component.scss',
})
export class PageComponent {
    public readonly eyebrow = input('');

    public readonly heading = input.required<string>();

    public readonly lead = input('');

    public readonly selector = input('');

    public readonly importSnippet = input('');
}
