import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BreadcrumbComponent } from '@bari77/gc-ui';
import { DOCS_VERSION, docsNav, REPOSITORY_URL, SITE_NAME } from './docs.config';

@Component({
    selector: 'gcd-root',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterOutlet, RouterLink, RouterLinkActive, BreadcrumbComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {
    protected readonly groups = docsNav;
    protected readonly version = DOCS_VERSION;
    protected readonly repository = REPOSITORY_URL;
    protected readonly siteName = SITE_NAME;
    protected readonly menuOpen = signal(false);

    protected toggleMenu(): void {
        this.menuOpen.update((open) => !open);
    }

    protected closeMenu(): void {
        this.menuOpen.set(false);
    }
}
