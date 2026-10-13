import { ChangeDetectionStrategy, Component } from "@angular/core";
import { GRIDSTER_RANGE, PACKAGES } from "../../docs.config";
import { CodeBlockComponent } from "../../shared/code-block.component";
import { PageComponent } from "../../shared/page.component";
import { installSnippet, themeStylesSnippet } from "../../shared/snippets";

@Component({
    selector: "gcd-installation",
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, CodeBlockComponent],
    templateUrl: "./installation.component.html",
    styleUrl: "./installation.component.scss",
})
export class InstallationComponent {
    protected readonly packages = PACKAGES;

    protected readonly npmrcSnippet = `${PACKAGES.ui.split("/")[0]}:registry=https://npm.pkg.github.com
# //npm.pkg.github.com/:_authToken=YOUR_GITHUB_PAT`;

    protected readonly installSnippet = installSnippet();

    protected readonly themeSnippet = themeStylesSnippet(["node_modules/@nebular/theme/styles/prebuilt/cosmic.css"]);

    protected readonly usageSnippet = `import { Component } from '@angular/core';
import { SkeletonTextComponent } from '${PACKAGES.ui}';

@Component({
    selector: 'app-player-card',
    standalone: true,
    imports: [SkeletonTextComponent],
    template: \`
        @if (loading()) {
            <gc-skeleton-text [lines]="3" />
        } @else {
            <p>{{ player().biography }}</p>
        }
    \`,
})
export class PlayerCardComponent {}`;

    protected readonly gridsterSnippet = `npm install "angular-gridster2@${GRIDSTER_RANGE}"`;
}
