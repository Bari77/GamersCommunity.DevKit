import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DOCS_VERSION, REPOSITORY_URL } from '../../docs.config';
import { KIND_LABELS, releases } from '../../releases';
import { PageComponent } from '../../shared/page.component';

@Component({
    selector: 'gcd-releases-page',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent],
    templateUrl: './releases-page.component.html',
    styleUrl: './releases-page.component.scss',
})
export class ReleasesPageComponent {
    protected readonly releases = releases;
    protected readonly kindLabels = KIND_LABELS;
    protected readonly current = DOCS_VERSION;
    protected readonly repository = REPOSITORY_URL;
}
