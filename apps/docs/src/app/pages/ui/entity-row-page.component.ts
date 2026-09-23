import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EntityRowComponent, type EntityRowFact } from '@bari77/gc-ui';
import { ApiRow, ApiTableComponent } from '../../shared/api-table.component';
import { CodeBlockComponent } from '../../shared/code-block.component';
import { DemoComponent } from '../../shared/demo.component';
import { PageComponent } from '../../shared/page.component';

@Component({
    selector: 'gcd-entity-row-page',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, DemoComponent, ApiTableComponent, CodeBlockComponent, EntityRowComponent],
    styles: `
        .demo-avatar {
            display: grid;
            place-items: center;
            width: 2.75rem;
            height: 2.75rem;
            border-radius: 999px;
            background: color-mix(in srgb, var(--gc-accent, #c8aa6e) 28%, transparent);
            color: #fff;
            font-size: 0.85rem;
            font-weight: 700;
        }

        .demo-list {
            display: grid;
            gap: 0.65rem;
            margin: 0;
            padding: 0;
            list-style: none;
        }
    `,
    template: `
        <gcd-page
            lead="Ligne de rail d'accueil : barre d'accent, visuel projeté, titre, sous-titre optionnel, pastilles et date."
        >
            <p>
                Conçu pour les listes « derniers joueurs / personnages / guildes / équipes ». Le chrome est partagé ;
                chaque remote projette son visuel (avatar, emblème, blason) et, si besoin, des pastilles avec icônes
                via <code>rowFacts</code>.
            </p>

            <gcd-demo title="Joueur" description="Visuel projeté, sous-titre et description." [html]="playerHtml" [bare]="true">
                <ul class="demo-list">
                    <li>
                        <gc-entity-row
                            [link]="['/']"
                            name="Astra#042"
                            subtitle="EUW · Mid"
                            [date]="demoDate"
                            description="Découvrir sa fiche joueur"
                            [descriptionMuted]="true"
                        >
                            <span rowVisual class="demo-avatar" aria-hidden="true">A</span>
                        </gc-entity-row>
                    </li>
                </ul>
            </gcd-demo>

            <gcd-demo
                title="Avec pastilles et niveau"
                description="Les facts textuels passent en entrée ; le badge et le niveau complètent le titre."
                [html]="factsHtml"
                [bare]="true"
            >
                <ul class="demo-list">
                    <li>
                        <gc-entity-row
                            [link]="['/']"
                            accent="#c41e3a"
                            name="Thalindra"
                            subtitle="Priest Discipline"
                            badge="Main"
                            [level]="80"
                            levelLabel="Level"
                            [date]="demoDate"
                            [facts]="facts"
                        >
                            <span rowVisual class="demo-avatar" aria-hidden="true">T</span>
                        </gc-entity-row>
                    </li>
                </ul>
            </gcd-demo>

            <h2>Projection</h2>

            <p>
                Quatre attributs de contenu : <code>rowVisual</code> (obligatoire en pratique),
                <code>rowSubtitleLeading</code> (icônes avant le sous-titre), <code>rowTrailing</code> et
                <code>rowFacts</code> (pastilles riches, éventuellement avec icônes de jeu).
            </p>

            <gcd-code language="html" [code]="projectionSnippet" />

            <h2>API</h2>

            <gcd-api heading="Entrées" [rows]="inputs" />

            <gcd-code language="typescript" label="Type EntityRowFact" [code]="factTypeSnippet" />

            <div class="gcd-note">
                <p>
                    Aucune dépendance Nebular. Les libellés visibles (badge, levelLabel, facts) restent fournis par
                    l'appelant pour garder le contrôle i18n côté remote.
                </p>
            </div>
        </gcd-page>
    `,
})
export class EntityRowPageComponent {
    protected readonly demoDate = new Date('2026-03-12T12:00:00Z');

    protected readonly facts: EntityRowFact[] = [
        { label: 'Blood Elf' },
        { label: 'Hyjal' },
        { label: '650', prefix: 'iLvl' },
        { label: 'Nightfall', accent: true },
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
        { name: 'link', type: 'unknown[]', default: 'required', description: 'RouterLink de la ligne entière.' },
        { name: 'name', type: 'string', default: 'required', description: 'Titre principal.' },
        {
            name: 'accent',
            type: 'string | null',
            default: 'null',
            description: 'Couleur de la barre et du titre ; repli sur --gc-accent.',
        },
        { name: 'subtitle', type: 'string | null', default: 'null', description: 'Ligne sous le nom.' },
        {
            name: 'subtitleMuted',
            type: 'boolean',
            default: 'false',
            description: 'Atténue le sous-titre (ex. « aucune spé »).',
        },
        { name: 'badge', type: 'string | null', default: 'null', description: 'Pastille uppercase à côté du nom.' },
        { name: 'level', type: 'number | null', default: 'null', description: 'Niveau affiché à droite.' },
        {
            name: 'levelLabel',
            type: 'string',
            default: "''",
            description: 'Libellé sr-only associé au niveau.',
        },
        { name: 'date', type: 'Date | null', default: 'null', description: 'Date en bas à droite (mediumDate).' },
        {
            name: 'facts',
            type: 'EntityRowFact[]',
            default: '[]',
            description: 'Pastilles textuelles ; pour des icônes, préférer rowFacts.',
        },
        { name: 'description', type: 'string | null', default: 'null', description: 'Texte clampé sur 2 lignes.' },
        {
            name: 'descriptionMuted',
            type: 'boolean',
            default: 'false',
            description: 'Style atténué pour un CTA de repli.',
        },
    ];
}
