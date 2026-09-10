import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocsCard } from '../docs.config';

/** Grid of links into other documentation pages, fed straight from the docs tree. */
@Component({
    selector: 'gcd-card-grid',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink],
    template: `
        <div class="gcd-cards">
            @for (card of cards(); track card.link) {
                <a class="gcd-card" [routerLink]="card.link">
                    <h3>{{ card.title }}</h3>
                    <p>{{ card.description }}</p>
                </a>
            }
        </div>
    `,
})
export class CardGridComponent {
    public readonly cards = input.required<DocsCard[]>();
}
