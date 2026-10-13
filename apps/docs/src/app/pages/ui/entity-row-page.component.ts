import { ChangeDetectionStrategy, Component } from "@angular/core";
import { EntityRowComponent, EntityRowFact } from "@bari77/gc-ui";
import { ApiTableComponent } from "../../shared/api-table.component";
import { ApiRow } from "../../shared/api-row.model";
import { CodeBlockComponent } from "../../shared/code-block.component";
import { DemoComponent } from "../../shared/demo.component";
import { PageComponent } from "../../shared/page.component";

@Component({
    selector: "gcd-entity-row-page",
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, DemoComponent, ApiTableComponent, CodeBlockComponent, EntityRowComponent],
    styleUrl: "./entity-row-page.component.scss",
    templateUrl: "./entity-row-page.component.html",
})
export class EntityRowPageComponent {
    protected readonly demoDate = new Date("2026-03-12T12:00:00Z");

    protected readonly facts: EntityRowFact[] = [
        { label: "Blood Elf" },
        { label: "Hyjal" },
        { label: "650", prefix: "iLvl" },
        { label: "Nightfall", accent: true },
    ];

    protected readonly playerHtml = `<gc-entity-row
    [link]="['/league-of-legends/players', player.publicId]"
    [name]="player.handleLabel()"
    [subtitle]="player.riotId()"
    [date]="player.creationDate"
    [description]="cta"
    [descriptionMuted]="true"
>
    <span rowVisual class="avatar">…</span>
</gc-entity-row>`;

    protected readonly factsHtml = `<gc-entity-row
    [link]="link"
    [accent]="character.color"
    [name]="character.pseudo"
    [subtitle]="subtitle"
    [badge]="mainLabel"
    [level]="character.level"
    [levelLabel]="levelLabel"
    [date]="character.creationDate"
    [facts]="facts"
>
    <wow-icon rowVisual kind="class" [slug]="character.className" />
</gc-entity-row>`;

    protected readonly projectionSnippet = `<gc-entity-row …>
    <span rowVisual>…</span>
    <span rowSubtitleLeading>…icons…</span>
    <span rowFacts>
        <span class="gc-entity-row__fact">…</span>
    </span>
</gc-entity-row>`;

    protected readonly factTypeSnippet = `export interface EntityRowFact {
  label: string;
  prefix?: string;  // ex. "iLvl"
  accent?: boolean; // teinte avec --row-accent
}`;

    protected readonly inputs: ApiRow[] = [
        { name: "link", type: "unknown[]", default: "required", description: "RouterLink de la ligne entière." },
        { name: "name", type: "string", default: "required", description: "Titre principal." },
        {
            name: "accent",
            type: "string | null",
            default: "null",
            description: "Couleur de la barre et du titre ; repli sur --gc-accent.",
        },
        { name: "subtitle", type: "string | null", default: "null", description: "Ligne sous le nom." },
        {
            name: "subtitleMuted",
            type: "boolean",
            default: "false",
            description: "Atténue le sous-titre (ex. « aucune spé »).",
        },
        { name: "badge", type: "string | null", default: "null", description: "Pastille uppercase à côté du nom." },
        { name: "level", type: "number | null", default: "null", description: "Niveau affiché à droite." },
        {
            name: "levelLabel",
            type: "string",
            default: "''",
            description: "Libellé sr-only associé au niveau.",
        },
        { name: "date", type: "Date | null", default: "null", description: "Date en bas à droite (mediumDate)." },
        {
            name: "facts",
            type: "EntityRowFact[]",
            default: "[]",
            description: "Pastilles textuelles ; pour des icônes, préférer rowFacts.",
        },
        { name: "description", type: "string | null", default: "null", description: "Texte clampé sur 2 lignes." },
        {
            name: "descriptionMuted",
            type: "boolean",
            default: "false",
            description: "Style atténué pour un CTA de repli.",
        },
    ];
}
