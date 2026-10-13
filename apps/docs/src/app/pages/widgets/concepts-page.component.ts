import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { pageCards } from "../../docs.config";
import { CardGridComponent } from "../../shared/card-grid.component";
import { CodeBlockComponent } from "../../shared/code-block.component";
import { PageComponent } from "../../shared/page.component";

@Component({
    selector: "gcd-concepts-page",
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, CodeBlockComponent, CardGridComponent, RouterLink],
    templateUrl: "./concepts-page.component.html",
    styleUrl: "./concepts-page.component.scss",
})
export class ConceptsPageComponent {
    protected readonly cards = pageCards("widgets");

    protected readonly modelSnippet = `interface WidgetWorkspace {
    version: number;
    pages: WidgetPage[];
}

interface WidgetPage {
    id: string;
    title: string;
    icon?: string;
    /** Une page verrouillée ne peut être ni renommée ni supprimée. */
    locked?: boolean;
    widgets: WidgetInstance[];
}

interface WidgetInstance {
    id: string;
    type: string;
    x: number;
    y: number;
    cols: number;
    rows: number;
    settings: Record<string, unknown>;
}`;

    protected readonly defSnippet = `<gc-widget-workspace [workspace]="workspace()" [catalog]="catalog">
    <ng-template gcWidget="links" let-settings let-instance="instance">
        <gc-link-list [links]="asLinks(settings['links'])" />
    </ng-template>
</gc-widget-workspace>`;

    protected readonly editableSnippet = `<ng-template
    gcWidget="notes"
    gcWidgetEditable
    let-settings
    let-editingData="editingData"
    let-stopDataEdit="stopDataEdit"
>
    @if (editingData) {
        <textarea [value]="settings['body']" (change)="save($event); stopDataEdit()"></textarea>
    } @else {
        <p>{{ settings['body'] }}</p>
    }
</ng-template>`;
}
